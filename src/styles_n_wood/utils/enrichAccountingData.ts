import { RawAccountingYear, AccountingYear, AccountingData } from '../types'

/**
 * Enriches raw accounting data by calculating all computed fields.
 * This is the single place where all calculations happen.
 */
export function enrichAccountingYear(rawYear: RawAccountingYear): AccountingYear {
  const sumIfAny = (values: Array<number | undefined>): number | undefined => {
    const defined = values.filter((value) => value !== undefined) as number[]
    if (!defined.length) {
      return undefined
    }
    return defined.reduce((acc, value) => acc + value, 0)
  }

  const accountsReceivables = sumIfAny([
    rawYear.amountsReceivableOnContracts,
    rawYear.tradeDebtors,
    rawYear.otherDebtorsAndPrepayments,
  ])

  const cashPosition = rawYear.cashAtBankAndInHandOperating

  const currentAssets =
    rawYear.currentAssets !== undefined ? rawYear.currentAssets : sumIfAny([accountsReceivables, cashPosition])

  const accountsPayable = rawYear.accountsPayable ?? rawYear.tradeCreditors

  const currentLiabilities =
    rawYear.currentLiabilities !== undefined
      ? rawYear.currentLiabilities
      : sumIfAny([
          accountsPayable,
          rawYear.corporationTax,
          rawYear.otherTaxationAndSocialSecurity,
          rawYear.otherCreditorsAndAccruals,
          rawYear.accruedDividendsAndInterest,
        ])

  const netWorkingCapital =
    currentAssets !== undefined && currentLiabilities !== undefined ? currentAssets - currentLiabilities : undefined
  const netWorkingCapitalToTurnover =
    netWorkingCapital !== undefined && rawYear.turnover !== 0
      ? (netWorkingCapital / rawYear.turnover) * 100
      : undefined

  // Calculate Income Statement fields
  const grossProfit = rawYear.turnover + rawYear.costOfSales
  const grossProfitMargin = rawYear.turnover !== 0 ? (grossProfit / rawYear.turnover) * 100 : 0
  
  const ebit = grossProfit + rawYear.overheads
  const ebitMargin = rawYear.turnover !== 0 ? (ebit / rawYear.turnover) * 100 : 0
  
  const ebitda = ebit + (rawYear.depreciation || 0)
  
  const pbt = ebit + rawYear.interestReceivable
  const pbtMargin = rawYear.turnover !== 0 ? (pbt / rawYear.turnover) * 100 : 0
  
  // Calculate Cash Flow fields
  const changeInWorkingCapital = (rawYear.increaseDecreaseInDebtors || 0) + (rawYear.increaseDecreaseInCreditors || 0)

  const cashFlowFromOperations = ebit + (rawYear.depreciation || 0) + changeInWorkingCapital
  
  const freeCashFlowPreTax =
    (ebit || 0) +
    (rawYear.depreciation || 0) -
    changeInWorkingCapital -
    (rawYear.netCapitalExpenditure || 0)
  
  // Return enriched year with all computed fields
  return {
    ...rawYear,
    accountsReceivables,
    accountsPayable,
    currentAssets,
    currentLiabilities,
    netWorkingCapital,
    netWorkingCapitalToTurnover,
    grossProfit,
    grossProfitMargin,
    ebit,
    ebitMargin,
    ebitda,
    pbt,
    pbtMargin,
    cashFlowFromOperations,
    freeCashFlowPreTax,
  }
}

/**
 * Enriches accounting data by processing all years through the enrichment function
 */
export function enrichAccountingData(rawData: { title: string; years: RawAccountingYear[] }): AccountingData {
  return {
    title: rawData.title,
    years: rawData.years.map(enrichAccountingYear),
  }
}

