export type DataStatus = 'Audited' | 'Unaudited' | 'Plan' | 'Forecast'

export interface IncomeStatementYear {
  year: number
  status: DataStatus
  unit: string
  turnover: number
  costOfSales: number
  grossProfit: number
  overheads: number
  ebit: number
  interestReceivable: number
  pbt: number
  grossProfitMargin?: number
  ebitMargin?: number
  pbtMargin?: number
}

export interface IncomeStatementData {
  title: string
  years: IncomeStatementYear[]
}

