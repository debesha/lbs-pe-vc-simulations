import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ReturnComparisonInputs {
  ipoMultiple: number
  initialInvestment: number
  structuringFee: number
  performanceFee: number
  managementFee: number
  carriedInterest: number
  ipoExitYear: number
  poolTiming: 'before' | 'after'
}

export interface SeriesCCalculation {
  exitEV: number
  stake: number
  investment: number
  multiple: number
  stakeDisplay: string
}

export interface CertificateCalculation {
  initialInvestment: number
  structuringFee: number
  faceValue: number
  grossMOIC: number
  profit: number
  performanceFee: number
  grossFees: number
  netValue: number
  netReturn: number
  netMultiple: number
  irr: number
}

export interface VCFundCalculation {
  initialInvestment: number
  grossMOIC: number
  profit: number
  managementFee: number
  carry: number
  grossFees: number
  netValue: number
  netReturn: number
  netMultiple: number
  irr: number
}

export interface ComparisonMetrics {
  netValueDiff: number
  returnDiff: number
  multipleDiff: number
  irrDiff: number
  advantage: 'Certificate' | 'VC Fund'
}

export interface ReturnComparisonState {
  inputs: ReturnComparisonInputs
  seriesC: SeriesCCalculation
  certificate: CertificateCalculation
  vcFund: VCFundCalculation
  comparison: ComparisonMetrics
  fundLife: number
}

const initialState: ReturnComparisonState = {
  inputs: {
    ipoMultiple: 3,
    initialInvestment: 1000,
    structuringFee: 2,
    performanceFee: 10,
    managementFee: 2,
    carriedInterest: 20,
    ipoExitYear: 2024,
    poolTiming: 'before',
  },
  seriesC: {
    exitEV: 1080,
    stake: 270,
    investment: 90,
    multiple: 3.0,
    stakeDisplay: '$270.0M (21.21%)',
  },
  certificate: {
    initialInvestment: 1000,
    structuringFee: 20,
    faceValue: 980,
    grossMOIC: 2.94,
    profit: 2040,
    performanceFee: 204,
    grossFees: 224,
    netValue: 2856,
    netReturn: 180.0,
    netMultiple: 2.8,
    irr: 65.6,
  },
  vcFund: {
    initialInvestment: 1000,
    grossMOIC: 3.0,
    profit: 2000,
    managementFee: 60,
    carry: 400,
    grossFees: 460,
    netValue: 2540,
    netReturn: 154.0,
    netMultiple: 2.54,
    irr: 59.4,
  },
  comparison: {
    netValueDiff: 316,
    returnDiff: 26.0,
    multipleDiff: 0.26,
    irrDiff: 6.2,
    advantage: 'Certificate',
  },
  fundLife: 2,
}

export const returnComparisonSlice = createSlice({
  name: 'returnComparison',
  initialState,
  reducers: {
    updateInputs: (state, action: PayloadAction<Partial<ReturnComparisonInputs>>) => {
      state.inputs = { ...state.inputs, ...action.payload }
      if (action.payload.ipoExitYear !== undefined) {
        state.fundLife = action.payload.ipoExitYear - 2022
      }
    },
    updateCalculations: (
      state,
      action: PayloadAction<{
        seriesC: SeriesCCalculation
        certificate: CertificateCalculation
        vcFund: VCFundCalculation
        comparison: ComparisonMetrics
        fundLife: number
      }>
    ) => {
      state.seriesC = action.payload.seriesC
      state.certificate = action.payload.certificate
      state.vcFund = action.payload.vcFund
      state.comparison = action.payload.comparison
      state.fundLife = action.payload.fundLife
    },
  },
})

export const { updateInputs, updateCalculations } = returnComparisonSlice.actions
export default returnComparisonSlice.reducer

