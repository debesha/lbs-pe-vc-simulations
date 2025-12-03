import { useEffect, useMemo, useState } from 'react'
import { schrodersParameters } from './data/parameters'
import './App.css'
import { FundConfig, VCConfig } from './types'
import {
  calculateFundPerformance,
  calculateIRR,
  clampValue,
  combineCashFlows,
  redistributeFromBuyout,
  safeNumber,
} from './utils/calculations'
import InputsPanel from './components/InputsPanel'
import FundColumns from './components/FundColumns'
import BlendedPanel from './components/BlendedPanel'
import CaseReference from './components/CaseReference'

const fundMap = schrodersParameters.funds.reduce<Record<string, FundConfig>>((acc, fund) => {
  acc[fund.name] = fund
  return acc
}, {})

const buyoutConfig = fundMap['European Buyout (Main Fund)']
const coInvestConfig = fundMap['European Buyout (Co-Investment Fund Vehicle)']
const vcConfig = fundMap['European VC Fund'] as VCConfig

const BUYOUT_CAP = buyoutConfig.target_fund_size_eur_millions
const VC_CAP = vcConfig.target_fund_size_eur_millions
const CO_INVEST_CAP = coInvestConfig?.target_fund_size_eur_millions ?? 0

const CO_INVEST_RATIO =
  coInvestConfig && buyoutConfig
    ? coInvestConfig.target_fund_size_eur_millions / buyoutConfig.target_fund_size_eur_millions
    : 0.2

const CO_INVEST_DISABLED_MESSAGE = 'Entire allocation stays in the main buyout fund.'

