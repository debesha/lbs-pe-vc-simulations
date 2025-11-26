import { IncomeStatementYear } from '../types'
import './IncomeStatementTable.css'

interface IncomeStatementTableHeaderProps {
  years: IncomeStatementYear[]
}

export function IncomeStatementTableHeader({ years }: IncomeStatementTableHeaderProps) {
  return (
    <thead>
      <tr className="income-statement-header-row">
        <th className="income-statement-label-cell">Years ending 31 December</th>
        {years.map((year) => (
          <th key={year.year} className="income-statement-year-cell">
            {year.year}
          </th>
        ))}
      </tr>
      <tr className="income-statement-header-row">
        <th className="income-statement-label-cell"></th>
        {years.map((year) => (
          <th key={year.year} className="income-statement-unit-cell">
            {year.unit}
          </th>
        ))}
      </tr>
      <tr className="income-statement-header-row">
        <th className="income-statement-label-cell"></th>
        {years.map((year) => (
          <th key={year.year} className="income-statement-status-cell">
            {year.status}
          </th>
        ))}
      </tr>
    </thead>
  )
}

