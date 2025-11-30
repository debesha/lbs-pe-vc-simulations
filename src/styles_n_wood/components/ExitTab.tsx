import { useEffect, useMemo, useState } from 'react'
import { useAccountingData } from '../hooks/useAccountingData'
import { useLBOAssumptions } from '../context/LBOAssumptionsContext'
import {
  ENTRY_YEAR,
  ENTRY_NET_CASH_YEAR,
  EXIT_YEAR_THRESHOLD,
  DebtScheduleEntry,
  calculateBaseCashFlowBeforeDebtService,
  calculateChangeInOtherLongTermLiabilities,
  calculateChangeInWorkingCapital,
  calculateHoldingPeriodYears,
  calculateNetCashMinusDebt,
  calculateTotalDebtAtExit,
  buildDebtSchedule,
} from '../utils/exitModel'
import { EXIT_DEFAULT_YEAR, MULTIPLE_MAX, MULTIPLE_MIN, MULTIPLE_STEP } from '../constants/lboAssumptions'
import './LBOEntryTab.css'
const SENSITIVITY_STEP = 0.25
const SENSITIVITY_STEPS_EACH_SIDE = 6

const generateSensitivityValues = (center: number | undefined) => {
  if (center === undefined || Number.isNaN(center)) {
    return [] as number[]
  }

  const values: number[] = []
  for (let offset = -SENSITIVITY_STEPS_EACH_SIDE; offset <= SENSITIVITY_STEPS_EACH_SIDE; offset += 1) {
    const candidate = parseFloat((center + offset * SENSITIVITY_STEP).toFixed(2))
    if (candidate > 0) {
      values.push(candidate)
    }
  }
  return values
}

type DebtTrancheSchedule = {
  startingBalance: number
  interestExpense: number
  repayment: number
  endingBalance: number
}

type DebtScheduleEntry = {
  year: number
  cashFlowAvailableForDebtRepayment: number
  senior: DebtTrancheSchedule
  subordinated: DebtTrancheSchedule
}