function App() {
  const [totalCapital, setTotalCapital] = useState(1300)
  const [buyoutAllocation, setBuyoutAllocation] = useState(1200)
  const [vcAllocation, setVcAllocation] = useState(100)
  const [buyoutMultiple, setBuyoutMultiple] = useState(buyoutConfig.expected_gross_return_on_investments_multiple)
  const [vcMultiple, setVcMultiple] = useState(vcConfig.expected_gross_return_on_investments_multiple)
  const [buyoutExitYear, setBuyoutExitYear] = useState(10)
  const [vcExitYear, setVcExitYear] = useState(10)
  const [includeCoInvest, setIncludeCoInvest] = useState(true)

  const currentBuyoutCap = includeCoInvest ? BUYOUT_CAP + CO_INVEST_CAP : BUYOUT_CAP

  const buyoutMainFraction = includeCoInvest ? 1 / (1 + CO_INVEST_RATIO) : 1
  const coInvestFraction = includeCoInvest ? CO_INVEST_RATIO / (1 + CO_INVEST_RATIO) : 0

  const buyoutMainAllocation = useMemo(
    () => buyoutAllocation * buyoutMainFraction,
    [buyoutAllocation, buyoutMainFraction],
  )

  const coInvestAllocation = useMemo(
    () => (includeCoInvest ? buyoutAllocation * coInvestFraction : 0),
    [buyoutAllocation, includeCoInvest, coInvestFraction],
  )

  const buyoutResults = useMemo(
    () =>
      calculateFundPerformance({
        allocation: buyoutMainAllocation,
        grossMultiple: buyoutMultiple,
        exitYear: buyoutExitYear,
        config: buyoutConfig,
      }),
    [buyoutMainAllocation, buyoutMultiple, buyoutExitYear],
  )

  const coInvestResults = useMemo(
    () =>
      calculateFundPerformance({
        allocation: coInvestAllocation,
        grossMultiple: buyoutMultiple,
        exitYear: buyoutExitYear,
        config: coInvestConfig,
      }),
    [coInvestAllocation, buyoutMultiple, buyoutExitYear],
  )

  const vcResults = useMemo(
    () =>
      calculateFundPerformance({
        allocation: vcAllocation,
        grossMultiple: vcMultiple,
        exitYear: vcExitYear,
        config: vcConfig,
      }),
    [vcAllocation, vcMultiple, vcExitYear],
  )

  const totalAllocated = buyoutAllocation + vcAllocation
  const unallocatedCapital = Math.max(0, totalCapital - totalAllocated)
  const longestHorizon = Math.max(buyoutExitYear, vcExitYear)

  const idleCashFlows = useMemo(() => {
    if (unallocatedCapital <= 0) return [0]
    const flows = Array(longestHorizon + 1).fill(0)
    flows[0] = -unallocatedCapital
    flows[longestHorizon] += unallocatedCapital
    return flows
  }, [unallocatedCapital, longestHorizon])

  const idleCashEvents = useMemo(() => {
    if (unallocatedCapital <= 0) return []
    return [
      {
        label: 'Idle cash — retained (Year 0)',
        amount: -unallocatedCapital,
        year: 0,
      },
      {
        label: `Idle cash — released (Year ${longestHorizon})`,
        amount: unallocatedCapital,
        year: longestHorizon,
      },
    ]
  }, [unallocatedCapital, longestHorizon])

  const blended = useMemo(() => {
    const mergedFlows = combineCashFlows([
      buyoutResults.cashFlows,
      coInvestResults.cashFlows,
      vcResults.cashFlows,
      idleCashFlows,
    ])
    const netOut = mergedFlows.reduce((sum, value) => (value < 0 ? sum - value : sum), 0)
    const netIn = mergedFlows.reduce((sum, value) => (value > 0 ? sum + value : sum), 0)
    const netMultiple = netOut === 0 ? 0 : netIn / netOut
    const netIrr = calculateIRR(mergedFlows)
    const totalFees = buyoutResults.totalFees + coInvestResults.totalFees + vcResults.totalFees
    const blendedCashEvents = [
      ...buyoutResults.cashEvents.map((event) => ({ ...event, label: `Buyout — ${event.label}` })),
      ...coInvestResults.cashEvents.map((event) => ({ ...event, label: `Co-invest — ${event.label}` })),
      ...vcResults.cashEvents.map((event) => ({ ...event, label: `VC — ${event.label}` })),
      ...idleCashEvents,
    ].sort((a, b) => {
      const yearA = a.year ?? 9999
      const yearB = b.year ?? 9999
      if (yearA !== yearB) return yearA - yearB
      // If same year, sort by amount (outflows first, then inflows)
      return a.amount - b.amount
    })

    return {
      netMultiple,
      netIrr,
      totalFees,
      netValue: netIn - netOut,
      cashEvents: blendedCashEvents,
    }
  }, [buyoutResults, coInvestResults, vcResults, idleCashFlows, idleCashEvents])

  const fallbackRatio = currentBuyoutCap / (currentBuyoutCap + VC_CAP)
  const currentSplitRatio =
    buyoutAllocation + vcAllocation > 0
      ? buyoutAllocation / (buyoutAllocation + vcAllocation)
      : fallbackRatio

  const handleTotalCapitalChange = (value: number) => {
    const sanitizedTotal = Math.max(0, safeNumber(value))
    const desiredBuyout = sanitizedTotal * currentSplitRatio
    let newBuyout = clampValue(Math.min(desiredBuyout, sanitizedTotal), currentBuyoutCap)
    let remaining = sanitizedTotal - newBuyout
    let newVc = clampValue(remaining, VC_CAP)
    remaining = sanitizedTotal - newBuyout - newVc

    if (remaining > 0 && newVc >= VC_CAP) {
      const buyoutHeadroom = currentBuyoutCap - newBuyout
      const buyoutTopUp = Math.min(buyoutHeadroom, remaining)
      newBuyout += buyoutTopUp
      remaining -= buyoutTopUp
    }

    if (remaining > 0 && newBuyout >= BUYOUT_CAP) {
      const vcHeadroom = VC_CAP - newVc
      const vcTopUp = Math.min(vcHeadroom, remaining)
      newVc += vcTopUp
      remaining -= vcTopUp
    }

    setTotalCapital(sanitizedTotal)
    setBuyoutAllocation(newBuyout)
    setVcAllocation(newVc)
  }

  const handleBuyoutAllocationChange = (value: number) => {
    const sanitizedBuyout = clampValue(Math.min(safeNumber(value), totalCapital), currentBuyoutCap)
    const remaining = totalCapital - sanitizedBuyout
    const newVc = clampValue(remaining, VC_CAP)
    setBuyoutAllocation(sanitizedBuyout)
    setVcAllocation(newVc)
  }

  const handleVcAllocationChange = (value: number) => {
    const sanitizedVc = clampValue(Math.min(safeNumber(value), totalCapital), VC_CAP)
    const remaining = totalCapital - sanitizedVc
    const newBuyout = clampValue(remaining, currentBuyoutCap)
    setVcAllocation(sanitizedVc)
    setBuyoutAllocation(newBuyout)
  }

  useEffect(() => {
    const cap = currentBuyoutCap
    setBuyoutAllocation((prevBuyout) => {
      if (prevBuyout <= cap) return prevBuyout
      const excess = prevBuyout - cap
      setVcAllocation((prevVc) => {
        const vcHeadroom = VC_CAP - prevVc
        const vcTopUp = Math.min(vcHeadroom, excess)
        return prevVc + vcTopUp
      })
      return cap
    })
  }, [currentBuyoutCap])

  const handleCoInvestToggle = (nextValue: boolean) => {
    if (!nextValue) {
      setBuyoutAllocation((prev) => {
        const { buyout: trimmedBuyout, vc: updatedVc } = redistributeFromBuyout(
          prev,
          vcAllocation,
          BUYOUT_CAP,
          VC_CAP,
        )
        if (updatedVc !== vcAllocation) {
          setVcAllocation(updatedVc)
        }
        return trimmedBuyout
      })
    }
    setIncludeCoInvest(nextValue)
  }

  return (
    <div className="app">
      <div className="container">
        <h1>Stewardship of Multi-Generational Family Wealth at Schroders</h1>
        <p className="intro">
          Model how a bespoke allocation across Schroders Capital buyout, co-investment and venture vehicles
          translates into net outcomes for a multi-generational family. Adjust the two economic levers the client
          can influence, and see how fees, carry and timing shape performance.
        </p>

        <InputsPanel
          totalCapital={totalCapital}
          buyoutAllocation={buyoutAllocation}
          vcAllocation={vcAllocation}
          currentBuyoutCap={currentBuyoutCap}
          vcCap={VC_CAP}
          totalAllocated={totalAllocated}
          unallocatedCapital={unallocatedCapital}
          includeCoInvest={includeCoInvest}
          buyoutMainAllocation={buyoutMainAllocation}
          coInvestAllocation={coInvestAllocation}
          onTotalCapitalChange={handleTotalCapitalChange}
          onBuyoutAllocationChange={handleBuyoutAllocationChange}
          onVcAllocationChange={handleVcAllocationChange}
          onToggleCoInvest={handleCoInvestToggle}
          toggleHelperMessage={CO_INVEST_DISABLED_MESSAGE}
        />

        <div className="disclaimer">
          <strong>Calculation assumptions:</strong> Capital calls are evenly distributed over the first 6 years (investment period), and all investments are divested together at the selected exit year.
        </div>

        <FundColumns
          buyout={{
            allocation: buyoutMainAllocation,
            results: buyoutResults,
            slider: {
              min: 0,
              max: 7,
              step: 0.1,
              value: buyoutMultiple,
              onChange: setBuyoutMultiple,
            },
            exitYear: buyoutExitYear,
            onExitYearChange: setBuyoutExitYear,
          }}
          coInvest={{
            allocation: coInvestAllocation,
            results: coInvestResults,
            exitYear: buyoutExitYear,
            active: includeCoInvest,
          }}
          venture={{
            allocation: vcAllocation,
            results: vcResults,
            slider: {
              min: 0,
              max: 15,
              step: 0.1,
              value: vcMultiple,
              onChange: setVcMultiple,
            },
            exitYear: vcExitYear,
            onExitYearChange: setVcExitYear,
          }}
        />

        <BlendedPanel
          netMultiple={blended.netMultiple}
          netIrr={blended.netIrr}
          totalFees={blended.totalFees}
          netValue={blended.netValue}
          cashEvents={blended.cashEvents}
        />

        <CaseReference />
      </div>
    </div>
  )
}

export default App

