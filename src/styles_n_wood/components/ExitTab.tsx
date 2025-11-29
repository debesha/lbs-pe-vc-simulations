import { useMemo, useState } from 'react'
import { accountingData } from '../data/accountingData'
import './LBOEntryTab.css'

const EXIT_YEAR_THRESHOLD = 2004
const EXIT_MULTIPLE_DEFAULT = 6
const MULTIPLE_MIN = 4
const MULTIPLE_MAX = 12
const MULTIPLE_STEP = 0.1

export function ExitTab() {
  const { years } = accountingData

  const exitYearOptions = useMemo(() => years.filter((year) => year.year > EXIT_YEAR_THRESHOLD), [years])
  const [selectedExitYear, setSelectedExitYear] = useState<string>(() => exitYearOptions[0]?.year.toString() ?? '')
  const [exitMultiple, setExitMultiple] = useState<string>(EXIT_MULTIPLE_DEFAULT.toString())

  const selectedYearData = useMemo(
    () => exitYearOptions.find((year) => year.year.toString() === selectedExitYear),
    [exitYearOptions, selectedExitYear]
  )

  const exitEbitda = selectedYearData?.ebitda
  const netCash = selectedYearData?.cashAtBankAndInHandOperating

  const exitMultipleValue = useMemo(() => {
    const parsed = parseFloat(exitMultiple)
    return Number.isNaN(parsed) ? undefined : parsed
  }, [exitMultiple])

  const enterpriseValue = useMemo(() => {
    if (exitEbitda === undefined || exitMultipleValue === undefined) return undefined
    return exitEbitda * exitMultipleValue
  }, [exitEbitda, exitMultipleValue])

  const equityValue = useMemo(() => {
    if (enterpriseValue === undefined || netCash === undefined) return undefined
    return enterpriseValue + netCash
  }, [enterpriseValue, netCash])

  const formatNumber = (value: number | undefined) =>
    value === undefined ? '' : value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const formatMultiple = (value: number | undefined) => (value === undefined ? '-' : `${value.toFixed(1)}x`)

  const formatExitYearLabel = (year: number) => `${year}`

  return (
    <div className="lbo-entry-container">
      <h2 className="lbo-entry-title">LBO Exit</h2>
      <div className="lbo-entry-form">
        <div className="lbo-entry-form-grid">
          <div className="lbo-entry-form-column">
            <div className="lbo-entry-row">
              <label className="lbo-entry-label" htmlFor="exit-transaction-date">
                Transaction Date:
              </label>
              {exitYearOptions.length > 0 ? (
                <select
                  id="exit-transaction-date"
                  className="lbo-entry-select"
                  value={selectedExitYear}
                  onChange={(event) => setSelectedExitYear(event.target.value)}
                >
                  {exitYearOptions.map((year) => (
                    <option key={year.year} value={year.year.toString()}>
                      {formatExitYearLabel(year.year)}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="lbo-entry-value">No exit years available</span>
              )}
            </div>
            <div className="lbo-entry-row">
              <span className="lbo-entry-label">Exit EBITDA:</span>
              <span className="lbo-entry-value">{formatNumber(exitEbitda)}</span>
            </div>
            <div className="lbo-entry-row">
              <label className="lbo-entry-label" htmlFor="exit-multiple-slider">
                Multiple:
              </label>
              <div className="lbo-entry-slider-control">
                <input
                  id="exit-multiple-slider"
                  type="range"
                  min={MULTIPLE_MIN}
                  max={MULTIPLE_MAX}
                  step={MULTIPLE_STEP}
                  value={exitMultiple}
                  onChange={(event) => setExitMultiple(event.target.value)}
                  className="lbo-entry-slider"
                  aria-label="Assumed exit multiple for enterprise value calculation"
                />
                <span className="lbo-entry-slider-value">{formatMultiple(exitMultipleValue)}</span>
              </div>
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
      </div>
    </div>
  )
}

