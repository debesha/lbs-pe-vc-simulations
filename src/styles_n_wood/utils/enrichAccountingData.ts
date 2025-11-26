import { RawAccountingYear, AccountingYear, AccountingData } from '../types'

/**
 * Enriches raw accounting data by calculating all computed fields.
 * This is the single place where all calculations happen.
 */
export function enrichAccountingYear(rawYear: RawAccountingYear): AccountingYear {
  // Calculate Income Statement fields
  const grossProfit = rawYear.turnover + rawYear.costOfSales
  const grossProfitMargin = rawYear.turnover !== 0 ? (grossProfit / rawYear.turnover) * 100 : 0
  
  const ebit = grossProfit + rawYear.overheads
  const ebitMargin = rawYear.turnover !== 0 ? (ebit / rawYear.turnover) * 100 : 0
  
  const pbt = ebit + rawYear.interestReceivable
  const pbtMargin = rawYear.turnover !== 0 ? (pbt / rawYear.turnover) * 100 : 0
  
  // Calculate Cash Flow fields
  const cashFlowFromOperations =
    ebit +
    (rawYear.depreciation || 0) +
    (rawYear.profitLossOnSaleOfFixedAssets || 0) +
    (rawYear.increaseDecreaseInDebtors || 0) +
    (rawYear.increaseDecreaseInCreditors || 0)
  
  const freeCashFlowPreTax =
    cashFlowFromOperations +
    (rawYear.interestReceived || 0) +
    (rawYear.netCapitalExpenditure || 0)
  
  // Return enriched year with all computed fields
  return {
    ...rawYear,
    grossProfit,
    grossProfitMargin,
    ebit,
    ebitMargin,
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

