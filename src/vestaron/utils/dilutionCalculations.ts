import { DilutionInputs, DilutionScenarios, OwnershipStructure } from '../store/slices/dilutionSlice'

export function calculateDilutionScenarios(
  inputs: DilutionInputs
): DilutionScenarios {
  const { preMoney, seriesCAmount, employeePool } = inputs
  const employeePoolDecimal = employeePool / 100
  const postMoney = preMoney + seriesCAmount

  // ============================================
  // SCENARIO 1: Pool Established BEFORE Round C
  // ============================================

  // Stage 1: Initial (before pool, before Round C)
  const beforeInitial: OwnershipStructure = {
    existing: 100.0,
    seriesC: 0.0,
    pool: 0.0,
    ev: preMoney,
  }

  // Stage 2: After Establishing Equity Pool (before Round C)
  const beforeAfterPool: OwnershipStructure = {
    existing: (1 - employeePoolDecimal) * 100,
    seriesC: 0.0,
    pool: employeePoolDecimal * 100,
    ev: preMoney,
  }

  // Stage 3: After Round C
  const sharesBeforeSeriesC = 100
  const poolSharesBefore = (sharesBeforeSeriesC * employeePoolDecimal) / (1 - employeePoolDecimal)
  const totalSharesPreSeriesC = sharesBeforeSeriesC + poolSharesBefore
  const seriesCPricePerShare = preMoney / totalSharesPreSeriesC
  const seriesCSharesBefore = seriesCAmount / seriesCPricePerShare
  const totalSharesPostSeriesC = totalSharesPreSeriesC + seriesCSharesBefore

  const beforeFinal: OwnershipStructure = {
    existing: (sharesBeforeSeriesC / totalSharesPostSeriesC) * 100,
    seriesC: (seriesCSharesBefore / totalSharesPostSeriesC) * 100,
    pool: (poolSharesBefore / totalSharesPostSeriesC) * 100,
    ev: postMoney,
  }

  // ============================================
  // SCENARIO 2: Pool Established AFTER Round C
  // ============================================

  // Stage 1: Initial (before Round C, before pool)
  const afterInitial: OwnershipStructure = {
    existing: 100.0,
    seriesC: 0.0,
    pool: 0.0,
    ev: preMoney,
  }

  // Stage 2: After Round C (before pool)
  const afterAfterRoundC: OwnershipStructure = {
    existing: 100 - (seriesCAmount / postMoney) * 100,
    seriesC: (seriesCAmount / postMoney) * 100,
    pool: 0.0,
    ev: postMoney,
  }

  // Stage 3: After Establishing Equity Pool
  const sharesBeforePool = 100
  const seriesCSharePct = seriesCAmount / postMoney
  const seriesCShares = sharesBeforePool * seriesCSharePct
  const totalSharesBeforePool = sharesBeforePool + seriesCShares
  const poolShares = (totalSharesBeforePool * employeePoolDecimal) / (1 - employeePoolDecimal)
  const totalSharesAfterPool = totalSharesBeforePool + poolShares

  const afterFinal: OwnershipStructure = {
    existing: (sharesBeforePool / totalSharesAfterPool) * 100,
    seriesC: (seriesCShares / totalSharesAfterPool) * 100,
    pool: (poolShares / totalSharesAfterPool) * 100,
    ev: postMoney,
  }

  return {
    before: {
      initial: beforeInitial,
      afterPool: beforeAfterPool,
      final: beforeFinal,
    },
    after: {
      initial: afterInitial,
      afterRoundC: afterAfterRoundC,
      final: afterFinal,
    },
  }
}

export function calculateSeriesCOwnership(
  inputs: DilutionInputs,
  poolTiming: 'before' | 'after'
): number {
  const { preMoney, seriesCAmount, employeePool } = inputs
  const employeePoolDecimal = employeePool / 100
  const postMoney = preMoney + seriesCAmount

  if (poolTiming === 'before') {
    // Pool established BEFORE Round C
    const sharesBeforeSeriesC = 100
    const poolSharesBefore = (sharesBeforeSeriesC * employeePoolDecimal) / (1 - employeePoolDecimal)
    const totalSharesPreSeriesC = sharesBeforeSeriesC + poolSharesBefore
    const seriesCPricePerShare = preMoney / totalSharesPreSeriesC
    const seriesCSharesBefore = seriesCAmount / seriesCPricePerShare
    const totalSharesPostSeriesC = totalSharesPreSeriesC + seriesCSharesBefore
    return seriesCSharesBefore / totalSharesPostSeriesC
  } else {
    // Pool established AFTER Round C
    const sharesBeforePool = 100
    const seriesCSharePct = seriesCAmount / postMoney
    const seriesCShares = sharesBeforePool * seriesCSharePct
    const totalSharesBeforePool = sharesBeforePool + seriesCShares
    const poolShares = (totalSharesBeforePool * employeePoolDecimal) / (1 - employeePoolDecimal)
    const totalSharesAfterPool = totalSharesBeforePool + poolShares
    return seriesCShares / totalSharesAfterPool
  }
}

