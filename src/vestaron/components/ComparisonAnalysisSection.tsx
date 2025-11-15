import { useAppSelector } from '../store/hooks'
import { formatCurrency } from '../utils/formatUtils'
import './ReturnComparisonTab.css'

export function ComparisonAnalysisSection() {
  const comparison = useAppSelector((state) => state.returnComparison.comparison)

  return (
    <div className="highlight">
      <h3>Comparison & Analysis</h3>
      <div className="metric-box">
        <div className="metric">
          <div className="metric-label">Net Value Difference</div>
          <div
            id="netValueDiff"
            className={`metric-value ${comparison.netValueDiff >= 0 ? 'positive' : 'negative'}`}
          >
            {comparison.netValueDiff >= 0 ? '+' : ''}
            {formatCurrency(comparison.netValueDiff)}
          </div>
        </div>
        <div className="metric">
          <div className="metric-label">Return Difference</div>
          <div
            id="returnDiff"
            className={`metric-value ${comparison.returnDiff >= 0 ? 'positive' : 'negative'}`}
          >
            {comparison.returnDiff >= 0 ? '+' : ''}
            {Math.abs(comparison.returnDiff).toFixed(1)}%
          </div>
        </div>
        <div className="metric">
          <div className="metric-label">Multiple Difference</div>
          <div
            id="multipleDiff"
            className={`metric-value ${comparison.multipleDiff >= 0 ? 'positive' : 'negative'}`}
          >
            {comparison.multipleDiff >= 0 ? '+' : ''}
            {Math.abs(comparison.multipleDiff).toFixed(2)}x
          </div>
        </div>
        <div className="metric">
          <div className="metric-label">Advantage</div>
          <div
            id="advantage"
            className={`metric-value ${comparison.advantage === 'Certificate' ? 'positive' : 'negative'}`}
          >
            {comparison.advantage}
          </div>
        </div>
        <div className="metric">
          <div className="metric-label">IRR Difference</div>
          <div
            id="irrDiff"
            className={`metric-value ${comparison.irrDiff >= 0 ? 'positive' : 'negative'}`}
          >
            {comparison.irrDiff >= 0 ? '+' : ''}
            {Math.abs(comparison.irrDiff).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}

