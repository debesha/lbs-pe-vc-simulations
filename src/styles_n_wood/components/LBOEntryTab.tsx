import { useMemo, useState } from 'react'
import { accountingData } from '../data/accountingData'
import { preDealShareholderMeta, preDealShareholders } from '../data/shareholderStructure'
import type { ShareholderStructureRow } from '../types'
import { calculateEquityStructure } from '../utils/calculateEquityStructure'
import { PieChart } from './PieChart'
import { SourcesOfFundsPieChart } from './SourcesOfFundsPieChart'
import './LBOEntryTab.css'

const MULTIPLE_DEFAULT = 6
const MULTIPLE_MIN = 4
const MULTIPLE_MAX = 12
const MULTIPLE_STEP = 0.1
const SENIOR_DEBT_DEFAULT = 10000
const SUBORDINATED_DEBT_DEFAULT = 4000
const SENIOR_DEBT_INTEREST_RATE_DEFAULT = 7.5
const SUBORDINATED_DEBT_INTEREST_RATE_DEFAULT = 9.0
const FINANCING_FEES_RATE_DEFAULT = 2.0
const ADVISORY_FEE_RATE_DEFAULT = 3.0
const MANAGEMENT_ROLLOVER_RATE_DEFAULT = 50
const MANAGEMENT_ROLLOVER_MIN = 20
const MANAGEMENT_ROLLOVER_MAX = 80
const MANAGEMENT_ROLLOVER_STEP = 1

const createOwnershipChartData = (rows: ShareholderStructureRow[]) => {
  if (!rows.length) {
    return []
  }

  const percentTotal = rows.reduce((sum, row) => sum + (row.ownershipPercent ?? 0), 0)
  if (percentTotal > 0) {
    return rows
      .map((row) => ({
        label: row.name,
        value: row.ownershipPercent ?? 0,
      }))
      .filter((item) => item.value > 0)
  }

  const valueTotal = rows.reduce((sum, row) => sum + (row.equityValue ?? 0), 0)
  if (valueTotal > 0) {
    return rows
      .map((row) => ({
        label: row.name,
        value: row.equityValue ?? 0,
      }))
      .filter((item) => item.value > 0)
  }

  return []
}

