export type DataStatus = 'Audited' | 'Unaudited' | 'Plan' | 'Forecast'

export interface DebtSnapshot {
  startingBalance?: number
  interest?: number
  repayment?: number
  endingBalance?: number
}

/**
 * Raw input data without computed fields
 */
export interface RawAccountingYear {
  year: number
  status: DataStatus
  // Debt schedule
  primaryDebt?: DebtSnapshot
  secondaryDebt?: DebtSnapshot
  changeInOtherLongTermLiabilities?: number
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
  // Capital Movement fields
  amountsReceivableOnContracts?: number
  tradeDebtors?: number
  otherDebtorsAndPrepayments?: number
  cashAtBankAndInHandOperating?: number
  tradeCreditors?: number
  corporationTax?: number
  otherTaxationAndSocialSecurity?: number
  otherCreditorsAndAccruals?: number
  accruedDividendsAndInterest?: number
  currentAssets?: number
  accountsPayable?: number
  currentLiabilities?: number
  netWorkingCapital?: number
  netWorkingCapitalToTurnover?: number
}

/**
 * Enriched accounting year with all computed fields populated
 */
export interface AccountingYear extends RawAccountingYear {
  primaryDebt: DebtSnapshot
  secondaryDebt: DebtSnapshot
  taxExpense?: number
  netIncome?: number
  accountsReceivables?: number
  accountsPayable?: number
  currentAssets?: number
  currentLiabilities?: number
  // Computed Income Statement fields
  grossProfit: number
  grossProfitMargin: number
  ebit: number
  ebitMargin: number
  ebitda: number
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

export interface Scenario {
  id: string
  name: string
  data: AccountingData
  turnoverCAGR?: number
  ebitCAGR?: number
}

export interface ShareholderStake {
  id: string
  name: string
  equityValue?: number
  ownershipPercent?: number
  isManagement?: boolean
  exitsFully?: boolean
  lockedPostDealPercent?: number
}

export interface ShareholderStructureRow {
  id?: string
  name: string
  equityValue?: number
  ownershipPercent?: number
  isManagement?: boolean
  isSponsor?: boolean
  exitsFully?: boolean
}



