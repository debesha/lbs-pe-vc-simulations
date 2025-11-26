import { IncomeStatementYear } from '../types'
import './IncomeStatementTable.css'

interface IncomeStatementTableRowProps {
  label: string
  years: IncomeStatementYear[]
  getValue: (year: IncomeStatementYear) => number | undefined
  isBold?: boolean
  isDoubleUnderline?: boolean
  formatValue?: (value: number) => string
}

export function IncomeStatementTableRow({
  label,
  years,
  getValue,
  isBold = false,
  isDoubleUnderline = false,
  formatValue,
}: IncomeStatementTableRowProps) {
  const defaultFormatValue = (value: number) => {
    return value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  const format = formatValue || defaultFormatValue

  return (
    <tr className={`income-statement-data-row ${isBold ? 'income-statement-bold' : ''} ${isDoubleUnderline ? 'income-statement-double-underline' : ''}`}>
      <td className="income-statement-label-cell">{label}</td>
      {years.map((year) => {
        const value = getValue(year)
        return (
          <td key={year.year} className="income-statement-value-cell">
            {value !== undefined ? format(value) : ''}
          </td>
        )
      })}
    </tr>
  )
}

