import { CashFlowData } from '../types'
import { IncomeStatementTableHeader } from './IncomeStatementTableHeader'
import { IncomeStatementTableRow } from './IncomeStatementTableRow'
import './IncomeStatementTable.css'

interface CashFlowTableProps {
  data: CashFlowData
}

export function CashFlowTable({ data }: CashFlowTableProps) {
  const { title, years } = data

  return (
    <div className="income-statement-container">
      <h2 className="income-statement-title">{title}</h2>
      <table className="income-statement-table">
        <IncomeStatementTableHeader years={years} />
        <tbody>
          <IncomeStatementTableRow
            label="EBIT"
            years={years}
            getValue={(year) => year.ebit}
          />
          <IncomeStatementTableRow
            label="Depreciation"
            years={years}
            getValue={(year) => year.depreciation}
          />
          <IncomeStatementTableRow
            label="(Profit) / loss on sale of fixed assets"
            years={years}
            getValue={(year) => year.profitLossOnSaleOfFixedAssets}
          />
          <IncomeStatementTableRow
            label="(Increase)/ decrease in debtors"
            years={years}
            getValue={(year) => year.increaseDecreaseInDebtors}
          />
          <IncomeStatementTableRow
            label="Increase / (decrease) in creditors"
            years={years}
            getValue={(year) => year.increaseDecreaseInCreditors}
          />
          <IncomeStatementTableRow
            label="Cash flow from operations"
            years={years}
            getValue={(year) => year.cashFlowFromOperations}
            isSingleUnderline={true}
          />
          <IncomeStatementTableRow
            label="Interest received"
            years={years}
            getValue={(year) => year.interestReceived}
          />
          <IncomeStatementTableRow
            label="Net capital expenditure"
            years={years}
            getValue={(year) => year.netCapitalExpenditure}
          />
          <IncomeStatementTableRow
            label="Free cash flow (pre-tax)"
            years={years}
            getValue={(year) => year.freeCashFlowPreTax}
            isBold={true}
            isDoubleUnderline={true}
          />
        </tbody>
      </table>
    </div>
  )
}

