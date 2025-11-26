import { AccountingYear } from '../types'
import './IncomeStatementTable.css'

interface IncomeStatementMarginRowProps {
  label: string
  years: AccountingYear[]
  getMargin: (year: AccountingYear) => number | undefined
}

export function IncomeStatementMarginRow({
  label,
  years,
  getMargin,
}: IncomeStatementMarginRowProps) {
  const formatMargin = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  return (
    <tr className="income-statement-margin-row">
      <td className="income-statement-label-cell">{label}</td>
      {years.map((year) => {
        const margin = getMargin(year)
        return (
          <td key={year.year} className="income-statement-margin-cell">
            {margin !== undefined ? formatMargin(margin) : ''}
          </td>
        )
      })}
    </tr>
  )
}

