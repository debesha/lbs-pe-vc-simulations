export type FundBase = {
  name: string
  target_fund_size_eur_millions: number
  management_fees_percent: number | null
  preferred_return_percent: number | null
  manager_return_catch_up?: string | null
  carried_interest_percent?: number | null
  fund_establishment_fee_percent_of_committed_capital: number | null
  fund_terms_years: string
  investment_period_years_from_initial_close: number
  expected_gross_return_on_investments_multiple: number
  strategy: string
  number_of_investments_targeted: string
}

export type VCCarriedStructure = {
  base_carried_interest_percent: number
  base_threshold_net_multiple: number
  higher_carried_interest_percent: number
  higher_threshold_condition: string
}

export type VCConfig = FundBase & { carried_interest_structure: VCCarriedStructure }

export type FundConfig = FundBase | VCConfig

export type CashEvent = {
  label: string
  amount: number
  percent?: number | null
  year?: number
}

export type PerformanceResult = {
  cashFlows: number[]
  netMultiple: number
  netIrr: number | null
  grossIrr: number | null
  feeDrag: number
  netValue: number
  totalFees: number
  grossMultiple: number
  cashEvents: CashEvent[]
}

export type CalculationInput = {
  allocation: number
  grossMultiple: number
  exitYear: number
  config: FundConfig
}

