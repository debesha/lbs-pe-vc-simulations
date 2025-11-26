export type DataStatus = 'Audited' | 'Unaudited' | 'Plan' | 'Forecast'

/**
 * Raw input data without computed fields
 */
export interface RawAccountingYear {
  year: number
  status: DataStatus
  // Income Statement fields
  turnover: number
  costOfSales: number
  overheads: number
  interestReceivable: number
  // Cash Flow fields
  depreciation?: number
  profitLossOnSaleOfFixedAssets?: number
  increaseDecreaseInDebtors?: number
  increaseDecreaseInCreditors?: number
  interestReceived?: number
  netCapitalExpenditure?: number
}

/**
 * Enriched accounting year with all computed fields populated
 */
export interface AccountingYear extends RawAccountingYear {
  // Computed Income Statement fields
  grossProfit: number
  grossProfitMargin: number
  ebit: number
  ebitMargin: number
  pbt: number
  pbtMargin: number
  // Computed Cash Flow fields
  cashFlowFromOperations: number
  freeCashFlowPreTax: number
}

export interface AccountingData {
  title: string
  years: AccountingYear[]
}

export interface CashFlowData {
  title: string
  years: AccountingYear[]
}

// Alias for backward compatibility
export type IncomeStatementData = AccountingData

