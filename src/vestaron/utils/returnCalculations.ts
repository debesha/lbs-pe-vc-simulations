import {
  ReturnComparisonInputs,
  SeriesCCalculation,
  CertificateCalculation,
  VCFundCalculation,
  ComparisonMetrics,
} from '../store/slices/returnComparisonSlice'
import { DilutionInputs } from '../store/slices/dilutionSlice'
import { calculateSeriesCOwnership } from './dilutionCalculations'

export function calculateReturnComparison(
  dilutionInputs: DilutionInputs,
  returnInputs: ReturnComparisonInputs
): {
  seriesC: SeriesCCalculation
  certificate: CertificateCalculation
  vcFund: VCFundCalculation
  comparison: ComparisonMetrics
  fundLife: number
} {
  const { preMoney, seriesCAmount } = dilutionInputs
  const postMoney = preMoney + seriesCAmount
  const {
    ipoMultiple,
    initialInvestment,
    structuringFee,
    performanceFee,
    managementFee,
    carriedInterest,
    ipoExitYear,
    poolTiming,
  } = returnInputs

  const fundLife = ipoExitYear - 2022

  // Calculate Series C ownership percentage
  const seriesCOwnershipPct = calculateSeriesCOwnership(dilutionInputs, poolTiming)

  // Calculate exit EV
  const exitEV = postMoney * ipoMultiple

  // ============================================
  // SERIES C INVESTOR CALCULATIONS
  // ============================================
  const seriesCProRataValue = exitEV * seriesCOwnershipPct
  const seriesCLiquidationPreference = seriesCAmount // 1x liquidation preference
  const seriesCExitValue = Math.min(
    Math.max(seriesCProRataValue, seriesCLiquidationPreference),
    exitEV
  )
  const seriesCMultiple = seriesCExitValue / seriesCAmount

  // Format stake display
  const isLiquidationPreferenceApplied = seriesCExitValue > seriesCProRataValue
  const isCappedByExitEV = seriesCExitValue === exitEV && exitEV < seriesCLiquidationPreference
  let stakeDisplay: string
  if (isCappedByExitEV) {
    stakeDisplay = `$${seriesCExitValue.toFixed(1)}M (Capped by Exit EV: ${(seriesCOwnershipPct * 100).toFixed(2)}% would be $${seriesCProRataValue.toFixed(1)}M, preference $${seriesCLiquidationPreference.toFixed(1)}M)`
  } else if (isLiquidationPreferenceApplied) {
    stakeDisplay = `$${seriesCExitValue.toFixed(1)}M (Liquidation Preference: ${(seriesCOwnershipPct * 100).toFixed(2)}% → 1.0x)`
  } else {
    stakeDisplay = `$${seriesCExitValue.toFixed(1)}M (${(seriesCOwnershipPct * 100).toFixed(2)}%)`
  }

  const seriesC: SeriesCCalculation = {
    exitEV,
    stake: seriesCExitValue,
    investment: seriesCAmount,
    multiple: seriesCMultiple,
    stakeDisplay,
  }

  // ============================================
  // TRACKING CERTIFICATE CALCULATIONS
  // ============================================
  const certStructuringFeeAmount = initialInvestment * (structuringFee / 100)
  const certFaceValue = initialInvestment - certStructuringFeeAmount
  const certGrossValue = certFaceValue * seriesCMultiple
  const certProfit = certGrossValue - certFaceValue
  const certPerformanceFeeAmount = certProfit > 0 ? certProfit * (performanceFee / 100) : 0
  const certNetValue = certGrossValue - certPerformanceFeeAmount
  const certNetReturn = ((certNetValue / initialInvestment) - 1) * 100
  const certNetMultiple = certNetValue / initialInvestment

  let certIRR: number
  if (certNetValue <= 0) {
    certIRR = -100
  } else {
    certIRR = (Math.pow(certNetValue / initialInvestment, 1 / fundLife) - 1) * 100
  }

  const certificate: CertificateCalculation = {
    initialInvestment,
    structuringFee: certStructuringFeeAmount,
    faceValue: certFaceValue,
    grossMOIC: certGrossValue / initialInvestment,
    profit: certProfit,
    performanceFee: certPerformanceFeeAmount,
    grossFees: certStructuringFeeAmount + certPerformanceFeeAmount,
    netValue: certNetValue,
    netReturn: certNetReturn,
    netMultiple: certNetMultiple,
    irr: certIRR,
  }

  // ============================================
  // VC FUND CALCULATIONS
  // ============================================
  const vcGrossValue = initialInvestment * seriesCMultiple
  const vcMgmtFeesAmount = initialInvestment * (managementFee / 100) * fundLife
  const vcProfit = vcGrossValue - initialInvestment
  const vcCarryAmount = vcProfit > 0 ? vcProfit * (carriedInterest / 100) : 0
  const vcNetValue = vcGrossValue - vcMgmtFeesAmount - vcCarryAmount
  const vcNetReturn = ((vcNetValue / initialInvestment) - 1) * 100
  const vcNetMultiple = vcNetValue / initialInvestment

  let vcIRR: number
  if (vcNetValue <= 0) {
    vcIRR = -100
  } else {
    vcIRR = (Math.pow(vcNetValue / initialInvestment, 1 / fundLife) - 1) * 100
  }

  const vcFund: VCFundCalculation = {
    initialInvestment,
    grossMOIC: vcGrossValue / initialInvestment,
    profit: vcProfit,
    managementFee: vcMgmtFeesAmount,
    carry: vcCarryAmount,
    grossFees: vcMgmtFeesAmount + vcCarryAmount,
    netValue: vcNetValue,
    netReturn: vcNetReturn,
    netMultiple: vcNetMultiple,
    irr: vcIRR,
  }

  // ============================================
  // COMPARISON METRICS
  // ============================================
  const comparison: ComparisonMetrics = {
    netValueDiff: certNetValue - vcNetValue,
    returnDiff: certNetReturn - vcNetReturn,
    multipleDiff: certNetMultiple - vcNetMultiple,
    irrDiff: certIRR - vcIRR,
    advantage: certNetValue >= vcNetValue ? 'Certificate' : 'VC Fund',
  }

  return {
    seriesC,
    certificate,
    vcFund,
    comparison,
    fundLife,
  }
}

