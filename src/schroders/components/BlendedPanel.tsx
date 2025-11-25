import { formatMillions, formatPercent } from '../utils/calculations'
import { CashEvent } from '../types'
import CashEventsList from './CashEventsList'

type BlendedPanelProps = {
  netMultiple: number
  netIrr: number | null
  totalFees: number
  netValue: number
  cashEvents: CashEvent[]
}

function BlendedPanel({ netMultiple, netIrr, totalFees, netValue, cashEvents }: BlendedPanelProps) {
  return (
    <section className="blended-panel">
      <div>
        <p className="blended-eyebrow">Blended outcome</p>
        <h2>Portfolio look-through</h2>
        <p className="intro">Aggregated cash flows across the combined commitment profile.</p>
      </div>
      <div className="blended-metrics">
        <div>
          <p className="metric-label">Net multiple</p>
          <p className="metric-value">{netMultiple.toFixed(2)}x</p>
        </div>
        <div>
          <p className="metric-label">Net IRR</p>
          <p className="metric-value">{netIrr === null ? '–' : formatPercent(netIrr, 1)}</p>
        </div>
        <div>
          <p className="metric-label">Total fees paid</p>
          <p className="metric-value">€{formatMillions(totalFees)}m</p>
        </div>
        <div>
          <p className="metric-label">Net value</p>
          <p className="metric-value">€{formatMillions(netValue)}m</p>
        </div>
      </div>

      <CashEventsList events={cashEvents} initialVisible={4} />
    </section>
  )
}

export default BlendedPanel

