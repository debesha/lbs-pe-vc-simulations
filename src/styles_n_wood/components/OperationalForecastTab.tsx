import { useCallback, useEffect, useRef, useState } from 'react'
import { accountingData } from '../data/accountingData'
import { AccountingYear } from '../types'
import { AccountingYearDataHeader } from './AccountingYearDataHeader'
import { AccountingYearDataRow } from './AccountingYearDataRow'
import { AccountingYearDataMarginRow } from './AccountingYearDataMarginRow'
import './AccountingYearDataTable.css'

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
    workingCapitalChange: false,
  })

  const toggleRow = useCallback((key: string) => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

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

  const renderSectionHeading = (label: string, getValue?: (year: AccountingYear) => number | undefined) => {
    if (getValue) {
      return (
        <tr className="accounting-year-data-section-row">
          <td className="accounting-year-data-section-cell">{label}</td>
          {years.map((year) => (
            <td key={year.year} className="accounting-year-data-section-value-cell">
              {formatNumber(getValue(year))}
            </td>
          ))}
        </tr>
      )
    }

    return (
      <tr className="accounting-year-data-section-row">
        <td className="accounting-year-data-section-cell" colSpan={years.length + 1}>
          {label}
        </td>
      </tr>
    )
  }

  const renderSubSectionHeading = (label: string, getValue?: (year: AccountingYear) => number | undefined) => {
    if (getValue) {
      return (
        <tr className="accounting-year-data-subsection-row">
          <td className="accounting-year-data-subsection-cell">{label}</td>
          {years.map((year) => (
            <td key={year.year} className="accounting-year-data-subsection-value-cell">
              {formatNumber(getValue(year))}
            </td>
          ))}
        </tr>
      )
    }

    return (
      <tr className="accounting-year-data-subsection-row">
        <td className="accounting-year-data-subsection-cell" colSpan={years.length + 1}>
          {label}
        </td>
      </tr>
    )
  }

  return (
    <div className="accounting-year-data-container">
      <h2 className="accounting-year-data-title">Operational Forecast</h2>
      <table className="accounting-year-data-table" ref={tableRef}>
        <AccountingYearDataHeader years={years} />
        <tbody>
          {renderSectionHeading('Income Statement')}
          <AccountingYearDataRow
            label="Turnover"
            years={years}
            getValue={pick('turnover')}
            isSticky={true}
            stickyOffset={stickyOffset}
          />
          <AccountingYearDataRow label="Cost of sales" years={years} getValue={pick('costOfSales')} />
          <AccountingYearDataRow label="Gross profit" years={years} getValue={pick('grossProfit')} />
          <AccountingYearDataRow label="Overheads" years={years} getValue={pick('overheads')} />
          <AccountingYearDataRow label="EBIT" years={years} getValue={pick('ebit')} isBold={true} />
          <AccountingYearDataRow label="Interest receivable" years={years} getValue={pick('interestReceivable')} />
          <AccountingYearDataRow
            label="PBT"
            years={years}
            getValue={pick('pbt')}
            isBold={true}
            isDoubleUnderline={true}
          />
          <AccountingYearDataMarginRow label="Gross profit margin (%)" years={years} getMargin={pick('grossProfitMargin')} />
          <AccountingYearDataMarginRow label="EBIT margin (%)" years={years} getMargin={pick('ebitMargin')} />
          <AccountingYearDataMarginRow label="PBT margin (%)" years={years} getMargin={pick('pbtMargin')} />

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
            {years.map((year) => (
              <td key={year.year} className="accounting-year-data-value-cell">
                {formatNumber(pick('accountsReceivables')(year))}
              </td>
            ))}
          </tr>
          {expandedRows.accountsReceivables && (
            <>
              <AccountingYearDataRow
                label="Amounts receivable on contracts"
                years={years}
                getValue={pick('amountsReceivableOnContracts')}
                isNested={true}
              />
              <AccountingYearDataRow label="Trade debtors" years={years} getValue={pick('tradeDebtors')} isNested={true} />
              <AccountingYearDataRow label="Other debtors and prepayments" years={years} getValue={pick('otherDebtorsAndPrepayments')} isNested={true} />
            </>
          )}
          <AccountingYearDataRow
            label="Cash at bank and in hand (operating cash only)"
            years={years}
            getValue={pick('cashAtBankAndInHandOperating')}
          />
          {renderSubSectionHeading('Current liabilities', pick('currentLiabilities'))}
          <AccountingYearDataRow label="Account payable" years={years} getValue={pick('accountsPayable')} />
          <AccountingYearDataRow label="Corporation tax" years={years} getValue={pick('corporationTax')} />
          <AccountingYearDataRow label="Other taxation and social security" years={years} getValue={pick('otherTaxationAndSocialSecurity')} />
          <AccountingYearDataRow label="Other creditors and accruals" years={years} getValue={pick('otherCreditorsAndAccruals')} />
          <AccountingYearDataRow label="Accrued dividends and interest" years={years} getValue={pick('accruedDividendsAndInterest')} />

          {renderSubSectionHeading('Net working capital', pick('netWorkingCapital'))}
          <AccountingYearDataRow
            label="Net working capital / Turnover (%)"
            years={years}
            getValue={pick('netWorkingCapitalToTurnover')}
            formatValue={(value) => `${value.toFixed(2)}%`}
          />

          {renderSectionHeading('Cash Flow')}
          <AccountingYearDataRow label="EBIT" years={years} getValue={pick('ebit')} />
          <AccountingYearDataRow label="Depreciation" years={years} getValue={pick('depreciation')} />
          <tr className="accounting-year-data-aggregate-row">
            <td className="accounting-year-data-label-cell accounting-year-data-label-with-toggle">
              <span>Change in working capital</span>
              <button
                type="button"
                className="accounting-year-data-toggle"
                onClick={() => toggleRow('workingCapitalChange')}
                aria-expanded={expandedRows.workingCapitalChange}
                aria-label={`${expandedRows.workingCapitalChange ? 'Collapse' : 'Expand'} change in working capital`}
              >
                <span className="accounting-year-data-toggle-icon">
                  {expandedRows.workingCapitalChange ? '−' : '+'}
                </span>
              </button>
            </td>
            {years.map((year) => (
              <td key={year.year} className="accounting-year-data-value-cell">
                {formatNumber(
                  (pick('increaseDecreaseInDebtors')(year) || 0) + (pick('increaseDecreaseInCreditors')(year) || 0)
                )}
              </td>
            ))}
          </tr>
          {expandedRows.workingCapitalChange && (
            <>
              <AccountingYearDataRow label="(Increase)/ decrease in debtors" years={years} getValue={pick('increaseDecreaseInDebtors')} isNested />
              <AccountingYearDataRow label="Increase / (decrease) in creditors" years={years} getValue={pick('increaseDecreaseInCreditors')} isNested />
            </>
          )}
          <AccountingYearDataRow label="Net capital expenditure" years={years} getValue={pick('netCapitalExpenditure')} />
          <AccountingYearDataRow
            label="Free cash flow (pre-tax)"
            years={years}
            getValue={pick('freeCashFlowPreTax')}
            isBold={true}
            isDoubleUnderline={true}
          />
        </tbody>
      </table>
    </div>
  )
}

