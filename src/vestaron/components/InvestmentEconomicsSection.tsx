import { useAppSelector } from '../store/hooks'
import { formatCurrency } from '../utils/formatUtils'
import './ReturnComparisonTab.css'

export function InvestmentEconomicsSection() {
  const certificate = useAppSelector((state) => state.returnComparison.certificate)
  const vcFund = useAppSelector((state) => state.returnComparison.vcFund)
  const fundLife = useAppSelector((state) => state.returnComparison.fundLife)

  return (
    <>
      <h3 className="section-header">Investment Economics</h3>
      <div className="comparison-section">
        <div className="column certificate">
          <div className="result-box" style={{ border: 'none', paddingTop: 0 }}>
            <table className="calculation-table">
              <tbody>
                <tr>
                  <td>Initial Investment:</td>
                  <td id="certInitialInvestment">{formatCurrency(certificate.initialInvestment)}</td>
                </tr>
                <tr>
                  <td>Structuring Fee (deducted):</td>
                  <td id="certStructuringFee">{formatCurrency(-certificate.structuringFee)}</td>
                </tr>
                <tr>
                  <td>Certificate Face Value:</td>
                  <td id="certFaceValue">{formatCurrency(certificate.faceValue)}</td>
                </tr>
                <tr style={{ borderTop: '1px solid #ccc', marginTop: '10px' }}>
                  <td>Gross MOIC (before fees):</td>
                  <td id="certGrossMOIC">{certificate.grossMOIC.toFixed(2)}x</td>
                </tr>
                <tr>
                  <td>Profit:</td>
                  <td id="certProfit">{formatCurrency(certificate.profit)}</td>
                </tr>
                <tr>
                  <td>Performance Fee:</td>
                  <td id="certPerformanceFee">
                    {certificate.performanceFee > 0
                      ? formatCurrency(-certificate.performanceFee)
                      : '$0 (no profit)'}
                  </td>
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
                  <td>Initial Investment:</td>
                  <td id="vcInitialInvestment">{formatCurrency(vcFund.initialInvestment)}</td>
                </tr>
                <tr>
                  <td>Gross MOIC (before fees):</td>
                  <td id="vcGrossMOIC">{vcFund.grossMOIC.toFixed(2)}x</td>
                </tr>
                <tr>
                  <td>Profit:</td>
                  <td id="vcProfit">{formatCurrency(vcFund.profit)}</td>
                </tr>
                <tr>
                  <td id="vcMgmtFeesLabel">
                    Management Fee ({fundLife} {fundLife === 1 ? 'year' : 'years'}):
                  </td>
                  <td id="vcMgmtFees">{formatCurrency(-vcFund.managementFee)}</td>
                </tr>
                <tr>
                  <td>Carried Interest:</td>
                  <td id="vcCarry">
                    {vcFund.carry > 0 ? formatCurrency(-vcFund.carry) : '$0 (no profit)'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

