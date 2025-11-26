import { IncomeStatementData } from '../types'
import { IncomeStatementTableHeader } from './IncomeStatementTableHeader'
import { IncomeStatementTableRow } from './IncomeStatementTableRow'
import { IncomeStatementMarginRow } from './IncomeStatementMarginRow'
import './IncomeStatementTable.css'

interface IncomeStatementTableProps {
  data: IncomeStatementData
}

export function IncomeStatementTable({ data }: IncomeStatementTableProps) {
  const { title, years } = data

  return (
    <div className="income-statement-container">
      <h2 className="income-statement-title">{title}</h2>
      <table className="income-statement-table">
        <IncomeStatementTableHeader years={years} />
        <tbody>
          <IncomeStatementTableRow
            label="Turnover"
            years={years}
            getValue={(year) => year.turnover}
          />
          <IncomeStatementTableRow
            label="Cost of sales"
            years={years}
            getValue={(year) => year.costOfSales}
          />
          <IncomeStatementTableRow
            label="Gross profit"
            years={years}
            getValue={(year) => year.grossProfit}
          />
          <IncomeStatementTableRow
            label="Overheads"
            years={years}
            getValue={(year) => year.overheads}
          />
          <IncomeStatementTableRow
            label="EBIT"
            years={years}
            getValue={(year) => year.ebit}
            isBold={true}
          />
          <IncomeStatementTableRow
            label="Interest receivable"
            years={years}
            getValue={(year) => year.interestReceivable}
          />
          <IncomeStatementTableRow
            label="PBT"
            years={years}
            getValue={(year) => year.pbt}
            isBold={true}
            isDoubleUnderline={true}
          />
          <IncomeStatementMarginRow
            label="Gross profit margin (%)"
            years={years}
            getMargin={(year) => year.grossProfitMargin}
          />
          <IncomeStatementMarginRow
            label="EBIT margin (%)"
            years={years}
            getMargin={(year) => year.ebitMargin}
          />
          <IncomeStatementMarginRow
            label="PBT margin (%)"
            years={years}
            getMargin={(year) => year.pbtMargin}
          />
        </tbody>
      </table>
    </div>
  )
}

