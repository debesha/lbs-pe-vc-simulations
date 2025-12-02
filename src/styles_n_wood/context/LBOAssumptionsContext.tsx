import { createContext, ReactNode, useContext, useState } from 'react'
import {
  EXIT_DEFAULT_YEAR,
  EXIT_MULTIPLE_DEFAULT,
  MULTIPLE_DEFAULT,
  SENIOR_DEBT_DEFAULT,
  SENIOR_DEBT_INTEREST_RATE_DEFAULT,
  SUBORDINATED_DEBT_DEFAULT,
  SUBORDINATED_DEBT_INTEREST_RATE_DEFAULT,
  TAX_RATE_DEFAULT,
} from '../constants/lboAssumptions'

interface LBOAssumptionsContextValue {
  seniorDebt: string
  setSeniorDebt: (value: string) => void
  subordinatedDebt: string
  setSubordinatedDebt: (value: string) => void
  seniorDebtInterestRate: string
  setSeniorDebtInterestRate: (value: string) => void
  subordinatedDebtInterestRate: string
  setSubordinatedDebtInterestRate: (value: string) => void
  taxRate: string
  setTaxRate: (value: string) => void
  entryMultiple: string
  setEntryMultiple: (value: string) => void
  exitMultiple: string
  setExitMultiple: (value: string) => void
  selectedExitYear: string
  setSelectedExitYear: (value: string) => void
  selectedScenarioId: string
  setSelectedScenarioId: (value: string) => void
}

const LBOAssumptionsContext = createContext<LBOAssumptionsContextValue | undefined>(undefined)

interface LBOAssumptionsProviderProps {
  children: ReactNode
}

export function LBOAssumptionsProvider({ children }: LBOAssumptionsProviderProps) {
  const [seniorDebt, setSeniorDebt] = useState<string>(SENIOR_DEBT_DEFAULT.toString())
  const [subordinatedDebt, setSubordinatedDebt] = useState<string>(SUBORDINATED_DEBT_DEFAULT.toString())
  const [seniorDebtInterestRate, setSeniorDebtInterestRate] = useState<string>(
    SENIOR_DEBT_INTEREST_RATE_DEFAULT.toString()
  )
  const [subordinatedDebtInterestRate, setSubordinatedDebtInterestRate] = useState<string>(
    SUBORDINATED_DEBT_INTEREST_RATE_DEFAULT.toString()
  )
  const [taxRate, setTaxRate] = useState<string>(TAX_RATE_DEFAULT.toString())
  const [entryMultiple, setEntryMultiple] = useState<string>(MULTIPLE_DEFAULT.toString())
  const [exitMultiple, setExitMultiple] = useState<string>(EXIT_MULTIPLE_DEFAULT.toString())
  const [selectedExitYear, setSelectedExitYear] = useState<string>(EXIT_DEFAULT_YEAR.toString())
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('case-a')

  return (
    <LBOAssumptionsContext.Provider
      value={{
        seniorDebt,
        setSeniorDebt,
        subordinatedDebt,
        setSubordinatedDebt,
        seniorDebtInterestRate,
        setSeniorDebtInterestRate,
        subordinatedDebtInterestRate,
        setSubordinatedDebtInterestRate,
        taxRate,
        setTaxRate,
        entryMultiple,
        setEntryMultiple,
        exitMultiple,
        setExitMultiple,
        selectedExitYear,
        setSelectedExitYear,
        selectedScenarioId,
        setSelectedScenarioId,
      }}
    >
      {children}
    </LBOAssumptionsContext.Provider>
  )
}

export function useLBOAssumptions() {
  const context = useContext(LBOAssumptionsContext)
  if (!context) {
    throw new Error('useLBOAssumptions must be used within an LBOAssumptionsProvider')
  }
  return context
}


