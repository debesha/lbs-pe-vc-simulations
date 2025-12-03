import { RawAccountingYear, Scenario } from '../types'
import { enrichAccountingData } from '../utils/enrichAccountingData'
import { calculateTurnoverCAGR, calculateEBITCAGR } from '../utils/calculateCAGR'

// Common historical years (1999-2002) - shared across all scenarios
const commonHistoricalYears: RawAccountingYear[] = [
  {
    year: 1999,
    status: 'Audited',
    turnover: 85067,
    costOfSales: -78495,
    overheads: -4293,
    interestReceivable: 130,
    depreciation: 164,
    increaseDecreaseInDebtors: -9972,
    increaseDecreaseInCreditors: 7150,
    interestReceived: 130,
    netCapitalExpenditure: -234,
  },
  {
    year: 2000,
    status: 'Audited',
    turnover: 96266,
    costOfSales: -88778,
    overheads: -4990,
    interestReceivable: 205,
    depreciation: 249,
    increaseDecreaseInDebtors: 3679,
    increaseDecreaseInCreditors: -2888,
    interestReceived: 205,
    netCapitalExpenditure: -359,
  },
  {
    year: 2001,
    status: 'Audited',
    turnover: 115228,
    costOfSales: -106125,
    overheads: -6174,
    interestReceivable: 354,
    depreciation: 363,
    profitLossOnSaleOfFixedAssets: 5,
    increaseDecreaseInDebtors: 518,
    increaseDecreaseInCreditors: 4711,
    interestReceived: 354,
    netCapitalExpenditure: -752,
  },
  {
    year: 2002,
    status: 'Audited',
    turnover: 123006,
    costOfSales: -113105,
    overheads: -6675,
    interestReceivable: 303,
    depreciation: 291,
    profitLossOnSaleOfFixedAssets: -18,
    increaseDecreaseInDebtors: -4154,
    increaseDecreaseInCreditors: 2960,
    interestReceived: 303,
    netCapitalExpenditure: -408,
    amountsReceivableOnContracts: 10244,
    tradeDebtors: 7520,
    otherDebtorsAndPrepayments: 1682,
    cashAtBankAndInHandOperating: 6590,
    tradeCreditors: 21286,
    corporationTax: 334,
    otherTaxationAndSocialSecurity: 352,
    otherCreditorsAndAccruals: 885,
    accruedDividendsAndInterest: 325,
  },
]

// Case A: Scenario-specific years (2003-2006)
const caseASpecificYears: RawAccountingYear[] = [
    {
      year: 2003,
      status: 'Unaudited',
      turnover: 132902,
      costOfSales: -121871,
      overheads: -7222,
      interestReceivable: 239,
      depreciation: 408,
      profitLossOnSaleOfFixedAssets: 4,
      increaseDecreaseInDebtors: -1960,
      increaseDecreaseInCreditors: 4606,
      interestReceived: 239,
      netCapitalExpenditure: -310,
      amountsReceivableOnContracts: 6035,
      tradeDebtors: 14647,
      otherDebtorsAndPrepayments: 581,
      cashAtBankAndInHandOperating: 4286,
      tradeCreditors: 24925,
      corporationTax: 523,
      otherTaxationAndSocialSecurity: 450,
      otherCreditorsAndAccruals: 1754,
      accruedDividendsAndInterest: 246,
    },
    {
      year: 2004,
      status: 'Plan',
      turnover: 145000,
      costOfSales: -132675,
      overheads: -7795,
      interestReceivable: 225,
      depreciation: 433,
      increaseDecreaseInDebtors: 1088,
      increaseDecreaseInCreditors: 56,
      interestReceived: 225,
      netCapitalExpenditure: -633,
      cashAtBankAndInHandOperating: 4286,
    },
    {
      year: 2005,
      status: 'Forecast',
      turnover: 160000,
      costOfSales: -146240,
      overheads: -8410,
      interestReceivable: 250,
      depreciation: 433,
      increaseDecreaseInDebtors: -2240,
      increaseDecreaseInCreditors: 2602,
      interestReceived: 250,
      netCapitalExpenditure: -500,
      cashAtBankAndInHandOperating: 4286,
    },
    {
      year: 2006,
      status: 'Forecast',
      turnover: 172500,
      costOfSales: -157405,
      overheads: -9025,
      interestReceivable: 275,
      depreciation: 433,
      increaseDecreaseInDebtors: -1870,
      increaseDecreaseInCreditors: 2141,
      interestReceived: 275,
      netCapitalExpenditure: -564,
      cashAtBankAndInHandOperating: 4286,
    },
]

