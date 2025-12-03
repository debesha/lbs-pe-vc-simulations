import { AccountingYear } from '../types'

/**
 * Calculates Compound Annual Growth Rate (CAGR) between the first and last year
 * Formula: CAGR = ((Ending Value / Beginning Value) ^ (1 / Number of Years)) - 1
 *
 * @param years - Array of accounting years sorted by year
 * @param getValue - Function to extract the value to calculate CAGR for (e.g., turnover or EBIT)
 * @returns CAGR as a percentage (e.g., 0.15 for 15%), or undefined if calculation is not possible
 */
export function calculateCAGR(
  years: AccountingYear[],
  getValue: (year: AccountingYear) => number | undefined
): number | undefined {
  if (years.length < 2) {
    return undefined
  }

  // Sort years to ensure we have first and last
  const sortedYears = [...years].sort((a, b) => a.year - b.year)
  const firstYear = sortedYears[0]
  const lastYear = sortedYears[sortedYears.length - 1]

  const beginningValue = getValue(firstYear)
  const endingValue = getValue(lastYear)

  // Both values must be defined and positive for CAGR calculation
  if (beginningValue === undefined || endingValue === undefined) {
    return undefined
  }

  if (beginningValue <= 0 || endingValue <= 0) {
    return undefined
  }

  const numberOfYears = lastYear.year - firstYear.year
  if (numberOfYears <= 0) {
    return undefined
  }

  // CAGR = ((Ending Value / Beginning Value) ^ (1 / Number of Years)) - 1
  const ratio = endingValue / beginningValue
  const cagr = Math.pow(ratio, 1 / numberOfYears) - 1

  return cagr
}

/**
 * Calculates CAGR for turnover across all years in the dataset
 */
export function calculateTurnoverCAGR(years: AccountingYear[]): number | undefined {
  return calculateCAGR(years, (year) => year.turnover)
}

/**
 * Calculates CAGR for EBIT across all years in the dataset
 */
export function calculateEBITCAGR(years: AccountingYear[]): number | undefined {
  return calculateCAGR(years, (year) => year.ebit)
}


