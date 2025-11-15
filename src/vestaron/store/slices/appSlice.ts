import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Tab = 'dilution' | 'return'

interface AppState {
  activeTab: Tab
}

const initialState: AppState = {
  activeTab: 'dilution',
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<Tab>) => {
      state.activeTab = action.payload
    },
  },
})

export const { setActiveTab } = appSlice.actions
export default appSlice.reducer

