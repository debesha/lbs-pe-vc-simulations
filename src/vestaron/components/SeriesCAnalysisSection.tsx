import { useAppSelector } from '../store/hooks'
import { formatCurrencyLarge } from '../utils/formatUtils'
import './ReturnComparisonTab.css'

export function SeriesCAnalysisSection() {
  const seriesC = useAppSelector((state) => state.returnComparison.seriesC)

  return (
    <>
      <h3 className="section-header">Series C Investor Analysis</h3>
      <div className="comparison-section">
        <div className="column certificate">
          <div className="result-box" style={{ border: 'none', paddingTop: 0 }}>
            <table className="calculation-table">
              <tbody>
                <tr>
                  <td>EV After Exit:</td>
                  <td id="certExitEV">{formatCurrencyLarge(seriesC.exitEV)}</td>
                </tr>
                <tr>
                  <td>Series C Stake:</td>
                  <td id="certSeriesCStake">{seriesC.stakeDisplay}</td>
                </tr>
                <tr>
                  <td>Series C Investment:</td>
                  <td id="certSeriesCInvestment">{formatCurrencyLarge(seriesC.investment)}</td>
                </tr>
                <tr>
                  <td>Series C MOIC:</td>
                  <td id="certSeriesCMultiple">{seriesC.multiple.toFixed(2)}x</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="column vc-fund">
          <div className="result-box" style={{ border: 'none', paddingTop: 0 }}>
            <table className="calculation-table">
              <tbody>
                <tr>
                  <td>EV After Exit:</td>
                  <td id="vcExitEV">{formatCurrencyLarge(seriesC.exitEV)}</td>
                </tr>
                <tr>
                  <td>Series C Stake:</td>
                  <td id="vcSeriesCStake">{seriesC.stakeDisplay}</td>
                </tr>
                <tr>
                  <td>Series C Investment:</td>
                  <td id="vcSeriesCInvestment">{formatCurrencyLarge(seriesC.investment)}</td>
                </tr>
                <tr>
                  <td>Series C MOIC:</td>
                  <td id="vcSeriesCMultiple">{seriesC.multiple.toFixed(2)}x</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

