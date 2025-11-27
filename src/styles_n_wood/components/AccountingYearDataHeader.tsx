import { AccountingYear } from '../types'
import './AccountingYearDataTable.css'

interface AccountingYearDataHeaderProps {
  years: AccountingYear[]
}

export function AccountingYearDataHeader({ years }: AccountingYearDataHeaderProps) {
  return (
    <thead>
      <tr className="accounting-year-data-header-row">
        <th className="accounting-year-data-label-cell">Years ending 31 December</th>
        {years.map((year) => (
          <th key={year.year} className="accounting-year-data-year-cell">
            {year.year}
          </th>
        ))}
      </tr>
      <tr className="accounting-year-data-header-row">
        <th className="accounting-year-data-label-cell"></th>
        {years.map((year) => (
          <th key={year.year} className="accounting-year-data-unit-cell">
            £000
          </th>
        ))}
      </tr>
      <tr className="accounting-year-data-header-row">
        <th className="accounting-year-data-label-cell"></th>
        {years.map((year) => (
          <th key={year.year} className="accounting-year-data-status-cell">
            {year.status}
          </th>
        ))}
      </tr>
    </thead>
  )
}

