import { EXIT_YEARS, formatMillions, formatPercent } from '../utils/calculations'
import { PerformanceResult } from '../types'
import CashEventsList from './CashEventsList'

type SliderProps = {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}

type FundCardProps = {
  label: string
  allocation: number
  results: PerformanceResult
  options: {
    slider?: SliderProps
    exitYear: number
    onExitYearChange: (value: number) => void
    highlightClass: string
    showMultiplierLabel?: boolean
    disabled?: boolean
    controlsDisabled?: boolean
    inactiveMessage?: string
    hideExitSelector?: boolean
    exitNote?: string
  }
}

function FundCard({ label, allocation, results, options }: FundCardProps) {
  return (
    <div className={`fund-card ${options.highlightClass} ${options.disabled ? 'disabled' : ''}`}>
      <div className="fund-card__header">
        <p className="fund-card__eyebrow">{label}</p>
        <h3>€{formatMillions(allocation)}m committed</h3>
      </div>

      {options.slider && (
        <div className="slider-group">
          <div className="slider-label">
            <span>Expected gross multiple</span>
            <strong>{options.slider.value.toFixed(1)}x</strong>
          </div>
          <input
            type="range"
            min={options.slider.min}
            max={options.slider.max}
            step={options.slider.step}
            value={options.slider.value}
            onChange={(event) => options.slider!.onChange(Number(event.target.value))}
            disabled={options.controlsDisabled ?? options.disabled}
          />
        </div>
      )}

      {options.hideExitSelector ? (
        <div className="selector-group readonly">
          <label>Exit year</label>
          <div className="readonly-pill">{options.exitNote ?? `Linked to buyout exit (Year ${options.exitYear})`}</div>
        </div>
      ) : (
        <div className="selector-group">
          <label htmlFor={`${label}-exit`}>Exit year</label>
          <select
            id={`${label}-exit`}
            value={options.exitYear}
            onChange={(event) => options.onExitYearChange(Number(event.target.value))}
            disabled={options.controlsDisabled ?? options.disabled}
          >
            {EXIT_YEARS.map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {options.disabled && options.inactiveMessage && (
        <p className="inactive-message">{options.inactiveMessage}</p>
      )}

      <div className="metrics-grid">
        <div className="metrics-column">
          <div className="metric-item">
            <p className="metric-label">Gross multiple</p>
            <p className="metric-value">
              {options.disabled ? '0.00x' : `${results.grossMultiple.toFixed(2)}x`}
            </p>
          </div>
          <div className="metric-item">
            <p className="metric-label">Net multiple</p>
            <p className="metric-value">
              {options.disabled ? '0.00x' : `${results.netMultiple.toFixed(2)}x`}
            </p>
          </div>
          <div className="metric-item">
            <p className="metric-label">Fee drag</p>
            <p className="metric-value">
              {options.disabled ? '0.00x' : results.feeDrag > 0 ? `${results.feeDrag.toFixed(2)}x` : '0.00x'}
            </p>
          </div>
        </div>
        <div className="metrics-column">
          <div className="metric-item">
            <p className="metric-label">Gross IRR</p>
            <p className="metric-value">
              {options.disabled ? 'N/A' : results.grossIrr === null ? '–' : formatPercent(results.grossIrr, 1)}
            </p>
          </div>
          <div className="metric-item">
            <p className="metric-label">Net IRR</p>
            <p className="metric-value">
              {options.disabled ? 'N/A' : results.netIrr === null ? '–' : formatPercent(results.netIrr, 1)}
            </p>
          </div>
          <div className="metric-item">
            <p className="metric-label">Net value (Yr {options.exitYear})</p>
            <p className="metric-value">
              {options.disabled ? '€0m' : `€${formatMillions(results.netValue)}m`}
            </p>
          </div>
        </div>
      </div>

      <CashEventsList events={results.cashEvents} />
    </div>
  )
}

export default FundCard

