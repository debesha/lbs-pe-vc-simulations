import { CalculationInput, CashEvent, PerformanceResult, VCConfig } from '../types'

const EXIT_YEARS = Array.from({ length: 11 }, (_, idx) => idx + 5) // 5-15

const ZERO_RESULT: PerformanceResult = {
  cashFlows: [0],
  netMultiple: 0,
  netIrr: null,
  grossIrr: null,
  feeDrag: 0,
  netValue: 0,
  totalFees: 0,
  grossMultiple: 0,
  cashEvents: [],
}

const parseFundTermYears = (term: string) => {
  const matches = term.match(/\d+/g)
  if (!matches) return 10
  return matches.map(Number).reduce((sum, val) => sum + val, 0)
}

const calculateIRR = (cashFlows: number[]) => {
  let rate = 0.1
  const maxIterations = 100
  const precision = 1e-7

  const npv = (r: number) => cashFlows.reduce((sum, cf, year) => sum + cf / Math.pow(1 + r, year), 0)

  for (let i = 0; i < maxIterations; i++) {
    const fValue = npv(rate)
    const derivative = cashFlows.reduce(
      (sum, cf, year) => sum - (year * cf) / Math.pow(1 + rate, year + 1),
      0,
    )

    if (Math.abs(derivative) < precision) break

    const newRate = rate - fValue / derivative
    if (Math.abs(newRate - rate) < precision) {
      return newRate
    }
    rate = newRate
  }

  return null
}

const calculateFundPerformance = ({
  allocation,
  grossMultiple,
  exitYear,
  config,
}: CalculationInput): PerformanceResult => {
  if (allocation <= 0) {
    return {
      ...ZERO_RESULT,
      grossMultiple,
    }
  }

  const totalTermYears = parseFundTermYears(config.fund_terms_years)
  const totalYears = Math.max(exitYear, totalTermYears)
  const cashFlows = Array(totalYears + 1).fill(0)
  const investmentYears = 6
  const estFeeRate = (config.fund_establishment_fee_percent_of_committed_capital ?? 0) / 100
  const mgmtFeeRate = (config.management_fees_percent ?? 0) / 100
  const prefRate = (config.preferred_return_percent ?? 0) / 100
  const carriedStructure = (config as VCConfig).carried_interest_structure
  const carriedInterestPercent =
    'carried_interest_percent' in config && config.carried_interest_percent !== null
      ? (config.carried_interest_percent ?? 0) / 100
      : carriedStructure
        ? carriedStructure.base_carried_interest_percent / 100
        : 0

  const cashEvents: CashEvent[] = []

  if (estFeeRate > 0) {
    const establishmentFee = allocation * estFeeRate
    cashFlows[0] -= establishmentFee
    cashEvents.push({
      label: 'Establishment fees (Year 0)',
      amount: -establishmentFee,
      percent: config.fund_establishment_fee_percent_of_committed_capital,
      year: 0,
    })
  }

  const drawAmount = allocation / investmentYears
  for (let year = 1; year <= investmentYears; year++) {
    cashFlows[year] -= drawAmount
    cashEvents.push({
      label: `Capital called (Year ${year})`,
      amount: -drawAmount,
      year,
    })
  }

  let managementFeesTotal = 0
  if (mgmtFeeRate > 0) {
    // Management fees charged up to exit year or fund term, whichever comes first
    const managementFeeYears = Math.min(exitYear, totalTermYears)
    for (let year = 1; year <= managementFeeYears; year++) {
      const fee = allocation * mgmtFeeRate
      cashFlows[year] -= fee
      managementFeesTotal += fee
      cashEvents.push({
        label: `Management fees (Year ${year})`,
        amount: -fee,
        percent: config.management_fees_percent,
        year,
      })
    }
  }

  const investedCapital = allocation
  const grossValue = investedCapital * grossMultiple
  const yearsHeld = exitYear
  const prefReturn = prefRate > 0 ? investedCapital * Math.pow(1 + prefRate, yearsHeld) - investedCapital : 0
  const profit = Math.max(0, grossValue - investedCapital)

  let appliedCarryRate = carriedInterestPercent
  if (carriedStructure) {
    appliedCarryRate =
      grossMultiple > carriedStructure.base_threshold_net_multiple
        ? carriedStructure.higher_carried_interest_percent / 100
        : carriedStructure.base_carried_interest_percent / 100
  }

  const carry = profit > prefReturn ? (profit - prefReturn) * appliedCarryRate : 0
  const lpDistribution = grossValue - carry
  if (carry > 0) {
    const carryPercent = appliedCarryRate * 100
    cashEvents.push({
      label: `Carry (Year ${exitYear})`,
      amount: -carry,
      percent: carryPercent,
      year: exitYear,
    })
  }

  if (exitYear < cashFlows.length) {
    cashFlows[exitYear] += lpDistribution
  } else {
    cashFlows.push(lpDistribution)
  }
  cashEvents.push({
    label: `Distributions (Year ${exitYear})`,
    amount: lpDistribution,
    year: exitYear,
  })

  const netOut = cashFlows.reduce((sum, value) => (value < 0 ? sum - value : sum), 0)
  const netIn = cashFlows.reduce((sum, value) => (value > 0 ? sum + value : sum), 0)
  const netMultiple = netOut === 0 ? 0 : netIn / netOut
  const irr = calculateIRR(cashFlows)

  // Calculate gross IRR: capital calls over years 1-6, exit at exitYear with grossMultiple
  const grossCashFlows = Array(Math.max(exitYear, investmentYears) + 1).fill(0)
  // drawAmount already calculated above
  for (let year = 1; year <= investmentYears; year++) {
    grossCashFlows[year] -= drawAmount
  }
  if (exitYear < grossCashFlows.length) {
    grossCashFlows[exitYear] += grossValue
  } else {
    grossCashFlows.push(grossValue)
  }
  const grossIrr = calculateIRR(grossCashFlows)

  const establishmentFeesTotal = estFeeRate * allocation
  const totalFees = managementFeesTotal + establishmentFeesTotal + carry
  const feeDrag = grossMultiple - netMultiple

  return {
    cashFlows,
    netMultiple,
    netIrr: irr,
    grossIrr,
    feeDrag,
    netValue: lpDistribution - totalFees,
    totalFees,
    grossMultiple,
    cashEvents,
  }
}

