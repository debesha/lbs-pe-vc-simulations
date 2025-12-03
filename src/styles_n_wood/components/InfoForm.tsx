import { useMemo } from 'react'
import { useLBOAssumptions } from '../context/LBOAssumptionsContext'
import { useAccountingData } from '../hooks/useAccountingData'
import {
  ENTRY_NET_CASH_YEAR,
  ENTRY_YEAR,
  buildDebtSchedule,
  calculateHoldingPeriodYears,
  calculateNetCashMinusDebt,
  calculateTotalDebtAtExit,
} from '../utils/exitModel'
import './InfoForm.css'

export function InfoForm() {
  const { entryMultiple, exitMultiple, selectedExitYear, seniorDebtInterestRate, subordinatedDebtInterestRate } =
    useLBOAssumptions()
  const { years } = useAccountingData()

  const parsePercentageInput = (value: string) => {
    const parsed = parseFloat(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  const entryYearData = useMemo(() => years.find((year) => year.year === ENTRY_YEAR), [years])
  const entryNetCashYearData = useMemo(() => years.find((year) => year.year === ENTRY_NET_CASH_YEAR), [years])
  const entryEbit = entryYearData?.ebit
  const entryNetCash = entryNetCashYearData?.cashAtBankAndInHandOperating

  const selectedExitYearNumber = useMemo(() => {
    const parsed = parseInt(selectedExitYear, 10)
    return Number.isNaN(parsed) ? undefined : parsed
  }, [selectedExitYear])

  const exitYearData = useMemo(
    () => years.find((year) => year.year === selectedExitYearNumber),
    [years, selectedExitYearNumber]
  )

  const exitEbit = exitYearData?.ebit
  const netCash = exitYearData?.cashAtBankAndInHandOperating

  const entryMultipleValue = useMemo(() => {
    const parsed = parseFloat(entryMultiple)
    return Number.isNaN(parsed) ? undefined : parsed
  }, [entryMultiple])

  const exitMultipleValue = useMemo(() => {
    const parsed = parseFloat(exitMultiple)
    return Number.isNaN(parsed) ? undefined : parsed
  }, [exitMultiple])

  const yearsBetweenEntryAndExit = useMemo(
    () => {
      const exitYear = selectedExitYearNumber ?? ENTRY_YEAR
      return years.filter((year) => year.year >= ENTRY_YEAR && year.year <= exitYear)
    },
    [years, selectedExitYearNumber]
  )

  const debtSchedule = useMemo(() => {
    const seniorRatePercent = parsePercentageInput(seniorDebtInterestRate)
    const subordinatedRatePercent = parsePercentageInput(subordinatedDebtInterestRate)
    return buildDebtSchedule(yearsBetweenEntryAndExit, seniorRatePercent, subordinatedRatePercent)
  }, [yearsBetweenEntryAndExit, seniorDebtInterestRate, subordinatedDebtInterestRate])

  const debtScheduleByYear = useMemo(() => {
    const map = new Map<number, (typeof debtSchedule)[number]>()
    debtSchedule.forEach((entry) => map.set(entry.year, entry))
    return map
  }, [debtSchedule])

  const totalDebtAtExit = useMemo(
    () => calculateTotalDebtAtExit(selectedExitYearNumber, debtScheduleByYear, exitYearData),
    [selectedExitYearNumber, debtScheduleByYear, exitYearData]
  )

  const netCashMinusDebt = useMemo(
    () => calculateNetCashMinusDebt(netCash, totalDebtAtExit),
    [netCash, totalDebtAtExit]
  )

  const entryEnterpriseValue = useMemo(() => {
    if (entryEbit === undefined || entryMultipleValue === undefined) return undefined
    return entryEbit * entryMultipleValue
  }, [entryEbit, entryMultipleValue])

  const exitEnterpriseValue = useMemo(() => {
    if (exitEbit === undefined || exitMultipleValue === undefined) return undefined
    return exitEbit * exitMultipleValue
  }, [exitEbit, exitMultipleValue])

  const entryEquityValue = useMemo(() => {
    if (entryEnterpriseValue === undefined || entryNetCash === undefined) return undefined
    return entryEnterpriseValue + entryNetCash
  }, [entryEnterpriseValue, entryNetCash])

  const exitEquityValue = useMemo(() => {
    if (exitEnterpriseValue === undefined || netCashMinusDebt === undefined) return undefined
    return exitEnterpriseValue + netCashMinusDebt
  }, [exitEnterpriseValue, netCashMinusDebt])

  const moic = useMemo(() => {
    if (entryEquityValue === undefined || exitEquityValue === undefined || entryEquityValue === 0) return undefined
    return exitEquityValue / entryEquityValue
  }, [entryEquityValue, exitEquityValue])

  const holdingPeriodYears = useMemo(
    () => calculateHoldingPeriodYears(selectedExitYearNumber),
    [selectedExitYearNumber]
  )

  const irr = useMemo(() => {
    if (moic === undefined || holdingPeriodYears === undefined) return undefined
    return Math.pow(moic, 1 / holdingPeriodYears) - 1
  }, [moic, holdingPeriodYears])

  const formatNumber = (value: number | undefined) =>
    value === undefined ? '—' : value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const formatMultiple = (value: number | undefined) => (value === undefined ? '—' : `${value.toFixed(1)}x`)

  const formatMoic = (value: number | undefined) => (value === undefined ? '—' : `${value.toFixed(2)}x`)

  const formatIrr = (value: number | undefined) => (value === undefined ? '—' : `${(value * 100).toFixed(1)}%`)

  const formatHoldingPeriod = (value: number | undefined) => (value === undefined ? '—' : `${value.toFixed(1)} yrs`)

  const generateSensitivityValues = (center: number | undefined) => {
    if (center === undefined || Number.isNaN(center)) {
      return [] as number[]
    }

    const SENSITIVITY_STEP = 0.25
    const SENSITIVITY_STEPS_EACH_SIDE = 6
    const values: number[] = []
    for (let offset = -SENSITIVITY_STEPS_EACH_SIDE; offset <= SENSITIVITY_STEPS_EACH_SIDE; offset += 1) {
      const candidate = parseFloat((center + offset * SENSITIVITY_STEP).toFixed(2))
      if (candidate > 0) {
        values.push(candidate)
      }
    }
    return values
  }

  const entryMultipleRange = useMemo(() => generateSensitivityValues(entryMultipleValue), [entryMultipleValue])
  const exitMultipleRange = useMemo(() => generateSensitivityValues(exitMultipleValue), [exitMultipleValue])

  const irrSensitivityMatrix = useMemo(() => {
    if (
      entryMultipleRange.length === 0 ||
      exitMultipleRange.length === 0 ||
      entryEbit === undefined ||
      entryNetCash === undefined ||
      exitEbit === undefined ||
      netCashMinusDebt === undefined ||
      holdingPeriodYears === undefined ||
      holdingPeriodYears <= 0
    ) {
      return [] as Array<Array<number | undefined>>
    }

    return exitMultipleRange.map((exitMultipleCandidate) => {
      const exitEquityCandidate = exitEbit * exitMultipleCandidate + netCashMinusDebt
      return entryMultipleRange.map((entryMultipleCandidate) => {
        const entryEquityCandidate = entryEbit * entryMultipleCandidate + entryNetCash
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
    entryEbit,
    entryNetCash,
    exitEbit,
    netCashMinusDebt,
    holdingPeriodYears,
  ])
  const ebitSeries = useMemo(() => {
    const maxValue = Math.max(...years.map((year) => year.ebit ?? 0), 1)
    return years.map((year) => ({
      year: year.year,
      value: year.ebit ?? 0,
      ratio: (year.ebit ?? 0) / maxValue,
    }))
  }, [years])

  return (
    <div className="info-dashboard">
      <div className="info-summary">
        <div className="info-summary-grid">
          <div className="info-summary-item">
            <span className="info-label info-summary-label">Company Name</span>
            <span className="info-value info-summary-value">Styles & Wood Limited ('S&W')</span>
          </div>
          <div className="info-summary-item">
            <span className="info-label info-summary-label">Holding period</span>
            <span className="info-value info-summary-value">{formatHoldingPeriod(holdingPeriodYears)}</span>
          </div>
          <div className="info-summary-item">
            <span className="info-label info-summary-label">Entry Date</span>
            <span className="info-value info-summary-value">May 2004</span>
          </div>
          <div className="info-summary-item">
            <span className="info-label info-summary-label">Exit Date</span>
            <span className="info-value info-summary-value">{selectedExitYearNumber ?? '—'}</span>
          </div>
          <div className="info-summary-item">
            <span className="info-label info-summary-label">Entry multiple</span>
            <span className="info-value info-summary-value">{formatMultiple(entryMultipleValue)}</span>
          </div>
          <div className="info-summary-item">
            <span className="info-label info-summary-label">Exit multiple</span>
            <span className="info-value info-summary-value">{formatMultiple(exitMultipleValue)}</span>
          </div>
          <div className="info-summary-item">
            <span className="info-label info-summary-label">Enterprise value (entry)</span>
            <span className="info-value info-summary-value">{formatNumber(entryEnterpriseValue)}</span>
          </div>
          <div className="info-summary-item">
            <span className="info-label info-summary-label">Enterprise value (exit)</span>
            <span className="info-value info-summary-value">{formatNumber(exitEnterpriseValue)}</span>
          </div>
          <div className="info-summary-item">
            <span className="info-label info-summary-label">Equity value (entry)</span>
            <span className="info-value info-summary-value">{formatNumber(entryEquityValue)}</span>
          </div>
          <div className="info-summary-item">
            <span className="info-label info-summary-label">Equity value (exit)</span>
            <span className="info-value info-summary-value">{formatNumber(exitEquityValue)}</span>
          </div>
          <div className="info-summary-item">
            <span className="info-label info-summary-label">MOIC</span>
            <span className="info-value info-summary-value">{formatMoic(moic)}</span>
          </div>
          <div className="info-summary-item">
            <span className="info-label info-summary-label">IRR</span>
            <span className="info-value info-summary-value">{formatIrr(irr)}</span>
          </div>
        </div>
        <div className="info-sensitivity-card">
          <h3 className="info-sensitivity-title">IRR Sensitivity</h3>
          {irrSensitivityMatrix.length > 0 ? (
            <div className="info-sensitivity-table-wrapper">
              <table className="info-sensitivity-table">
                <thead>
                  <tr>
                    <th className="exit-sensitivity-corner-cell">Exit \ Entry</th>
                    {entryMultipleRange.map((value) => (
                      <th key={`info-entry-multiple-${value}`} className="exit-sensitivity-header-cell">
                        {value.toFixed(2)}x
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exitMultipleRange.map((exitValue, rowIndex) => (
                    <tr key={`info-exit-multiple-row-${exitValue}`}>
                      <th className="exit-sensitivity-header-cell">{exitValue.toFixed(2)}x</th>
                      {irrSensitivityMatrix[rowIndex]?.map((irrValue, colIndex) => (
                        <td key={`info-irr-cell-${exitValue}-${entryMultipleRange[colIndex]}`} className="exit-sensitivity-cell">
                          {irrValue === undefined ? '—' : formatIrr(irrValue)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="info-sensitivity-empty">Adjust exit assumptions to view sensitivity.</p>
          )}
        </div>
      </div>
      <div className="info-chart-card">
        <h3 className="info-chart-title">EBIT progression</h3>
        <div className="info-ebitda-chart">
          {ebitSeries.map((entry) => (
            <div key={entry.year} className="info-chart-bar vertical">
              <div className="info-chart-bar-track vertical">
                <div className="info-chart-bar-fill vertical" style={{ height: `${Math.max(entry.ratio * 100, 4)}%` }} />
              </div>
              <span className="info-chart-bar-label">{entry.year}</span>
              <span className="info-chart-bar-value">{formatNumber(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

