import { AccountingYear } from '../types'
import './AccountingYearDataTable.css'

interface AccountingYearDataRowProps {
  label: string
  years: AccountingYear[]
  getValue: (year: AccountingYear) => number | undefined
  isBold?: boolean
  isDoubleUnderline?: boolean
  isSingleUnderline?: boolean
  formatValue?: (value: number) => string
  isSticky?: boolean
  stickyOffset?: number
  isNested?: boolean
}

export function AccountingYearDataRow({
  label,
  years,
  getValue,
  isBold = false,
  isDoubleUnderline = false,
  isSingleUnderline = false,
  formatValue,
  isSticky = false,
  stickyOffset = 0,
  isNested = false,
}: AccountingYearDataRowProps) {
  const defaultFormatValue = (value: number) => {
    return value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  const format = formatValue || defaultFormatValue

  const rowClassName = [
    'accounting-year-data-data-row',
    isBold ? 'accounting-year-data-bold' : '',
    isDoubleUnderline ? 'accounting-year-data-double-underline' : '',
    isSingleUnderline ? 'accounting-year-data-single-underline' : '',
    isNested ? 'accounting-year-data-nested-row' : '',
    isSticky ? 'accounting-year-data-sticky-row' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const stickyStyle = isSticky ? { top: stickyOffset } : undefined

  return (
    <tr className={rowClassName} style={stickyStyle}>
      <td className={`accounting-year-data-label-cell ${isNested ? 'accounting-year-data-nested-label' : ''}`}>{label}</td>
      {years.map((year) => {
        const value = getValue(year)
        return (
          <td key={year.year} className="accounting-year-data-value-cell">
            {value !== undefined ? format(value) : ''}
          </td>
        )
      })}
    </tr>
  )
}

