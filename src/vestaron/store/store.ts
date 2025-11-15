import { configureStore } from '@reduxjs/toolkit'
import appReducer from './slices/appSlice'
import dilutionReducer from './slices/dilutionSlice'
import returnComparisonReducer from './slices/returnComparisonSlice'

export const store = configureStore({
  reducer: {
    app: appReducer,
    dilution: dilutionReducer,
    returnComparison: returnComparisonReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

