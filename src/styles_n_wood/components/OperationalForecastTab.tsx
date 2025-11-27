import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { accountingData } from '../data/accountingData'
import { AccountingYear } from '../types'
import { AccountingYearDataHeader } from './AccountingYearDataHeader'
import { AccountingYearDataRow } from './AccountingYearDataRow'
import { AccountingYearDataMarginRow } from './AccountingYearDataMarginRow'
import './AccountingYearDataTable.css'

const NET_WORKING_CAPITAL_ASSUMPTION_DEFAULT = 1.5

type AccountingYearWithDerived = AccountingYear & {
  netWorkingCapitalDerived?: number
  changeInWorkingCapitalDerived?: number
  freeCashFlowPreTaxDerived?: number
}

export function OperationalForecastTab() {
  const { years } = accountingData
  const pick = <K extends keyof AccountingYear>(key: K) => (year: AccountingYear) =>
    year[key] as number | undefined
  const formatNumber = (value: number | undefined) =>
    value === undefined ? '' : value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  const tableRef = useRef<HTMLTableElement | null>(null)
  const [stickyOffset, setStickyOffset] = useState(0)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    accountsReceivables: false,
  })
  const netWorkingCapitalAssumptionDefaults = useMemo(() => {
    const defaults: Record<number, string> = {}
    years.forEach((year) => {
      if (pick('netWorkingCapitalToTurnover')(year) === undefined) {
        defaults[year.year] = NET_WORKING_CAPITAL_ASSUMPTION_DEFAULT.toString()
      }
    })
    return defaults
  }, [years])
  const [netWorkingCapitalAssumptions, setNetWorkingCapitalAssumptions] = useState<Record<number, string>>(
    netWorkingCapitalAssumptionDefaults
  )
  const yearsWithDerivedValues = useMemo<AccountingYearWithDerived[]>(() => {
    const withDerived = years.map((year) => {
      const assumedRatioInput = netWorkingCapitalAssumptions[year.year]
      const ratio =
        assumedRatioInput !== undefined ? parseFloat(assumedRatioInput) : NET_WORKING_CAPITAL_ASSUMPTION_DEFAULT
      const netWorkingCapitalDerived =
        year.netWorkingCapital !== undefined
          ? year.netWorkingCapital
          : Number.isNaN(ratio)
          ? undefined
          : (ratio / 100) * year.turnover

      return {
        ...year,
        netWorkingCapitalDerived,
      }
    })

    return withDerived.map((year, index, arr) => {
      let changeInWorkingCapitalDerived: number | undefined
      if (index === 0) {
        changeInWorkingCapitalDerived = undefined
      } else {
        const previousYear = arr[index - 1]
        if (
          year.netWorkingCapitalDerived === undefined ||
          previousYear.netWorkingCapitalDerived === undefined
        ) {
          changeInWorkingCapitalDerived = undefined
        } else {
          changeInWorkingCapitalDerived = year.netWorkingCapitalDerived - previousYear.netWorkingCapitalDerived
        }
      }

      // FCF = EBIT + Depreciation - ChangeInWC - Capex
      // For first year, treat changeInWC as 0
      const changeInWCForFCF = changeInWorkingCapitalDerived ?? 0
      const freeCashFlowPreTaxDerived =
        (year.ebit || 0) +
        (year.depreciation || 0) -
        changeInWCForFCF -
        (year.netCapitalExpenditure || 0)

      return {
        ...year,
        changeInWorkingCapitalDerived,
        freeCashFlowPreTaxDerived,
      }
    })
  }, [years, netWorkingCapitalAssumptions])
  const toggleRow = useCallback((key: string) => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const handleNetWorkingCapitalAssumptionChange = useCallback((yearNumber: number, value: string) => {
    setNetWorkingCapitalAssumptions((prev) => ({
      ...prev,
      [yearNumber]: value,
    }))
  }, [])

  const renderNetWorkingCapitalRatioRow = () => (
    <tr className="accounting-year-data-data-row">
      <td className="accounting-year-data-label-cell">Net working capital / Turnover (%)</td>
      {yearsWithDerivedValues.map((year) => {
        const ratio = pick('netWorkingCapitalToTurnover')(year)
        if (ratio !== undefined) {
          return (
            <td key={year.year} className="accounting-year-data-value-cell">
              {`${ratio.toFixed(2)}%`}
            </td>
          )
        }

        const assumedValue =
          netWorkingCapitalAssumptions[year.year] ?? NET_WORKING_CAPITAL_ASSUMPTION_DEFAULT.toString()
        return (
          <td key={year.year} className="accounting-year-data-value-cell">
            <label className="nwc-assumption-field">
              <input
                type="number"
                step="0.1"
                min="0"
                value={assumedValue}
                onChange={(event) => handleNetWorkingCapitalAssumptionChange(year.year, event.target.value)}
                className="nwc-assumption-input"
                aria-label={`Assumed net working capital to turnover ratio for ${year.year}`}
              />
              <span className="nwc-assumption-suffix">%</span>
            </label>
          </td>
        )
      })}
    </tr>
  )

  useEffect(() => {
    const measureHeaderHeight = () => {
      const table = tableRef.current
      if (!table) return
      const firstHeaderRow = table.querySelector('thead tr')
      if (!firstHeaderRow) return
      const { height } = firstHeaderRow.getBoundingClientRect()
      setStickyOffset(height)
    }

    measureHeaderHeight()
    window.addEventListener('resize', measureHeaderHeight)
    return () => {
      window.removeEventListener('resize', measureHeaderHeight)
    }
  }, [years.length])

  const renderSectionHeading = (
    label: string,
    getValue?: (year: AccountingYearWithDerived) => number | undefined
  ) => {
    if (getValue) {
      return (
        <tr className="accounting-year-data-section-row">
          <td className="accounting-year-data-section-cell">{label}</td>
          {yearsWithDerivedValues.map((year) => (
            <td key={year.year} className="accounting-year-data-section-value-cell">
              {formatNumber(getValue(year))}
            </td>
          ))}
        </tr>
      )
    }

    return (
      <tr className="accounting-year-data-section-row">
        <td className="accounting-year-data-section-cell" colSpan={yearsWithDerivedValues.length + 1}>
          {label}
        </td>
      </tr>
    )
  }

  const renderSubSectionHeading = (
    label: string,
    getValue?: (year: AccountingYearWithDerived) => number | undefined
  ) => {
    if (getValue) {
      return (
        <tr className="accounting-year-data-subsection-row">
          <td className="accounting-year-data-subsection-cell">{label}</td>
          {yearsWithDerivedValues.map((year) => (
            <td key={year.year} className="accounting-year-data-subsection-value-cell">
              {formatNumber(getValue(year))}
            </td>
          ))}
        </tr>
      )
    }

    return (
      <tr className="accounting-year-data-subsection-row">
        <td className="accounting-year-data-subsection-cell" colSpan={yearsWithDerivedValues.length + 1}>
          {label}
        </td>
      </tr>
    )
  }

  return (
    <div className="accounting-year-data-container">
      <h2 className="accounting-year-data-title">Operational Forecast</h2>
      <table className="accounting-year-data-table" ref={tableRef}>
        <AccountingYearDataHeader years={yearsWithDerivedValues} />
        <tbody>
          {renderSectionHeading('Income Statement')}
          <AccountingYearDataRow
            label="Turnover"
            years={yearsWithDerivedValues}
            getValue={pick('turnover')}
            isSticky={true}
            stickyOffset={stickyOffset}
          />
          <AccountingYearDataRow label="Cost of sales" years={yearsWithDerivedValues} getValue={pick('costOfSales')} />
          <AccountingYearDataRow label="Gross profit" years={yearsWithDerivedValues} getValue={pick('grossProfit')} />
          <AccountingYearDataRow label="Overheads" years={yearsWithDerivedValues} getValue={pick('overheads')} />
          <AccountingYearDataRow label="EBITDA" years={yearsWithDerivedValues} getValue={pick('ebitda')} isBold={true} />
          <AccountingYearDataRow label="EBIT" years={yearsWithDerivedValues} getValue={pick('ebit')} isBold={true} />
          <AccountingYearDataRow label="Interest receivable" years={yearsWithDerivedValues} getValue={pick('interestReceivable')} />
          <AccountingYearDataRow
            label="PBT"
            years={yearsWithDerivedValues}
            getValue={pick('pbt')}
            isBold={true}
            isDoubleUnderline={true}
          />
          <AccountingYearDataMarginRow label="Gross profit margin (%)" years={yearsWithDerivedValues} getMargin={pick('grossProfitMargin')} />
          <AccountingYearDataMarginRow label="EBIT margin (%)" years={yearsWithDerivedValues} getMargin={pick('ebitMargin')} />
          <AccountingYearDataMarginRow label="PBT margin (%)" years={yearsWithDerivedValues} getMargin={pick('pbtMargin')} />

          {renderSectionHeading('Capital Movement')}
          {renderSubSectionHeading('Current assets', pick('currentAssets'))}
          <tr className="accounting-year-data-aggregate-row">
            <td className="accounting-year-data-label-cell accounting-year-data-label-with-toggle">
              <span>Accounts receivables</span>
              <button
                type="button"
                className="accounting-year-data-toggle"
                onClick={() => toggleRow('accountsReceivables')}
                aria-expanded={expandedRows.accountsReceivables}
                aria-label={`${expandedRows.accountsReceivables ? 'Collapse' : 'Expand'} accounts receivables`}
              >
                <span className="accounting-year-data-toggle-icon">
                  {expandedRows.accountsReceivables ? '−' : '+'}
                </span>
              </button>
            </td>
            {yearsWithDerivedValues.map((year) => (
              <td key={year.year} className="accounting-year-data-value-cell">
                {formatNumber(pick('accountsReceivables')(year))}
              </td>
            ))}
          </tr>
          {expandedRows.accountsReceivables && (
            <>
              <AccountingYearDataRow
                label="Amounts receivable on contracts"
                years={yearsWithDerivedValues}
                getValue={pick('amountsReceivableOnContracts')}
                isNested={true}
              />
              <AccountingYearDataRow label="Trade debtors" years={yearsWithDerivedValues} getValue={pick('tradeDebtors')} isNested={true} />
              <AccountingYearDataRow label="Other debtors and prepayments" years={yearsWithDerivedValues} getValue={pick('otherDebtorsAndPrepayments')} isNested={true} />
            </>
          )}
          <AccountingYearDataRow
            label="Cash at bank and in hand (operating cash only)"
            years={yearsWithDerivedValues}
            getValue={pick('cashAtBankAndInHandOperating')}
          />
          {renderSubSectionHeading('Current liabilities', pick('currentLiabilities'))}
          <AccountingYearDataRow label="Account payable" years={yearsWithDerivedValues} getValue={pick('accountsPayable')} />
          <AccountingYearDataRow label="Corporation tax" years={yearsWithDerivedValues} getValue={pick('corporationTax')} />
          <AccountingYearDataRow label="Other taxation and social security" years={yearsWithDerivedValues} getValue={pick('otherTaxationAndSocialSecurity')} />
          <AccountingYearDataRow label="Other creditors and accruals" years={yearsWithDerivedValues} getValue={pick('otherCreditorsAndAccruals')} />
          <AccountingYearDataRow label="Accrued dividends and interest" years={yearsWithDerivedValues} getValue={pick('accruedDividendsAndInterest')} />

          {renderSubSectionHeading('Net working capital', (year) => year.netWorkingCapitalDerived)}
          {renderNetWorkingCapitalRatioRow()}

          {renderSectionHeading('Cash Flow')}
          <AccountingYearDataRow label="EBIT" years={yearsWithDerivedValues} getValue={pick('ebit')} />
          <AccountingYearDataRow label="Depreciation" years={yearsWithDerivedValues} getValue={pick('depreciation')} />
          <tr className="accounting-year-data-aggregate-row">
            <td className="accounting-year-data-label-cell">Change in working capital</td>
            {yearsWithDerivedValues.map((year) => (
              <td key={year.year} className="accounting-year-data-value-cell">
                {formatNumber(year.changeInWorkingCapitalDerived)}
              </td>
            ))}
          </tr>
          <AccountingYearDataRow label="Net capital expenditure" years={yearsWithDerivedValues} getValue={pick('netCapitalExpenditure')} />
          <AccountingYearDataRow
            label="Free cash flow (pre-tax)"
            years={yearsWithDerivedValues}
            getValue={(year) => (year as AccountingYearWithDerived).freeCashFlowPreTaxDerived}
            isBold={true}
            isDoubleUnderline={true}
          />
        </tbody>
      </table>
      <div className="nwc-assumption-legend" aria-live="polite">
        <span className="nwc-assumption-legend-swatch" aria-hidden="true" />
        <span>Blue border indicates editable assumed ratio</span>
      </div>
    </div>
  )
}

