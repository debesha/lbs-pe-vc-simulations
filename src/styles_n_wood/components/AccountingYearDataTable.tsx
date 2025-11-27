import { AccountingData } from '../types'
import { AccountingYearDataHeader } from './AccountingYearDataHeader'
import { AccountingYearDataRow } from './AccountingYearDataRow'
import { AccountingYearDataMarginRow } from './AccountingYearDataMarginRow'
import './AccountingYearDataTable.css'

interface AccountingYearDataTableProps {
  data: AccountingData
}

export function AccountingYearDataTable({ data }: AccountingYearDataTableProps) {
  const { title, years } = data

  return (
    <div className="accounting-year-data-container">
      <h2 className="accounting-year-data-title">{title}</h2>
      <table className="accounting-year-data-table">
        <AccountingYearDataHeader years={years} />
        <tbody>
          <AccountingYearDataRow
            label="Turnover"
            years={years}
            getValue={(year) => year.turnover}
          />
          <AccountingYearDataRow
            label="Cost of sales"
            years={years}
            getValue={(year) => year.costOfSales}
          />
          <AccountingYearDataRow
            label="Gross profit"
            years={years}
            getValue={(year) => year.grossProfit}
          />
          <AccountingYearDataRow
            label="Overheads"
            years={years}
            getValue={(year) => year.overheads}
          />
          <AccountingYearDataRow
            label="EBIT"
            years={years}
            getValue={(year) => year.ebit}
            isBold={true}
          />
          <AccountingYearDataRow
            label="Interest receivable"
            years={years}
            getValue={(year) => year.interestReceivable}
          />
          <AccountingYearDataRow
            label="PBT"
            years={years}
            getValue={(year) => year.pbt}
            isBold={true}
            isDoubleUnderline={true}
          />
          <AccountingYearDataMarginRow
            label="Gross profit margin (%)"
            years={years}
            getMargin={(year) => year.grossProfitMargin}
          />
          <AccountingYearDataMarginRow
            label="EBIT margin (%)"
            years={years}
            getMargin={(year) => year.ebitMargin}
          />
          <AccountingYearDataMarginRow
            label="PBT margin (%)"
            years={years}
            getMargin={(year) => year.pbtMargin}
          />
        </tbody>
      </table>
    </div>
  )
}

