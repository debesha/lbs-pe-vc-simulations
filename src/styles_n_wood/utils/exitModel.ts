import { AccountingYear } from '../types'
import { getInterestAccrualFactor } from './debtHelpers'

export const ENTRY_YEAR = 2004
export const ENTRY_PARTIAL_YEARS = 7 / 12
export const ENTRY_NET_CASH_YEAR = ENTRY_YEAR - 1
export const EXIT_YEAR_THRESHOLD = 2004

export type DebtTrancheSchedule = {
  startingBalance: number
  interestExpense: number
  repayment: number
  endingBalance: number
}

export type DebtScheduleEntry = {
  year: number
  cashFlowAvailableForDebtRepayment: number
  senior: DebtTrancheSchedule
  subordinated: DebtTrancheSchedule
}

export const calculateChangeInWorkingCapital = (year: AccountingYear) =>
  (year.increaseDecreaseInDebtors ?? 0) + (year.increaseDecreaseInCreditors ?? 0)

export const calculateChangeInOtherLongTermLiabilities = (year: AccountingYear) =>
  year.changeInOtherLongTermLiabilities ?? 0

export const calculateBaseCashFlowBeforeDebtService = (year: AccountingYear) => {
  const ebitda = year.ebitda ?? 0
  const taxExpense = year.taxExpense ?? 0
  const workingCapitalChange = calculateChangeInWorkingCapital(year)
  const otherLongTermLiabilitiesChange = calculateChangeInOtherLongTermLiabilities(year)
  const capex = year.netCapitalExpenditure ?? 0

  return ebitda - taxExpense - workingCapitalChange - otherLongTermLiabilitiesChange - capex
}

export const calculateInterestExpense = (
  startingBalance: number,
  endingBalance: number,
  ratePercent: number,
  interestAccrualFactor: number
) => {
  if (ratePercent <= 0) {
    return 0
  }

  const averageBalance = (startingBalance + endingBalance) / 2
  return averageBalance * (ratePercent / 100) * interestAccrualFactor
}

export interface SolveDebtYearArgs {
  baseCashFlow: number
  seniorStartingBalance: number
  subordinatedStartingBalance: number
  seniorRatePercent: number
  subordinatedRatePercent: number
  interestAccrualFactor: number
}

export const solveDebtYear = ({
  baseCashFlow,
  seniorStartingBalance,
  subordinatedStartingBalance,
  seniorRatePercent,
  subordinatedRatePercent,
  interestAccrualFactor,
}: SolveDebtYearArgs) => {
  let seniorRepayment = 0
  let subordinatedRepayment = 0
  let seniorEndingBalance = seniorStartingBalance
  let subordinatedEndingBalance = subordinatedStartingBalance
  let seniorInterest = calculateInterestExpense(
    seniorStartingBalance,
    seniorEndingBalance,
    seniorRatePercent,
    interestAccrualFactor
  )
  let subordinatedInterest = calculateInterestExpense(
    subordinatedStartingBalance,
    subordinatedEndingBalance,
    subordinatedRatePercent,
    interestAccrualFactor
  )

  const MAX_ITERATIONS = 12
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
    const availableForDebt = Math.max(baseCashFlow - seniorInterest - subordinatedInterest, 0)

    const nextSeniorRepayment = Math.min(availableForDebt, seniorStartingBalance)
    const nextSeniorEndingBalance = Math.max(seniorStartingBalance - nextSeniorRepayment, 0)
    const nextSeniorInterest = calculateInterestExpense(
      seniorStartingBalance,
      nextSeniorEndingBalance,
      seniorRatePercent,
      interestAccrualFactor
    )

    const remainingAfterSenior = Math.max(availableForDebt - nextSeniorRepayment, 0)
    const canRepaySubordinated = nextSeniorEndingBalance === 0
    const nextSubordinatedRepayment = canRepaySubordinated
      ? Math.min(remainingAfterSenior, subordinatedStartingBalance)
      : 0
    const nextSubordinatedEndingBalance = Math.max(subordinatedStartingBalance - nextSubordinatedRepayment, 0)
    const nextSubordinatedInterest = calculateInterestExpense(
      subordinatedStartingBalance,
      nextSubordinatedEndingBalance,
      subordinatedRatePercent,
      interestAccrualFactor
    )

    const hasConverged =
      Math.abs(nextSeniorInterest - seniorInterest) < 0.01 &&
      Math.abs(nextSubordinatedInterest - subordinatedInterest) < 0.01 &&
      Math.abs(nextSeniorRepayment - seniorRepayment) < 0.01 &&
      Math.abs(nextSubordinatedRepayment - subordinatedRepayment) < 0.01

    seniorRepayment = nextSeniorRepayment
    subordinatedRepayment = nextSubordinatedRepayment
    seniorEndingBalance = nextSeniorEndingBalance
    subordinatedEndingBalance = nextSubordinatedEndingBalance
    seniorInterest = nextSeniorInterest
    subordinatedInterest = nextSubordinatedInterest

    if (hasConverged) {
      break
    }
  }

  const cashFlowAvailableForDebtRepayment = Math.max(baseCashFlow - seniorInterest - subordinatedInterest, 0)

  return {
    seniorRepayment,
    subordinatedRepayment,
    seniorEndingBalance,
    subordinatedEndingBalance,
    seniorInterestExpense: seniorInterest,
    subordinatedInterestExpense: subordinatedInterest,
    cashFlowAvailableForDebtRepayment,
  }
}

