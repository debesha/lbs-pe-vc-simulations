import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface DilutionInputs {
  preMoney: number
  seriesCAmount: number
  employeePool: number
}

export interface OwnershipStructure {
  existing: number
  seriesC: number
  pool: number
  ev: number
}

export interface DilutionScenarios {
  before: {
    initial: OwnershipStructure
    afterPool: OwnershipStructure
    final: OwnershipStructure
  }
  after: {
    initial: OwnershipStructure
    afterRoundC: OwnershipStructure
    final: OwnershipStructure
  }
}

interface DilutionState {
  inputs: DilutionInputs
  scenarios: DilutionScenarios
}

const initialState: DilutionState = {
  inputs: {
    preMoney: 270,
    seriesCAmount: 90,
    employeePool: 15,
  },
  scenarios: {
    before: {
      initial: { existing: 100, seriesC: 0, pool: 0, ev: 270 },
      afterPool: { existing: 85, seriesC: 0, pool: 15, ev: 270 },
      final: { existing: 63.8, seriesC: 21.2, pool: 15, ev: 360 },
    },
    after: {
      initial: { existing: 100, seriesC: 0, pool: 0, ev: 270 },
      afterRoundC: { existing: 75, seriesC: 25, pool: 0, ev: 360 },
      final: { existing: 60, seriesC: 25, pool: 15, ev: 360 },
    },
  },
}

export const dilutionSlice = createSlice({
  name: 'dilution',
  initialState,
  reducers: {
    updateInputs: (state, action: PayloadAction<Partial<DilutionInputs>>) => {
      state.inputs = { ...state.inputs, ...action.payload }
    },
    updateScenarios: (state, action: PayloadAction<DilutionScenarios>) => {
      state.scenarios = action.payload
    },
  },
})

export const { updateInputs, updateScenarios } = dilutionSlice.actions
export default dilutionSlice.reducer

