import { IncomeStatementTable } from './IncomeStatementTable'
import { CashFlowTable } from './CashFlowTable'
import { accountingData } from '../data/accountingData'
import { CashFlowData } from '../types'

export function OperationalForecastTab() {
  const cashFlowData: CashFlowData = {
    title: 'Cash Flow',
    years: accountingData.years,
  }

  return (
    <div>
      <IncomeStatementTable data={accountingData} />
      <CashFlowTable data={cashFlowData} />
    </div>
  )
}