const combineCashFlows = (flows: number[][]) => {
  const maxLength = Math.max(...flows.map((flow) => flow.length))
  return Array.from({ length: maxLength }, (_, year) =>
    flows.reduce((sum, flow) => sum + (flow[year] ?? 0), 0),
  )
}

const clampValue = (value: number, maxValue: number) => Math.max(0, Math.min(value, maxValue))
const safeNumber = (value: number) => (Number.isFinite(value) ? value : 0)

const redistributeFromBuyout = (
  buyout: number,
  vc: number,
  buyoutCap: number,
  vcCap: number,
) => {
  const trimmedBuyout = Math.min(buyout, buyoutCap)
  let redistributedVc = vc
  if (buyout > buyoutCap) {
    const excess = buyout - buyoutCap
    const vcHeadroom = vcCap - redistributedVc
    const vcTopUp = Math.min(vcHeadroom, excess)
    redistributedVc += vcTopUp
  }
  return {
    buyout: trimmedBuyout,
    vc: redistributedVc,
  }
}

const formatMillions = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'decimal', maximumFractionDigits: 1 }).format(value)

const formatPercent = (value: number | null, digits = 1) => {
  if (value === null || Number.isNaN(value)) return '–'
  return `${(value * 100).toFixed(digits)}%`
}

const formatSignedMillions = (value: number) => {
  const sign = value >= 0 ? '+' : '−'
  return `${sign}€${formatMillions(Math.abs(value))}m`
}

const ZERO_RESULT_EXPORT: PerformanceResult = ZERO_RESULT

export {
  EXIT_YEARS,
  ZERO_RESULT_EXPORT as ZERO_RESULT,
  calculateIRR,
  calculateFundPerformance,
  combineCashFlows,
  clampValue,
  formatMillions,
  formatPercent,
  formatSignedMillions,
  redistributeFromBuyout,
  safeNumber,
}

