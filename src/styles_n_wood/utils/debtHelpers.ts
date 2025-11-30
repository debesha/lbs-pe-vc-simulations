export const DEBT_POPULATION_YEAR = 2004
export const DEAL_CLOSE_MONTH = 5
const MONTHS_IN_YEAR = 12
export const PARTIAL_INTEREST_MONTHS = MONTHS_IN_YEAR - DEAL_CLOSE_MONTH

export const getInterestAccrualFactor = (year: number) => {
  if (year < DEBT_POPULATION_YEAR) {
    return 0
  }

  if (year === DEBT_POPULATION_YEAR) {
    return PARTIAL_INTEREST_MONTHS / MONTHS_IN_YEAR
  }

  return 1
}