// Case B: S&W Financial Results (from Exhibit 4a) - scenario-specific years (2003-2005)
const caseBSpecificYears: RawAccountingYear[] = [
    {
      year: 2003,
      status: 'Audited',
      turnover: 132900,
      costOfSales: -121900,
      overheads: -6800,
      interestReceivable: 0,
      depreciation: 300,
      netCapitalExpenditure: -300,
      // Working capital changes calculated from Net cash inflow relationship
      increaseDecreaseInDebtors: -1300,
      increaseDecreaseInCreditors: 2600,
      // Balance sheet data from Panel 4c
      amountsReceivableOnContracts: 6035,
      tradeDebtors: 14647,
      otherDebtorsAndPrepayments: 581,
      cashAtBankAndInHandOperating: 4286,
      tradeCreditors: 24925,
      corporationTax: 523,
      otherTaxationAndSocialSecurity: 450,
      otherCreditorsAndAccruals: 1754,
      accruedDividendsAndInterest: 246,
    },
    {
      year: 2004,
      status: 'Unaudited',
      turnover: 145200,
      costOfSales: -132700,
      overheads: -7600,
      interestReceivable: 0,
      depreciation: 300,
      netCapitalExpenditure: -500,
      // Working capital changes calculated from Net cash inflow relationship
      increaseDecreaseInDebtors: -1750,
      increaseDecreaseInCreditors: 3500,
    },
    {
      year: 2005,
      status: 'Forecast',
      turnover: 170200,
      costOfSales: -155300,
      overheads: -8500,
      interestReceivable: 0,
      depreciation: 400,
      netCapitalExpenditure: -400,
      // Working capital changes calculated from Net cash inflow relationship
      increaseDecreaseInDebtors: -1050,
      increaseDecreaseInCreditors: 2100,
    },
]

// Case C: Financial Statements (from Exhibit 1b) - scenario-specific years (2004-2008E)
// Data from Summary P&L, Cash Flow, and Balance Sheet statements
const caseCSpecificYears: RawAccountingYear[] = [
    {
      year: 2004,
      status: 'Unaudited',
      turnover: 145200,
      // Operating profit = 4.6, so Cost of Sales + Overheads = 145.2 - 4.6 = 140.6
      // Using direct cost components (5.1) as Cost of Sales, rest to overheads
      costOfSales: -5100,
      overheads: -135500,
      interestReceivable: 0,
      depreciation: 400,
      // Change in Working Capital: 3.2 (from cash flow statement)
      increaseDecreaseInDebtors: 1600,
      increaseDecreaseInCreditors: 1600,
      // Net Capex from cash flow: (0.5)
      netCapitalExpenditure: -500,
    },
    {
      year: 2005,
      status: 'Unaudited',
      turnover: 170700,
      // Operating profit = 6.1, so Cost of Sales + Overheads = 170.7 - 6.1 = 164.6
      costOfSales: -5900,
      overheads: -158700,
      interestReceivable: 0,
      depreciation: 400,
      // Change in Working Capital: 5.9
      increaseDecreaseInDebtors: 2950,
      increaseDecreaseInCreditors: 2950,
      // Net Capex from cash flow: (0.2)
      netCapitalExpenditure: -200,
    },
    {
      year: 2006,
      status: 'Forecast',
      turnover: 263800,
      // Operating profit = 10.8, so Cost of Sales + Overheads = 263.8 - 10.8 = 253.0
      costOfSales: -10900,
      overheads: -242100,
      interestReceivable: 0,
      depreciation: 400,
      // Exceptionals from P&L: 0.3
      profitLossOnSaleOfFixedAssets: 300,
      // Change in Working Capital: (0.1)
      increaseDecreaseInDebtors: -50,
      increaseDecreaseInCreditors: -50,
      // Net Capex from cash flow: (0.3)
      netCapitalExpenditure: -300,
      // From Balance Sheet: Net Working Capital = (13.7)
      netWorkingCapital: -13700,
    },
    {
      year: 2007,
      status: 'Forecast',
      turnover: 298800,
      // Operating profit = 12.5, so Cost of Sales + Overheads = 298.8 - 12.5 = 286.3
      costOfSales: -13200,
      overheads: -273100,
      // Net Interest from P&L: (1.7) - this is interest expense
      interestReceivable: -1700,
      depreciation: 400,
      // Change in Working Capital: 1.8
      increaseDecreaseInDebtors: 900,
      increaseDecreaseInCreditors: 900,
      // Net Capex from cash flow: (0.4)
      netCapitalExpenditure: -400,
      // From Balance Sheet: Net Working Capital = (15.2)
      netWorkingCapital: -15200,
      // Taxation from P&L: (3.3), Tax from cash flow: (3.8)
      corporationTax: 3300,
    },
    {
      year: 2008,
      status: 'Forecast',
      turnover: 338800,
      // Operating profit = 15.0, so Cost of Sales + Overheads = 338.8 - 15.0 = 323.8
      costOfSales: -15800,
      overheads: -308000,
      // Net Interest from P&L: (1.1) - this is interest expense
      interestReceivable: -1100,
      depreciation: 400,
      // Change in Working Capital: 2.0
      increaseDecreaseInDebtors: 1000,
      increaseDecreaseInCreditors: 1000,
      // Net Capex from cash flow: (0.4)
      netCapitalExpenditure: -400,
      // From Balance Sheet: Net Working Capital = (17.0)
      netWorkingCapital: -17000,
      // Taxation from P&L: (4.3), Tax from cash flow: (4.8)
      corporationTax: 4300,
    },
]