export function LBOEntryTab() {
  const { years } = accountingData
  const [multiple, setMultiple] = useState<string>(MULTIPLE_DEFAULT.toString())
  const [seniorDebt, setSeniorDebt] = useState<string>(SENIOR_DEBT_DEFAULT.toString())
  const [subordinatedDebt, setSubordinatedDebt] = useState<string>(SUBORDINATED_DEBT_DEFAULT.toString())
  const [seniorDebtInterestRate, setSeniorDebtInterestRate] = useState<string>(SENIOR_DEBT_INTEREST_RATE_DEFAULT.toString())
  const [subordinatedDebtInterestRate, setSubordinatedDebtInterestRate] = useState<string>(SUBORDINATED_DEBT_INTEREST_RATE_DEFAULT.toString())
  const [financingFeesRate, setFinancingFeesRate] = useState<string>(FINANCING_FEES_RATE_DEFAULT.toString())
  const [advisoryFeeRate, setAdvisoryFeeRate] = useState<string>(ADVISORY_FEE_RATE_DEFAULT.toString())
  const [managementRolloverRate, setManagementRolloverRate] = useState<string>(MANAGEMENT_ROLLOVER_RATE_DEFAULT.toString())
  const [isTransactionEquityExpanded, setIsTransactionEquityExpanded] = useState(false)
  const preDealOwnershipPercentTotal = preDealShareholderMeta?.ownershipPercentTotal
  const equitySponsorName = preDealShareholderMeta?.equitySponsorName ?? 'Sponsor equity'

  const multipleValue = useMemo(() => {
    const parsed = parseFloat(multiple)
    return Number.isNaN(parsed) ? undefined : parsed
  }, [multiple])

  const managementRolloverRateValue = useMemo(() => {
    const parsed = parseFloat(managementRolloverRate)
    return Number.isNaN(parsed) ? undefined : parsed
  }, [managementRolloverRate])

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
    if (entryEBITDA === undefined || multipleValue === undefined) return undefined
    return entryEBITDA * multipleValue
  }, [entryEBITDA, multipleValue])

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

  const {
    managementRolloverAmount,
    sponsorEquityAmount,
    managementPostDealOwnershipPct,
    sponsorPostDealOwnershipPct,
    preDealStructure,
    postDealStructure,
    totalPreDealEquityValue,
    totalRolledEquityAmount,
  } = useMemo(
    () =>
      calculateEquityStructure({
        managementRolloverRate,
        equityPlug,
        equityValue,
        preDealShareholders,
        ownershipPercentTotal: preDealOwnershipPercentTotal,
      }),
    [managementRolloverRate, equityPlug, equityValue, preDealOwnershipPercentTotal]
  )

  // Total Sources
  const totalSources = useMemo(() => {
    if (equityPlug === undefined) return undefined
    const managementContribution = totalRolledEquityAmount ?? managementRolloverAmount ?? 0
    const sponsorContribution = sponsorEquityAmount ?? 0
    return seniorDebtValue + subordinatedDebtValue + managementContribution + sponsorContribution
  }, [equityPlug, seniorDebtValue, subordinatedDebtValue, totalRolledEquityAmount, managementRolloverAmount, sponsorEquityAmount])

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

  const formatPercentage = (value: number | undefined) =>
    value === undefined ? '-' : `${value.toFixed(1)}%`

  const handleManagementRolloverRateChange = (value: string) => {
    setManagementRolloverRate(value)
  }

  const hasPreDealStructure = preDealStructure.length > 0
  const postDealStructureMap = useMemo(
    () => new Map(postDealStructure.map((row) => [row.id ?? row.name, row])),
    [postDealStructure]
  )
  const showPostDealPercentages = equityPlug !== undefined && equityPlug > 0

  const displayPostDealStructure = useMemo(
    () =>
      postDealStructure.map((row) =>
        row.isSponsor
          ? {
              ...row,
              name: equitySponsorName,
            }
          : row
      ),
    [postDealStructure, equitySponsorName]
  )

  const preDealOwnershipChartData = useMemo(() => createOwnershipChartData(preDealStructure), [preDealStructure])

  const postDealOwnershipChartData = useMemo(
    () => (showPostDealPercentages ? createOwnershipChartData(displayPostDealStructure) : []),
    [displayPostDealStructure, showPostDealPercentages]
  )

  const { managementCashPayment, paymentTo3i, managementRolloverSplitValue } = useMemo(() => {
    if (!hasPreDealStructure) {
      return { managementCashPayment: 0, paymentTo3i: 0, managementRolloverSplitValue: 0 }
    }
    const managementShareholders = preDealStructure.filter((row) => row.isManagement && !row.exitsFully)
    const managementPreValue = managementShareholders.reduce((sum, row) => sum + (row.equityValue ?? 0), 0)
    const managementRolled = managementShareholders.reduce((sum, row) => sum + (postDealStructureMap.get(row.id ?? row.name)?.equityValue ?? 0), 0)
    const managementCash = Math.max(managementPreValue - managementRolled, 0)

    const paymentTo3iRow =
      preDealStructure.find((row) => (row.id ?? row.name).toLowerCase() === '3i' || row.name.toLowerCase().includes('3i')) ??
      preDealStructure.find((row) => row.exitsFully)
    const threeiPayment = paymentTo3iRow?.equityValue ?? 0

    return {
      managementCashPayment: managementCash,
      paymentTo3i: threeiPayment,
      managementRolloverSplitValue: managementRolled,
    }
  }, [hasPreDealStructure, preDealStructure, postDealStructureMap])

  const canShowEquitySplit = hasPreDealStructure && equityValue !== undefined

  const toggleTransactionEquitySplit = () => {
    if (!canShowEquitySplit) return
    setIsTransactionEquityExpanded((prev) => !prev)
  }

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
              <label className="lbo-entry-label" htmlFor="lbo-entry-multiple-slider">
                Multiple:
              </label>
              <div className="lbo-entry-slider-control">
                <input
                  id="lbo-entry-multiple-slider"
                  type="range"
                  min={MULTIPLE_MIN}
                  max={MULTIPLE_MAX}
                  step={MULTIPLE_STEP}
                  value={multiple}
                  onChange={(event) => handleMultipleChange(event.target.value)}
                  className="lbo-entry-slider"
                  aria-label="Assumed multiple for enterprise value calculation"
                />
                <span className="lbo-entry-slider-value">{formatMultiple(multipleValue)}</span>
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
            <div className="lbo-entry-row">
              <label className="lbo-entry-label" htmlFor="lbo-entry-management-rollover-slider">
                Management rollover:
                <span className="lbo-entry-assumption-legend"> (% of management proceeds)</span>
              </label>
              <div className="lbo-entry-slider-control">
                <input
                  id="lbo-entry-management-rollover-slider"
                  type="range"
                  min={MANAGEMENT_ROLLOVER_MIN}
                  max={MANAGEMENT_ROLLOVER_MAX}
                  step={MANAGEMENT_ROLLOVER_STEP}
                  value={managementRolloverRate}
                  onChange={(event) => handleManagementRolloverRateChange(event.target.value)}
                  className="lbo-entry-slider"
                  aria-label="Management rollover percentage assumption"
                />
                <span className="lbo-entry-slider-value">{formatPercentage(managementRolloverRateValue)}</span>
              </div>
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
                  <td className="lbo-entry-table-label lbo-entry-table-label-expandable">
                    {canShowEquitySplit ? (
                      <button
                        type="button"
                        className="lbo-entry-expand-button"
                        onClick={toggleTransactionEquitySplit}
                        aria-expanded={isTransactionEquityExpanded}
                      >
                        <span>{isTransactionEquityExpanded ? '−' : '+'}</span>
                        Transaction equity value
                      </button>
                    ) : (
                      'Transaction equity value'
                    )}
                  </td>
                  <td className="lbo-entry-table-value">{formatNumber(equityValue)}</td>
                </tr>
                {canShowEquitySplit && isTransactionEquityExpanded && (
                  <>
                    <tr className="lbo-entry-table-subrow">
                      <td className="lbo-entry-table-label">Payment to management</td>
                      <td className="lbo-entry-table-value">{formatNumber(managementCashPayment)}</td>
                    </tr>
                    <tr className="lbo-entry-table-subrow">
                      <td className="lbo-entry-table-label">Payment to 3i</td>
                      <td className="lbo-entry-table-value">{formatNumber(paymentTo3i)}</td>
                    </tr>
                    <tr className="lbo-entry-table-subrow">
                      <td className="lbo-entry-table-label">Management rollover</td>
                      <td className="lbo-entry-table-value">{formatNumber(managementRolloverSplitValue)}</td>
                    </tr>
                  </>
                )}
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
                  <td className="lbo-entry-table-label">Management rollover</td>
                  <td className="lbo-entry-table-value lbo-entry-table-calculated">
                    {formatNumber(totalRolledEquityAmount ?? managementRolloverAmount)}
                  </td>
                  <td className="lbo-entry-table-value">-</td>
                  <td className="lbo-entry-table-value">{formatPercentage(managementPostDealOwnershipPct)}</td>
                </tr>
                <tr>
                  <td className="lbo-entry-table-label">{equitySponsorName} equity (plug)</td>
                  <td className="lbo-entry-table-value lbo-entry-table-calculated">{formatNumber(sponsorEquityAmount)}</td>
                  <td className="lbo-entry-table-value">-</td>
                  <td className="lbo-entry-table-value">{formatPercentage(sponsorPostDealOwnershipPct)}</td>
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
              managementRollover: totalRolledEquityAmount ?? managementRolloverAmount ?? 0,
              sponsorEquity: sponsorEquityAmount ?? 0,
            }}
            sponsorLabel={equitySponsorName}
          />
        </div>
      </div>

      <div className="lbo-entry-equity-structure">
        <h3 className="lbo-entry-equity-structure-title">Equity Structure</h3>
        <div className="lbo-entry-equity-structure-grid">
          <div className="lbo-entry-equity-card">
            <h4 className="lbo-entry-equity-card-title">Pre-deal equity structure</h4>
            {preDealShareholderMeta?.dateLabel && (
              <p className="lbo-entry-equity-card-subtitle">{preDealShareholderMeta.dateLabel}</p>
            )}
          <div className="lbo-entry-equity-card-content">
            <div className="lbo-entry-equity-card-table">
              <table className="lbo-entry-table">
                <thead>
                  <tr>
                    <th className="lbo-entry-table-header-label"></th>
                    <th className="lbo-entry-table-header-value">% ownership</th>
                    <th className="lbo-entry-table-header-value">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {hasPreDealStructure ? (
                    preDealStructure.map((row) => (
                      <tr key={row.id ?? row.name}>
                        <td className="lbo-entry-table-label">{row.name}</td>
                        <td className="lbo-entry-table-value">{formatPercentage(row.ownershipPercent)}</td>
                        <td className="lbo-entry-table-value">{formatNumber(row.equityValue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="lbo-entry-table-label" colSpan={3}>
                        Configure shareholder values to display the pre-deal structure.
                      </td>
                    </tr>
                  )}
                  <tr className="lbo-entry-table-total">
                    <td className="lbo-entry-table-label">Total</td>
                    <td className="lbo-entry-table-value">{hasPreDealStructure ? formatPercentage(100) : '-'}</td>
                    <td className="lbo-entry-table-value">{formatNumber(totalPreDealEquityValue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="lbo-entry-equity-card-chart">
              <h5 className="lbo-entry-equity-card-chart-title">Ownership distribution</h5>
              <PieChart
                data={preDealOwnershipChartData}
                width={260}
                height={260}
                minLabelPercentage={3}
                emptyStateMessage="Configure shareholder values to display the pre-deal distribution."
              />
            </div>
          </div>
          </div>
          <div className="lbo-entry-equity-card">
            <h4 className="lbo-entry-equity-card-title">Post-deal equity structure</h4>
          <div className="lbo-entry-equity-card-content">
            <div className="lbo-entry-equity-card-table">
              <table className="lbo-entry-table">
                <thead>
                  <tr>
                    <th className="lbo-entry-table-header-label"></th>
                    <th className="lbo-entry-table-header-value">% ownership</th>
                    <th className="lbo-entry-table-header-value">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {displayPostDealStructure.map((row) => (
                    <tr key={row.id ?? row.name}>
                      <td className="lbo-entry-table-label">{row.name}</td>
                      <td className="lbo-entry-table-value">
                        {showPostDealPercentages ? formatPercentage(row.ownershipPercent) : '-'}
                      </td>
                      <td className="lbo-entry-table-value">{formatNumber(row.equityValue)}</td>
                    </tr>
                  ))}
                  <tr className="lbo-entry-table-total">
                    <td className="lbo-entry-table-label">Total</td>
                    <td className="lbo-entry-table-value">{showPostDealPercentages ? formatPercentage(100) : '-'}</td>
                    <td className="lbo-entry-table-value">{formatNumber(equityPlug)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="lbo-entry-equity-card-chart">
              <h5 className="lbo-entry-equity-card-chart-title">Post-deal distribution</h5>
              <PieChart
                data={postDealOwnershipChartData}
                width={260}
                height={260}
                minLabelPercentage={3}
                emptyStateMessage="Set deal inputs to calculate the post-deal distribution."
              />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

