import { useMemo, useState } from 'react'
import { accountingData } from '../data/accountingData'
import { SourcesOfFundsPieChart } from './SourcesOfFundsPieChart'
import './LBOEntryTab.css'

const MULTIPLE_DEFAULT = 5
const SENIOR_DEBT_DEFAULT = 10000
const SUBORDINATED_DEBT_DEFAULT = 4000
const SENIOR_DEBT_INTEREST_RATE_DEFAULT = 7.5
const SUBORDINATED_DEBT_INTEREST_RATE_DEFAULT = 9.0
const FINANCING_FEES_RATE_DEFAULT = 2.0
const ADVISORY_FEE_RATE_DEFAULT = 3.0

export function LBOEntryTab() {
  const { years } = accountingData
  const [multiple, setMultiple] = useState<string>(MULTIPLE_DEFAULT.toString())
  const [seniorDebt, setSeniorDebt] = useState<string>(SENIOR_DEBT_DEFAULT.toString())
  const [subordinatedDebt, setSubordinatedDebt] = useState<string>(SUBORDINATED_DEBT_DEFAULT.toString())
  const [seniorDebtInterestRate, setSeniorDebtInterestRate] = useState<string>(SENIOR_DEBT_INTEREST_RATE_DEFAULT.toString())
  const [subordinatedDebtInterestRate, setSubordinatedDebtInterestRate] = useState<string>(SUBORDINATED_DEBT_INTEREST_RATE_DEFAULT.toString())
  const [financingFeesRate, setFinancingFeesRate] = useState<string>(FINANCING_FEES_RATE_DEFAULT.toString())
  const [advisoryFeeRate, setAdvisoryFeeRate] = useState<string>(ADVISORY_FEE_RATE_DEFAULT.toString())

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

  // Sources and Uses calculations
  const refinancedDebt = 0

  // Calculate advisory fees and financing fees based on rates
  const advisoryFees = useMemo(() => {
    if (enterpriseValue === undefined) return 0
    const rate = parseFloat(advisoryFeeRate)
    if (Number.isNaN(rate)) return 0
    return (rate / 100) * enterpriseValue
  }, [enterpriseValue, advisoryFeeRate])

  const financingFees = useMemo(() => {
    const seniorDebtVal = parseFloat(seniorDebt)
    const subordinatedDebtVal = parseFloat(subordinatedDebt)
    const totalDebt = (Number.isNaN(seniorDebtVal) ? 0 : seniorDebtVal) + (Number.isNaN(subordinatedDebtVal) ? 0 : subordinatedDebtVal)
    const rate = parseFloat(financingFeesRate)
    if (Number.isNaN(rate)) return 0
    return (rate / 100) * totalDebt
  }, [seniorDebt, subordinatedDebt, financingFeesRate])

  // Uses of Funds
  const totalUses = useMemo(() => {
    if (equityValue === undefined) return undefined
    return equityValue + refinancedDebt + advisoryFees + financingFees
  }, [equityValue, refinancedDebt, advisoryFees, financingFees])

  // Sources of Funds
  const seniorDebtValue = useMemo(() => {
    const value = parseFloat(seniorDebt)
    return Number.isNaN(value) ? 0 : value
  }, [seniorDebt])

  const subordinatedDebtValue = useMemo(() => {
    const value = parseFloat(subordinatedDebt)
    return Number.isNaN(value) ? 0 : value
  }, [subordinatedDebt])

  // Equity plug = Total Uses - Senior Debt - Subordinated Debt
  const equityPlug = useMemo(() => {
    if (totalUses === undefined) return undefined
    return totalUses - seniorDebtValue - subordinatedDebtValue
  }, [totalUses, seniorDebtValue, subordinatedDebtValue])

  // Total Sources
  const totalSources = useMemo(() => {
    if (equityPlug === undefined) return undefined
    return seniorDebtValue + subordinatedDebtValue + equityPlug
  }, [seniorDebtValue, subordinatedDebtValue, equityPlug])

  // Calculate cumulative debt multiples
  const seniorDebtMultiple = useMemo(() => {
    if (entryEBITDA === undefined || entryEBITDA === 0) return undefined
    return seniorDebtValue / entryEBITDA
  }, [entryEBITDA, seniorDebtValue])

  const cumulativeDebtMultiple = useMemo(() => {
    if (entryEBITDA === undefined || entryEBITDA === 0) return undefined
    return (seniorDebtValue + subordinatedDebtValue) / entryEBITDA
  }, [entryEBITDA, seniorDebtValue, subordinatedDebtValue])

  const formatNumber = (value: number | undefined) =>
    value === undefined ? '' : value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const formatMultiple = (value: number | undefined) =>
    value === undefined ? '-' : `${value.toFixed(1)}x`

  const handleMultipleChange = (value: string) => {
    setMultiple(value)
  }

  const handleSeniorDebtChange = (value: string) => {
    setSeniorDebt(value)
  }

  const handleSubordinatedDebtChange = (value: string) => {
    setSubordinatedDebt(value)
  }

  const handleSeniorDebtInterestRateChange = (value: string) => {
    setSeniorDebtInterestRate(value)
  }

  const handleSubordinatedDebtInterestRateChange = (value: string) => {
    setSubordinatedDebtInterestRate(value)
  }

  const handleFinancingFeesRateChange = (value: string) => {
    setFinancingFeesRate(value)
  }

  const handleAdvisoryFeeRateChange = (value: string) => {
    setAdvisoryFeeRate(value)
  }

  return (
    <div className="lbo-entry-container">
      <h2 className="lbo-entry-title">LBO Entry</h2>
      <div className="lbo-entry-form">
        <div className="lbo-entry-form-grid">
          <div className="lbo-entry-form-column">
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
          <div className="lbo-entry-form-column">
            <div className="lbo-entry-row">
              <span className="lbo-entry-label">Financing fees rate:</span>
              <label className="lbo-entry-assumption-field">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={financingFeesRate}
                  onChange={(event) => handleFinancingFeesRateChange(event.target.value)}
                  className="lbo-entry-assumption-input"
                  aria-label="Financing fees rate assumption"
                />
                <span className="lbo-entry-assumption-suffix">%</span>
              </label>
            </div>
            <div className="lbo-entry-row">
              <span className="lbo-entry-label">Advisory fee:</span>
              <label className="lbo-entry-assumption-field">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={advisoryFeeRate}
                  onChange={(event) => handleAdvisoryFeeRateChange(event.target.value)}
                  className="lbo-entry-assumption-input"
                  aria-label="Advisory fee rate assumption"
                />
                <span className="lbo-entry-assumption-suffix">%</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="lbo-entry-sources-uses">
        <h3 className="lbo-entry-sources-uses-title">Sources and Uses of Funds</h3>
        <div className="lbo-entry-sources-uses-grid">
          <div className="lbo-entry-sources-uses-section">
            <h4 className="lbo-entry-sources-uses-section-title">Uses of Funds</h4>
            <table className="lbo-entry-table">
              <thead>
                <tr>
                  <th className="lbo-entry-table-header-label"></th>
                  <th className="lbo-entry-table-header-value">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="lbo-entry-table-label">Transaction equity value</td>
                  <td className="lbo-entry-table-value">{formatNumber(equityValue)}</td>
                </tr>
                <tr>
                  <td className="lbo-entry-table-label">Refinanced debt</td>
                  <td className="lbo-entry-table-value">{formatNumber(refinancedDebt)}</td>
                </tr>
                <tr>
                  <td className="lbo-entry-table-label">Advisory fees</td>
                  <td className="lbo-entry-table-value">{formatNumber(advisoryFees)}</td>
                </tr>
                <tr>
                  <td className="lbo-entry-table-label">Financing fees</td>
                  <td className="lbo-entry-table-value">{formatNumber(financingFees)}</td>
                </tr>
                <tr className="lbo-entry-table-total">
                  <td className="lbo-entry-table-label">Total uses of funds</td>
                  <td className="lbo-entry-table-value">{formatNumber(totalUses)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="lbo-entry-sources-uses-section">
            <h4 className="lbo-entry-sources-uses-section-title">Sources of Funds</h4>
            <table className="lbo-entry-table">
              <thead>
                <tr>
                  <th className="lbo-entry-table-header-label"></th>
                  <th className="lbo-entry-table-header-value">Amount</th>
                  <th className="lbo-entry-table-header-value">Int Rate</th>
                  <th className="lbo-entry-table-header-value">Cum Debt Mult</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="lbo-entry-table-label">Senior debt (incl RCF)</td>
                  <td className="lbo-entry-table-value">
                    <label className="lbo-entry-assumption-field">
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={seniorDebt}
                        onChange={(event) => handleSeniorDebtChange(event.target.value)}
                        className="lbo-entry-assumption-input lbo-entry-table-input"
                        aria-label="Senior debt amount"
                      />
                    </label>
                  </td>
                  <td className="lbo-entry-table-value">
                    <label className="lbo-entry-assumption-field">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={seniorDebtInterestRate}
                        onChange={(event) => handleSeniorDebtInterestRateChange(event.target.value)}
                        className="lbo-entry-assumption-input lbo-entry-table-input lbo-entry-table-rate-input"
                        aria-label="Senior debt interest rate"
                      />
                      <span className="lbo-entry-assumption-suffix">%</span>
                    </label>
                  </td>
                  <td className="lbo-entry-table-value">{formatMultiple(seniorDebtMultiple)}</td>
                </tr>
                <tr>
                  <td className="lbo-entry-table-label">Subordinated debt</td>
                  <td className="lbo-entry-table-value">
                    <label className="lbo-entry-assumption-field">
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={subordinatedDebt}
                        onChange={(event) => handleSubordinatedDebtChange(event.target.value)}
                        className="lbo-entry-assumption-input lbo-entry-table-input"
                        aria-label="Subordinated debt amount"
                      />
                    </label>
                  </td>
                  <td className="lbo-entry-table-value">
                    <label className="lbo-entry-assumption-field">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={subordinatedDebtInterestRate}
                        onChange={(event) => handleSubordinatedDebtInterestRateChange(event.target.value)}
                        className="lbo-entry-assumption-input lbo-entry-table-input lbo-entry-table-rate-input"
                        aria-label="Subordinated debt interest rate"
                      />
                      <span className="lbo-entry-assumption-suffix">%</span>
                    </label>
                  </td>
                  <td className="lbo-entry-table-value">{formatMultiple(cumulativeDebtMultiple)}</td>
                </tr>
                <tr>
                  <td className="lbo-entry-table-label">Equity = plug</td>
                  <td className="lbo-entry-table-value lbo-entry-table-calculated">{formatNumber(equityPlug)}</td>
                  <td className="lbo-entry-table-value">-</td>
                  <td className="lbo-entry-table-value">-</td>
                </tr>
                <tr className="lbo-entry-table-total">
                  <td className="lbo-entry-table-label">Total sources of funds</td>
                  <td className="lbo-entry-table-value">{formatNumber(totalSources)}</td>
                  <td className="lbo-entry-table-value">-</td>
                  <td className="lbo-entry-table-value">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="lbo-entry-pie-chart-container">
          <h4 className="lbo-entry-pie-chart-title">Sources of Funds Distribution</h4>
          <SourcesOfFundsPieChart
            data={{
              targetCash: undefined,
              seniorDebt: seniorDebtValue,
              subordinatedDebt: subordinatedDebtValue,
              equityPlug: equityPlug,
            }}
          />
        </div>
      </div>
    </div>
  )
}

