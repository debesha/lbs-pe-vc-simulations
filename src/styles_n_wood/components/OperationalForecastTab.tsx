import { IncomeStatementTable } from './IncomeStatementTable'
import { incomeStatementData } from '../data/incomeStatement'

export function OperationalForecastTab() {
  return (
    <div>
      <IncomeStatementTable data={incomeStatementData} />
    </div>
  )
}

