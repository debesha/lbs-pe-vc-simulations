import { useMemo, useState } from 'react'
import { accountingData } from '../data/accountingData'
import './LBOEntryTab.css'

const MULTIPLE_DEFAULT = 5

export function LBOEntryTab() {
  const { years } = accountingData
  const [multiple, setMultiple] = useState<string>(MULTIPLE_DEFAULT.toString())

  // Get EBITDA for year 2004
  const entryEBITDA = useMemo(() => {
    const year2004 = years.find((year) => year.year === 2004)
    return year2004?.ebitda
  }, [years])

  // Get net cash (minus debt) for year 2003
  const netCash = useMemo(() => {
    const year2003 = years.find((year) => year.year === 2003)
    return year2003?.cashAtBankAndInHandOperating
  }, [years])

  // Calculate EV = EBITDA * Multiple
  const enterpriseValue = useMemo(() => {
    if (entryEBITDA === undefined) return undefined
    const multipleValue = parseFloat(multiple)
    if (Number.isNaN(multipleValue)) return undefined
    return entryEBITDA * multipleValue
  }, [entryEBITDA, multiple])

  // Calculate Equity Value = Enterprise Value + Net Cash
  const equityValue = useMemo(() => {
    if (enterpriseValue === undefined || netCash === undefined) return undefined
    return enterpriseValue + netCash
  }, [enterpriseValue, netCash])

  const formatNumber = (value: number | undefined) =>
    value === undefined ? '' : value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const handleMultipleChange = (value: string) => {
    setMultiple(value)
  }

  return (
    <div className="lbo-entry-container">
      <h2 className="lbo-entry-title">LBO Entry</h2>
      <div className="lbo-entry-form">
        <div className="lbo-entry-row">
          <span className="lbo-entry-label">Transaction Date:</span>
          <span className="lbo-entry-value">May 2004</span>
        </div>
        <div className="lbo-entry-row">
          <span className="lbo-entry-label">Entry EBITDA:</span>
          <span className="lbo-entry-value">{formatNumber(entryEBITDA)}</span>
        </div>
        <div className="lbo-entry-row">
          <span className="lbo-entry-label">Multiple:</span>
          <label className="lbo-entry-assumption-field">
            <input
              type="number"
              step="0.1"
              min="0"
              value={multiple}
              onChange={(event) => handleMultipleChange(event.target.value)}
              className="lbo-entry-assumption-input"
              aria-label="Assumed multiple for enterprise value calculation"
            />
          </label>
        </div>
        <div className="lbo-entry-row lbo-entry-row-calculated">
          <span className="lbo-entry-label">Enterprise Value (EV):</span>
          <span className="lbo-entry-value lbo-entry-value-calculated">{formatNumber(enterpriseValue)}</span>
        </div>
        <div className="lbo-entry-row">
          <span className="lbo-entry-label">Net Cash (minus Debt):</span>
          <span className="lbo-entry-value lbo-entry-value-calculated">{formatNumber(netCash)}</span>
        </div>
        <div className="lbo-entry-row lbo-entry-row-calculated">
          <span className="lbo-entry-label">Equity Value:</span>
          <span className="lbo-entry-value lbo-entry-value-calculated">{formatNumber(equityValue)}</span>
        </div>
      </div>
    </div>
  )
}