export function ExitTab() {
  const { years } = useAccountingData()
  const {
    seniorDebtInterestRate,
    subordinatedDebtInterestRate,
    entryMultiple,
    exitMultiple,
    setExitMultiple,
    selectedExitYear,
    setSelectedExitYear,
  } = useLBOAssumptions()

  const exitYearOptions = useMemo(() => years.filter((year) => year.year > EXIT_YEAR_THRESHOLD), [years])
  useEffect(() => {
    if (!exitYearOptions.length) return
    const preferredYear = exitYearOptions.find((year) => year.year === EXIT_DEFAULT_YEAR)?.year
    const fallbackYear = exitYearOptions[0]?.year
    const resolvedYear = preferredYear ?? fallbackYear
    if (!selectedExitYear) {
      setSelectedExitYear(resolvedYear ? resolvedYear.toString() : '')
      return
    }
    const exists = exitYearOptions.some((year) => year.year.toString() === selectedExitYear)
    if (!exists) {
      setSelectedExitYear(resolvedYear ? resolvedYear.toString() : '')
    }
  }, [exitYearOptions, selectedExitYear, setSelectedExitYear])
  const [showIrrSensitivity, setShowIrrSensitivity] = useState(false)
  const [showMoicSensitivity, setShowMoicSensitivity] = useState(false)

  const selectedYearData = useMemo(
    () => exitYearOptions.find((year) => year.year.toString() === selectedExitYear),
    [exitYearOptions, selectedExitYear]
  )

  const selectedExitYearNumber = useMemo(() => {
    const parsed = parseInt(selectedExitYear, 10)
    return Number.isNaN(parsed) ? undefined : parsed
  }, [selectedExitYear])

  const exitEbitda = selectedYearData?.ebitda
  const netCash = selectedYearData?.cashAtBankAndInHandOperating

  const entryYearData = useMemo(() => years.find((year) => year.year === ENTRY_YEAR), [years])
  const entryEbitda = entryYearData?.ebitda
  const entryNetCashYearData = useMemo(() => years.find((year) => year.year === ENTRY_NET_CASH_YEAR), [years])
  const entryNetCash = entryNetCashYearData?.cashAtBankAndInHandOperating

  const exitMultipleValue = useMemo(() => {
    const parsed = parseFloat(exitMultiple)
    return Number.isNaN(parsed) ? undefined : parsed
  }, [exitMultiple])

  const entryMultipleValue = useMemo(() => {
    const parsed = parseFloat(entryMultiple)
    return Number.isNaN(parsed) ? undefined : parsed
  }, [entryMultiple])

  const entryMultipleRange = useMemo(() => generateSensitivityValues(entryMultipleValue), [entryMultipleValue])
  const exitMultipleRange = useMemo(() => generateSensitivityValues(exitMultipleValue), [exitMultipleValue])

  const enterpriseValue = useMemo(() => {
    if (exitEbitda === undefined || exitMultipleValue === undefined) return undefined
    return exitEbitda * exitMultipleValue
  }, [exitEbitda, exitMultipleValue])

  const entryEnterpriseValue = useMemo(() => {
    if (entryEbitda === undefined || entryMultipleValue === undefined) return undefined
    return entryEbitda * entryMultipleValue
  }, [entryEbitda, entryMultipleValue])

  const entryEquityValue = useMemo(() => {
    if (entryEnterpriseValue === undefined || entryNetCash === undefined) return undefined
    return entryEnterpriseValue + entryNetCash
  }, [entryEnterpriseValue, entryNetCash])

  const yearsBetweenEntryAndExit = useMemo(
    () => {
      const exitYear = selectedExitYearNumber ?? ENTRY_YEAR
      return years.filter((year) => year.year >= ENTRY_YEAR && year.year <= exitYear)
    },
    [years, selectedExitYearNumber]
  )

  const formatNumber = (value: number | undefined) =>
    value === undefined ? '' : value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const formatMultiple = (value: number | undefined) => (value === undefined ? '-' : `${value.toFixed(1)}x`)

  const formatMoic = (value: number | undefined) => (value === undefined ? '' : `${value.toFixed(2)}x`)

  const formatIrr = (value: number | undefined) => (value === undefined ? '' : `${(value * 100).toFixed(1)}%`)

  const formatHoldingPeriod = (value: number | undefined) => (value === undefined ? '' : `${value.toFixed(1)} yrs`)

  const formatExitYearLabel = (year: number) => `${year}`

  const parsePercentageInput = (value: string) => {
    const parsed = parseFloat(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }


  const debtSchedule = useMemo<DebtScheduleEntry[]>(() => {
    const seniorRatePercent = parsePercentageInput(seniorDebtInterestRate)
    const subordinatedRatePercent = parsePercentageInput(subordinatedDebtInterestRate)
    return buildDebtSchedule(yearsBetweenEntryAndExit, seniorRatePercent, subordinatedRatePercent)
  }, [yearsBetweenEntryAndExit, seniorDebtInterestRate, subordinatedDebtInterestRate])

  const debtScheduleByYear = useMemo(() => {
    const map = new Map<number, DebtScheduleEntry>()
    debtSchedule.forEach((entry) => map.set(entry.year, entry))
    return map
  }, [debtSchedule])

  const totalDebtAtExit = useMemo(
    () => calculateTotalDebtAtExit(selectedExitYearNumber, debtScheduleByYear, selectedYearData),
    [selectedExitYearNumber, debtScheduleByYear, selectedYearData]
  )

  const netCashMinusDebt = useMemo(
    () => calculateNetCashMinusDebt(netCash, totalDebtAtExit),
    [netCash, totalDebtAtExit]
  )

  const equityValue = useMemo(() => {
    if (enterpriseValue === undefined || netCashMinusDebt === undefined) return undefined
    return enterpriseValue + netCashMinusDebt
  }, [enterpriseValue, netCashMinusDebt])

  const moic = useMemo(() => {
    if (equityValue === undefined || entryEquityValue === undefined || entryEquityValue === 0) return undefined
    return equityValue / entryEquityValue
  }, [equityValue, entryEquityValue])

  const holdingPeriodYears = useMemo(
    () => calculateHoldingPeriodYears(selectedExitYearNumber),
    [selectedExitYearNumber]
  )

  const irr = useMemo(() => {
    if (moic === undefined || holdingPeriodYears === undefined) return undefined
    return Math.pow(moic, 1 / holdingPeriodYears) - 1
  }, [moic, holdingPeriodYears])

  const irrSensitivityMatrix = useMemo(() => {
    if (
      entryMultipleRange.length === 0 ||
      exitMultipleRange.length === 0 ||
      entryEbitda === undefined ||
      entryNetCash === undefined ||
      exitEbitda === undefined ||
      netCashMinusDebt === undefined ||
      holdingPeriodYears === undefined ||
      holdingPeriodYears <= 0
    ) {
      return [] as Array<Array<number | undefined>>
    }

    return exitMultipleRange.map((exitMultipleCandidate) => {
      const exitEquityCandidate = exitEbitda * exitMultipleCandidate + netCashMinusDebt
      return entryMultipleRange.map((entryMultipleCandidate) => {
        const entryEquityCandidate = entryEbitda * entryMultipleCandidate + entryNetCash
        if (entryEquityCandidate <= 0 || exitEquityCandidate <= 0) {
          return undefined
        }
        const candidateMoic = exitEquityCandidate / entryEquityCandidate
        if (candidateMoic <= 0) {
          return undefined
        }
        return Math.pow(candidateMoic, 1 / holdingPeriodYears) - 1
      })
    })
  }, [
    entryMultipleRange,
    exitMultipleRange,
    entryEbitda,
    entryNetCash,
    exitEbitda,
    netCashMinusDebt,
    holdingPeriodYears,
  ])

  const moicSensitivityMatrix = useMemo(() => {
    if (
      entryMultipleRange.length === 0 ||
      exitMultipleRange.length === 0 ||
      entryEbitda === undefined ||
      entryNetCash === undefined ||
      exitEbitda === undefined ||
      netCashMinusDebt === undefined
    ) {
      return [] as Array<Array<number | undefined>>
    }

    return exitMultipleRange.map((exitMultipleCandidate) => {
      const exitEquityCandidate = exitEbitda * exitMultipleCandidate + netCashMinusDebt
      return entryMultipleRange.map((entryMultipleCandidate) => {
        const entryEquityCandidate = entryEbitda * entryMultipleCandidate + entryNetCash
        if (entryEquityCandidate <= 0 || exitEquityCandidate <= 0) {
          return undefined
        }
        return exitEquityCandidate / entryEquityCandidate
      })
    })
  }, [
    entryMultipleRange,
    exitMultipleRange,
    entryEbitda,
    entryNetCash,
    exitEbitda,
    netCashMinusDebt,
  ])

  const formattedSelectedEntryMultiple = entryMultipleValue !== undefined ? entryMultipleValue.toFixed(2) : undefined
  const formattedSelectedExitMultiple = exitMultipleValue !== undefined ? exitMultipleValue.toFixed(2) : undefined
  const hasIrrSensitivityMatrix = irrSensitivityMatrix.length > 0
  const hasMoicSensitivityMatrix = moicSensitivityMatrix.length > 0

  return (
    <div className="lbo-entry-container">
      <h2 className="lbo-entry-title">LBO Exit</h2>
      <div className="lbo-entry-form">
        <div className="lbo-entry-form-grid">
          <div className="lbo-entry-form-column exit-metrics-column">
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
              <span className="lbo-entry-value lbo-entry-value-calculated">{formatNumber(netCashMinusDebt)}</span>
            </div>
            <div className="lbo-entry-row lbo-entry-row-calculated">
              <span className="lbo-entry-label">Equity Value:</span>
              <span className="lbo-entry-value lbo-entry-value-calculated">{formatNumber(equityValue)}</span>
            </div>
          </div>
          <div className="lbo-entry-form-column exit-comparison-column">
            <div className="lbo-entry-row lbo-entry-row-calculated">
              <span className="lbo-entry-label">Entry equity value:</span>
              <span className="lbo-entry-value lbo-entry-value-calculated">{formatNumber(entryEquityValue)}</span>
            </div>
            <div className="lbo-entry-row">
              <span className="lbo-entry-label">Entry multiple:</span>
              <span className="lbo-entry-value">{formatMultiple(entryMultipleValue)}</span>
            </div>
            <div className="lbo-entry-row lbo-entry-row-calculated">
              <span className="lbo-entry-label">Exit equity value:</span>
              <span className="lbo-entry-value lbo-entry-value-calculated">{formatNumber(equityValue)}</span>
            </div>
            <div className="lbo-entry-row">
              <span className="lbo-entry-label">Exit multiple:</span>
              <span className="lbo-entry-value">{formatMultiple(exitMultipleValue)}</span>
            </div>
            <div className="lbo-entry-row">
              <span className="lbo-entry-label">Holding period:</span>
              <span className="lbo-entry-value">{formatHoldingPeriod(holdingPeriodYears)}</span>
            </div>
            <div className="lbo-entry-row lbo-entry-row-calculated">
              <span className="lbo-entry-label">MOIC:</span>
              <span className="lbo-entry-value lbo-entry-value-calculated">{formatMoic(moic)}</span>
              {hasMoicSensitivityMatrix && (
                <button
                  type="button"
                  className="exit-sensitivity-link"
                  onClick={() => setShowMoicSensitivity(true)}
                  aria-label="Open MOIC sensitivity matrix"
                >
                  Sensitivity
                </button>
              )}
            </div>
            <div className="lbo-entry-row lbo-entry-row-calculated exit-irr-row">
              <span className="lbo-entry-label">IRR:</span>
              <span className="lbo-entry-value lbo-entry-value-calculated">{formatIrr(irr)}</span>
              {hasIrrSensitivityMatrix && (
                <button
                  type="button"
                  className="exit-sensitivity-link"
                  onClick={() => setShowIrrSensitivity(true)}
                  aria-label="Open IRR sensitivity matrix"
                >
                  Sensitivity
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showMoicSensitivity && hasMoicSensitivityMatrix && (
        <div
          className="exit-sensitivity-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="MOIC sensitivity table"
          onClick={() => setShowMoicSensitivity(false)}
        >
          <div className="exit-sensitivity-overlay-content" onClick={(event) => event.stopPropagation()}>
            <div className="exit-sensitivity-overlay-header">
              <h3 className="exit-sensitivity-title">MOIC Sensitivity (Entry vs Exit Multiple)</h3>
              <button
                type="button"
                className="exit-sensitivity-close"
                onClick={() => setShowMoicSensitivity(false)}
                aria-label="Close sensitivity table"
              >
                ×
              </button>
            </div>
            <div className="exit-sensitivity-table-wrapper">
              <table className="exit-sensitivity-table">
                <thead>
                  <tr>
                    <th className="exit-sensitivity-corner-cell">Exit \ Entry</th>
                    {entryMultipleRange.map((value) => (
                      <th key={`moic-entry-multiple-${value}`} className="exit-sensitivity-header-cell">
                        {value.toFixed(2)}x
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exitMultipleRange.map((exitValue, rowIndex) => (
                    <tr key={`moic-exit-multiple-row-${exitValue}`}>
                      <th className="exit-sensitivity-header-cell">{exitValue.toFixed(2)}x</th>
                      {moicSensitivityMatrix[rowIndex]?.map((moicValue, colIndex) => {
                        const entryValue = entryMultipleRange[colIndex]
                        const isSelectedCell =
                          formattedSelectedEntryMultiple === entryValue.toFixed(2) &&
                          formattedSelectedExitMultiple === exitValue.toFixed(2)
                        return (
                          <td
                            key={`moic-cell-${exitValue}-${entryValue}`}
                            className={`exit-sensitivity-cell${isSelectedCell ? ' exit-sensitivity-cell-selected' : ''}`}
                          >
                            {moicValue === undefined ? '—' : formatMoic(moicValue)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showIrrSensitivity && hasIrrSensitivityMatrix && (
        <div
          className="exit-sensitivity-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="IRR sensitivity table"
          onClick={() => setShowIrrSensitivity(false)}
        >
          <div className="exit-sensitivity-overlay-content" onClick={(event) => event.stopPropagation()}>
            <div className="exit-sensitivity-overlay-header">
              <h3 className="exit-sensitivity-title">IRR Sensitivity (Entry vs Exit Multiple)</h3>
              <button
                type="button"
                className="exit-sensitivity-close"
                onClick={() => setShowIrrSensitivity(false)}
                aria-label="Close sensitivity table"
              >
                ×
              </button>
            </div>
            <div className="exit-sensitivity-table-wrapper">
              <table className="exit-sensitivity-table">
                <thead>
                  <tr>
                    <th className="exit-sensitivity-corner-cell">Exit \ Entry</th>
                    {entryMultipleRange.map((value) => (
                      <th key={`irr-entry-multiple-${value}`} className="exit-sensitivity-header-cell">
                        {value.toFixed(2)}x
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exitMultipleRange.map((exitValue, rowIndex) => (
                    <tr key={`irr-exit-multiple-row-${exitValue}`}>
                      <th className="exit-sensitivity-header-cell">{exitValue.toFixed(2)}x</th>
                      {irrSensitivityMatrix[rowIndex]?.map((irrValue, colIndex) => {
                        const entryValue = entryMultipleRange[colIndex]
                        const isSelectedCell =
                          formattedSelectedEntryMultiple === entryValue.toFixed(2) &&
                          formattedSelectedExitMultiple === exitValue.toFixed(2)
                        return (
                          <td
                            key={`irr-cell-${exitValue}-${entryValue}`}
                            className={`exit-sensitivity-cell${isSelectedCell ? ' exit-sensitivity-cell-selected' : ''}`}
                          >
                            {irrValue === undefined ? '—' : formatIrr(irrValue)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="lbo-exit-performance-section">
        <h3 className="lbo-exit-performance-title">Entry to Exit Performance</h3>
        {yearsBetweenEntryAndExit.length > 0 ? (
          <table className="lbo-exit-performance-table">
            <thead>
              <tr>
                <th className="lbo-exit-performance-header">Metric</th>
                {yearsBetweenEntryAndExit.map((year) => (
                  <th key={year.year} className="lbo-exit-performance-header">
                    {year.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="lbo-exit-performance-label">Sales</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`sales-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(year.turnover)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">EBITDA</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`ebitda-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(year.ebitda)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Interest on primary debt</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`primary-interest-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(
                      debtScheduleByYear.get(year.year)?.senior.interestExpense ?? year.primaryDebt?.interest
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Interest on secondary debt</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`secondary-interest-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(
                      debtScheduleByYear.get(year.year)?.subordinated.interestExpense ?? year.secondaryDebt?.interest
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Profit before tax</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`pbt-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(year.pbt)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Tax expense</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`tax-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(year.taxExpense)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Net income</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`net-income-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(year.netIncome)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="lbo-exit-performance-empty">Set an exit year to view the performance snapshot.</p>
        )}
      </div>

      <div className="lbo-exit-performance-section">
        <h3 className="lbo-exit-performance-title">Cash Flow Estimation</h3>
        {yearsBetweenEntryAndExit.length > 0 ? (
          <table className="lbo-exit-performance-table">
            <thead>
              <tr>
                <th className="lbo-exit-performance-header">Metric</th>
                {yearsBetweenEntryAndExit.map((year) => (
                  <th key={`cashflow-head-${year.year}`} className="lbo-exit-performance-header">
                    {year.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="lbo-exit-performance-label">EBITDA</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`cf-ebitda-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(year.ebitda)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Tax expense (cash taxes)</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`cf-tax-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(year.taxExpense)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Changes in net working capital</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`cf-nwc-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(calculateChangeInWorkingCapital(year))}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Change in other long-term liabilities</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`cf-ltl-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(calculateChangeInOtherLongTermLiabilities(year))}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Capex</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`cf-capex-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(year.netCapitalExpenditure)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Interest on senior debt</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`cf-senior-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(
                      debtScheduleByYear.get(year.year)?.senior.interestExpense ?? year.primaryDebt?.interest
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Interest on subordinated debt</td>
                {yearsBetweenEntryAndExit.map((year) => (
                  <td key={`cf-sub-${year.year}`} className="lbo-exit-performance-value">
                    {formatNumber(
                      debtScheduleByYear.get(year.year)?.subordinated.interestExpense ?? year.secondaryDebt?.interest
                    )}
                  </td>
                ))}
              </tr>
              <tr className="lbo-exit-performance-row-total">
                <td className="lbo-exit-performance-label lbo-exit-performance-label-strong">
                  Cash flow available for debt repayment
                </td>
                {yearsBetweenEntryAndExit.map((year) => {
                  const scheduleEntry = debtScheduleByYear.get(year.year)
                  const fallbackCashAvailable = Math.max(
                    calculateBaseCashFlowBeforeDebtService(year) -
                      (year.primaryDebt?.interest ?? 0) -
                      (year.secondaryDebt?.interest ?? 0),
                    0
                  )
                  return (
                    <td
                      key={`cf-available-${year.year}`}
                      className="lbo-exit-performance-value lbo-exit-performance-value-strong"
                    >
                      {formatNumber(scheduleEntry?.cashFlowAvailableForDebtRepayment ?? fallbackCashAvailable)}
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Repayment of senior debt</td>
                {debtSchedule.map((entry) => (
                  <td key={`cf-senior-repayment-${entry.year}`} className="lbo-exit-performance-value">
                    {formatNumber(entry.senior.repayment)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Repayment of subordinated debt</td>
                {debtSchedule.map((entry) => (
                  <td key={`cf-subordinated-repayment-${entry.year}`} className="lbo-exit-performance-value">
                    {formatNumber(entry.subordinated.repayment)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="lbo-exit-performance-empty">Set an exit year to view the cash flow estimation.</p>
        )}
      </div>

      <div className="lbo-exit-performance-section">
        <h3 className="lbo-exit-performance-title">Debt schedule</h3>
        {yearsBetweenEntryAndExit.length > 0 ? (
          <table className="lbo-exit-performance-table">
            <thead>
              <tr>
                <th className="lbo-exit-performance-header">Metric</th>
                {debtSchedule.map((entry) => (
                  <th key={`debt-head-${entry.year}`} className="lbo-exit-performance-header">
                    {entry.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="lbo-exit-performance-label">Senior debt - beginning balance</td>
                {debtSchedule.map((entry) => (
                  <td key={`senior-begin-${entry.year}`} className="lbo-exit-performance-value">
                    {formatNumber(entry.senior.startingBalance)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Senior debt - interest expense</td>
                {debtSchedule.map((entry) => (
                  <td key={`senior-interest-${entry.year}`} className="lbo-exit-performance-value">
                    {formatNumber(entry.senior.interestExpense)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Senior debt - repayment</td>
                {debtSchedule.map((entry) => (
                  <td key={`senior-repayment-${entry.year}`} className="lbo-exit-performance-value">
                    {formatNumber(entry.senior.repayment)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Senior debt - ending balance</td>
                {debtSchedule.map((entry) => (
                  <td key={`senior-ending-${entry.year}`} className="lbo-exit-performance-value">
                    {formatNumber(entry.senior.endingBalance)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Subordinated debt - beginning balance</td>
                {debtSchedule.map((entry) => (
                  <td key={`sub-begin-${entry.year}`} className="lbo-exit-performance-value">
                    {formatNumber(entry.subordinated.startingBalance)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Subordinated debt - interest expense</td>
                {debtSchedule.map((entry) => (
                  <td key={`sub-interest-${entry.year}`} className="lbo-exit-performance-value">
                    {formatNumber(entry.subordinated.interestExpense)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Subordinated debt - repayment</td>
                {debtSchedule.map((entry) => (
                  <td key={`sub-repayment-${entry.year}`} className="lbo-exit-performance-value">
                    {formatNumber(entry.subordinated.repayment)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label">Subordinated debt - ending balance</td>
                {debtSchedule.map((entry) => (
                  <td key={`sub-ending-${entry.year}`} className="lbo-exit-performance-value">
                    {formatNumber(entry.subordinated.endingBalance)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="lbo-exit-performance-label lbo-exit-performance-label-strong">Total debt</td>
                {debtSchedule.map((entry) => (
                  <td key={`total-debt-${entry.year}`} className="lbo-exit-performance-value lbo-exit-performance-value-strong">
                    {formatNumber(entry.senior.endingBalance + entry.subordinated.endingBalance)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="lbo-exit-performance-empty">Set an exit year to view the debt schedule.</p>
        )}
      </div>
    </div>
  )
}