// Combine common historical years with scenario-specific years
const rawAccountingDataCaseA: { title: string; years: RawAccountingYear[] } = {
  title: 'Profit and Loss',
  years: [...commonHistoricalYears, ...caseASpecificYears],
}

const rawAccountingDataCaseB: { title: string; years: RawAccountingYear[] } = {
  title: 'S&W Financial Results',
  years: [...commonHistoricalYears, ...caseBSpecificYears],
}

const rawAccountingDataCaseC: { title: string; years: RawAccountingYear[] } = {
  title: 'Financial Statements (Exhibit 1b)',
  years: [...commonHistoricalYears, ...caseCSpecificYears],
}

// Enrich raw data with all computed fields - this is the single place where all calculations happen
export const accountingDataCaseA = enrichAccountingData(rawAccountingDataCaseA)
export const accountingDataCaseB = enrichAccountingData(rawAccountingDataCaseB)
export const accountingDataCaseC = enrichAccountingData(rawAccountingDataCaseC)

// Calculate CAGR for each scenario
const caseATurnoverCAGR = calculateTurnoverCAGR(accountingDataCaseA.years)
const caseAEBITCAGR = calculateEBITCAGR(accountingDataCaseA.years)
const caseBTurnoverCAGR = calculateTurnoverCAGR(accountingDataCaseB.years)
const caseBEBITCAGR = calculateEBITCAGR(accountingDataCaseB.years)
const caseCTurnoverCAGR = calculateTurnoverCAGR(accountingDataCaseC.years)
const caseCEBITCAGR = calculateEBITCAGR(accountingDataCaseC.years)

// Export scenarios array with CAGR values
export const scenarios: Scenario[] = [
  {
    id: 'case-a',
    name: 'Case A',
    data: accountingDataCaseA,
    turnoverCAGR: caseATurnoverCAGR,
    ebitCAGR: caseAEBITCAGR,
  },
  {
    id: 'case-b',
    name: 'Case B',
    data: accountingDataCaseB,
    turnoverCAGR: caseBTurnoverCAGR,
    ebitCAGR: caseBEBITCAGR,
  },
  {
    id: 'case-c',
    name: 'Case C',
    data: accountingDataCaseC,
    turnoverCAGR: caseCTurnoverCAGR,
    ebitCAGR: caseCEBITCAGR,
  },
]

// Default export for backward compatibility
export const accountingData = accountingDataCaseA

