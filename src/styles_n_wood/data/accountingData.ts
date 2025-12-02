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

// Combine common historical years with scenario-specific years
const rawAccountingDataCaseA: { title: string; years: RawAccountingYear[] } = {
  title: 'Profit and Loss',
  years: [...commonHistoricalYears, ...caseASpecificYears],
}

const rawAccountingDataCaseB: { title: string; years: RawAccountingYear[] } = {
  title: 'S&W Financial Results',
  years: [...commonHistoricalYears, ...caseBSpecificYears],
}

// Enrich raw data with all computed fields - this is the single place where all calculations happen
export const accountingDataCaseA = enrichAccountingData(rawAccountingDataCaseA)
export const accountingDataCaseB = enrichAccountingData(rawAccountingDataCaseB)

// Calculate CAGR for each scenario
const caseATurnoverCAGR = calculateTurnoverCAGR(accountingDataCaseA.years)
const caseAEBITCAGR = calculateEBITCAGR(accountingDataCaseA.years)
const caseBTurnoverCAGR = calculateTurnoverCAGR(accountingDataCaseB.years)
const caseBEBITCAGR = calculateEBITCAGR(accountingDataCaseB.years)

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
]

// Default export for backward compatibility
export const accountingData = accountingDataCaseA

