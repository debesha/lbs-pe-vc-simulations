import { useEffect, useRef, useState } from 'react'
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
  const tableRef = useRef<HTMLTableElement | null>(null)
  const [stickyOffset, setStickyOffset] = useState(0)

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

  const renderSectionHeading = (label: string) => (
    <tr className="accounting-year-data-section-row">
      <td className="accounting-year-data-section-cell" colSpan={years.length + 1}>
        {label}
      </td>
    </tr>
  )

  const renderSubSectionHeading = (label: string) => (
    <tr className="accounting-year-data-subsection-row">
      <td className="accounting-year-data-subsection-cell" colSpan={years.length + 1}>
        {label}
      </td>
    </tr>
  )

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
          {renderSubSectionHeading('Current assets')}
          <AccountingYearDataRow label="Amounts receivable on contracts" years={years} getValue={pick('amountsReceivableOnContracts')} />
          <AccountingYearDataRow label="Trade debtors" years={years} getValue={pick('tradeDebtors')} />
          <AccountingYearDataRow label="Other debtors and prepayments" years={years} getValue={pick('otherDebtorsAndPrepayments')} />
          <AccountingYearDataRow
            label="Cash at bank and in hand (operating cash only)"
            years={years}
            getValue={pick('cashAtBankAndInHandOperating')}
          />
          {renderSubSectionHeading('Current liabilities')}
          <AccountingYearDataRow label="Trade creditors" years={years} getValue={pick('tradeCreditors')} />
          <AccountingYearDataRow label="Other taxation and social security" years={years} getValue={pick('otherTaxationAndSocialSecurity')} />
          <AccountingYearDataRow label="Other creditors and accruals" years={years} getValue={pick('otherCreditorsAndAccruals')} />
          <AccountingYearDataRow label="Accrued dividends and interest" years={years} getValue={pick('accruedDividendsAndInterest')} />

          {renderSectionHeading('Cash Flow')}
          <AccountingYearDataRow label="EBIT" years={years} getValue={pick('ebit')} />
          <AccountingYearDataRow label="Depreciation" years={years} getValue={pick('depreciation')} />
          <AccountingYearDataRow
            label="(Profit) / loss on sale of fixed assets"
            years={years}
            getValue={pick('profitLossOnSaleOfFixedAssets')}
          />
          <AccountingYearDataRow
            label="(Increase)/ decrease in debtors"
            years={years}
            getValue={pick('increaseDecreaseInDebtors')}
          />
          <AccountingYearDataRow
            label="Increase / (decrease) in creditors"
            years={years}
            getValue={pick('increaseDecreaseInCreditors')}
          />
          <AccountingYearDataRow
            label="Cash flow from operations"
            years={years}
            getValue={pick('cashFlowFromOperations')}
            isSingleUnderline={true}
          />
          <AccountingYearDataRow label="Interest received" years={years} getValue={pick('interestReceived')} />
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