export const buildDebtSchedule = (
  yearsBetweenEntryAndExit: AccountingYear[],
  seniorRatePercent: number,
  subordinatedRatePercent: number
) => {
  if (yearsBetweenEntryAndExit.length === 0) {
    return []
  }

  let seniorBalance: number | undefined
  let subordinatedBalance: number | undefined

  return yearsBetweenEntryAndExit.map((year, index) => {
    const seniorStartingBalance =
      index === 0 ? year.primaryDebt?.startingBalance ?? 0 : Math.max(seniorBalance ?? 0, 0)
    const subordinatedStartingBalance =
      index === 0 ? year.secondaryDebt?.startingBalance ?? 0 : Math.max(subordinatedBalance ?? 0, 0)

    const baseCashFlow = calculateBaseCashFlowBeforeDebtService(year)
    const interestAccrualFactor = getInterestAccrualFactor(year.year)

    const {
      seniorRepayment,
      subordinatedRepayment,
      seniorEndingBalance,
      subordinatedEndingBalance,
      seniorInterestExpense,
      subordinatedInterestExpense,
      cashFlowAvailableForDebtRepayment,
    } = solveDebtYear({
      baseCashFlow,
      seniorStartingBalance,
      subordinatedStartingBalance,
      seniorRatePercent,
      subordinatedRatePercent,
      interestAccrualFactor,
    })

    seniorBalance = seniorEndingBalance
    subordinatedBalance = subordinatedEndingBalance

    return {
      year: year.year,
      cashFlowAvailableForDebtRepayment,
      senior: {
        startingBalance: seniorStartingBalance,
        interestExpense: seniorInterestExpense,
        repayment: seniorRepayment,
        endingBalance: seniorEndingBalance,
      },
      subordinated: {
        startingBalance: subordinatedStartingBalance,
        interestExpense: subordinatedInterestExpense,
        repayment: subordinatedRepayment,
        endingBalance: subordinatedEndingBalance,
      },
    }
  })
}

export const calculateTotalDebtAtExit = (
  exitYear: number | undefined,
  debtScheduleByYear: Map<number, DebtScheduleEntry>,
  selectedYear?: AccountingYear
) => {
  if (!exitYear) {
    return undefined
  }

  const scheduleEntry = debtScheduleByYear.get(exitYear)
  if (scheduleEntry) {
    return scheduleEntry.senior.endingBalance + scheduleEntry.subordinated.endingBalance
  }

  if (!selectedYear) {
    return undefined
  }

  const seniorBalance = selectedYear.primaryDebt?.endingBalance ?? selectedYear.primaryDebt?.startingBalance ?? 0
  const subordinatedBalance =
    selectedYear.secondaryDebt?.endingBalance ?? selectedYear.secondaryDebt?.startingBalance ?? 0
  const totalBalance = seniorBalance + subordinatedBalance
  return totalBalance === 0 ? undefined : totalBalance
}

export const calculateNetCashMinusDebt = (
  cashPosition: number | undefined,
  totalDebtAtExit: number | undefined
) => {
  if (cashPosition === undefined && totalDebtAtExit === undefined) {
    return undefined
  }
  return (cashPosition ?? 0) - (totalDebtAtExit ?? 0)
}

export const calculateHoldingPeriodYears = (selectedExitYearNumber: number | undefined) => {
  if (!selectedExitYearNumber) return undefined
  const fullYearsAfterEntry = selectedExitYearNumber - ENTRY_YEAR
  if (fullYearsAfterEntry < 0) return undefined
  return ENTRY_PARTIAL_YEARS + fullYearsAfterEntry
}

