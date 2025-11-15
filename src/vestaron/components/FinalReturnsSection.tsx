import { useAppSelector } from '../store/hooks'
import { formatCurrency } from '../utils/formatUtils'
import './ReturnComparisonTab.css'

export function FinalReturnsSection() {
  const certificate = useAppSelector((state) => state.returnComparison.certificate)
  const vcFund = useAppSelector((state) => state.returnComparison.vcFund)
  const fundLife = useAppSelector((state) => state.returnComparison.fundLife)

  return (
    <>
      <h3 className="section-header">Final Returns</h3>
      <div className="comparison-section">
        <div className="column certificate">
          <div className="result-box" style={{ border: 'none', paddingTop: 0 }}>
            <table className="calculation-table">
              <tbody>
                <tr>
                  <td>Gross Fees:</td>
                  <td id="certGrossFees">
                    {certificate.grossFees > 0
                      ? formatCurrency(-certificate.grossFees)
                      : '$0'}
                  </td>
                </tr>
                <tr className="total">
                  <td>Net Value:</td>
                  <td id="certNetValue">{formatCurrency(certificate.netValue)}</td>
                </tr>
                <tr>
                  <td>Net Return:</td>
                  <td id="certNetReturn" className={certificate.netReturn >= 0 ? 'positive' : 'negative'}>
                    {certificate.netReturn.toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td>Net MOIC:</td>
                  <td id="certNetMultiple">{certificate.netMultiple.toFixed(2)}x</td>
                </tr>
                <tr style={{ borderTop: '2px solid #4caf50', fontWeight: 700 }}>
                  <td id="certIRRLabel">
                    IRR ({fundLife} {fundLife === 1 ? 'year' : 'years'}):
                  </td>
                  <td id="certIRR" style={{ color: certificate.irr >= 0 ? '#4caf50' : '#f44336' }}>
                    {certificate.irr === -100
                      ? 'N/A (loss)'
                      : `${certificate.irr.toFixed(1)}%`}
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
                  <td>Gross Fees:</td>
                  <td id="vcGrossFees">{formatCurrency(-vcFund.grossFees)}</td>
                </tr>
                <tr className="total">
                  <td>Net Value:</td>
                  <td id="vcNetValue">{formatCurrency(vcFund.netValue)}</td>
                </tr>
                <tr>
                  <td>Net Return:</td>
                  <td id="vcNetReturn" className={vcFund.netReturn >= 0 ? 'positive' : 'negative'}>
                    {vcFund.netReturn.toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td>Net MOIC:</td>
                  <td id="vcNetMultiple">{vcFund.netMultiple.toFixed(2)}x</td>
                </tr>
                <tr style={{ borderTop: '2px solid #2196f3', fontWeight: 700 }}>
                  <td id="vcIRRLabel">
                    IRR ({fundLife} {fundLife === 1 ? 'year' : 'years'}):
                  </td>
                  <td id="vcIRR" style={{ color: vcFund.irr >= 0 ? '#2196f3' : '#f44336' }}>
                    {vcFund.irr === -100 ? 'N/A (loss)' : `${vcFund.irr.toFixed(1)}%`}
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

