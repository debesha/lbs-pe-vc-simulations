import { AccountingYear } from '../types'
import './AccountingYearDataTable.css'

interface AccountingYearDataMarginRowProps {
  label: string
  years: AccountingYear[]
  getMargin: (year: AccountingYear) => number | undefined
}

export function AccountingYearDataMarginRow({
  label,
  years,
  getMargin,
}: AccountingYearDataMarginRowProps) {
  const formatMargin = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  return (
    <tr className="accounting-year-data-margin-row">
      <td className="accounting-year-data-label-cell">{label}</td>
      {years.map((year) => {
        const margin = getMargin(year)
        return (
          <td key={year.year} className="accounting-year-data-margin-cell">
            {margin !== undefined ? formatMargin(margin) : ''}
          </td>
        )
      })}
    </tr>
  )
}

