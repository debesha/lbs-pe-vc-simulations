import { useMemo } from 'react'
import { scenarios } from '../data/accountingData'
import { useLBOAssumptions } from '../context/LBOAssumptionsContext'
import type { AccountingData, AccountingYear, DebtSnapshot } from '../types'
import { DEBT_POPULATION_YEAR, getInterestAccrualFactor } from '../utils/debtHelpers'
const DEFAULT_REPAYMENT = 0

const parseNumericInput = (value: string): number | undefined => {
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

const buildDebtSnapshot = (balance?: number, ratePercent?: number, interestFactor = 1): DebtSnapshot => {
  const startingBalance = balance
  const repayment = DEFAULT_REPAYMENT
  const endingBalance = startingBalance === undefined ? undefined : startingBalance - repayment
  const averageBalance =
    startingBalance !== undefined && endingBalance !== undefined ? (startingBalance + endingBalance) / 2 : undefined
  const interest =
    averageBalance !== undefined && ratePercent !== undefined
      ? (ratePercent / 100) * averageBalance * interestFactor
      : undefined

  return {
    startingBalance,
    interest,
    repayment,
    endingBalance,
  }
}

const calculateProfitBeforeTax = (year: AccountingYear): number => {
  const depreciation = year.depreciation ?? 0
  const primaryDebtInterest = year.primaryDebt?.interest ?? 0
  const secondaryDebtInterest = year.secondaryDebt?.interest ?? 0
  const ebitda = year.ebitda ?? 0

  return ebitda - depreciation - year.interestReceivable - primaryDebtInterest - secondaryDebtInterest
}

export function useAccountingData(): AccountingData {
  const {
    seniorDebt,
    seniorDebtInterestRate,
    subordinatedDebt,
    subordinatedDebtInterestRate,
    taxRate,
    selectedScenarioId,
  } = useLBOAssumptions()

  return useMemo(() => {
    // Get the accounting data for the selected scenario
    const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId)
    const accountingData = selectedScenario?.data ?? scenarios[0].data
    const seniorDebtBalance = parseNumericInput(seniorDebt)
    const seniorDebtRate = parseNumericInput(seniorDebtInterestRate)
    const subordinatedDebtBalance = parseNumericInput(subordinatedDebt)
    const subordinatedDebtRate = parseNumericInput(subordinatedDebtInterestRate)
    const parsedTaxRate = parseNumericInput(taxRate)
    const taxRateValue = parsedTaxRate ?? 0

    let currentPrimaryBalance = seniorDebtBalance
    let currentSecondaryBalance = subordinatedDebtBalance

    const years = accountingData.years.map((year) => {
      let primaryDebtSnapshot = year.primaryDebt
      let secondaryDebtSnapshot = year.secondaryDebt

      if (year.year >= DEBT_POPULATION_YEAR) {
        const interestAccrualFactor = getInterestAccrualFactor(year.year)

        if (currentPrimaryBalance !== undefined || seniorDebtRate !== undefined) {
          primaryDebtSnapshot = buildDebtSnapshot(currentPrimaryBalance, seniorDebtRate, interestAccrualFactor)
        }
        if (currentSecondaryBalance !== undefined || subordinatedDebtRate !== undefined) {
          secondaryDebtSnapshot = buildDebtSnapshot(currentSecondaryBalance, subordinatedDebtRate, interestAccrualFactor)
        }

        currentPrimaryBalance = primaryDebtSnapshot?.endingBalance
        currentSecondaryBalance = secondaryDebtSnapshot?.endingBalance
      }

      const yearWithUpdatedDebt: AccountingYear = {
        ...year,
        primaryDebt: primaryDebtSnapshot,
        secondaryDebt: secondaryDebtSnapshot,
      }

      const profitBeforeTax = calculateProfitBeforeTax(yearWithUpdatedDebt)
      const profitBeforeTaxMargin =
        yearWithUpdatedDebt.turnover !== 0 ? (profitBeforeTax / yearWithUpdatedDebt.turnover) * 100 : 0
      const taxExpense = (profitBeforeTax * taxRateValue) / 100
      const netIncome = profitBeforeTax - taxExpense

      return {
        ...yearWithUpdatedDebt,
        pbt: profitBeforeTax,
        pbtMargin: profitBeforeTaxMargin,
        taxExpense,
        netIncome,
      }
    })

    return {
      ...accountingData,
      years,
    }
  }, [seniorDebt, seniorDebtInterestRate, subordinatedDebt, subordinatedDebtInterestRate, taxRate, selectedScenarioId])
}


