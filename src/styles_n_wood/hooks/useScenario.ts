import { useMemo } from 'react'
import { scenarios } from '../data/accountingData'
import { useLBOAssumptions } from '../context/LBOAssumptionsContext'
import type { Scenario } from '../types'

/**
 * Hook to access the currently selected scenario with all its properties including CAGR values
 */
export function useScenario(): Scenario | undefined {
  const { selectedScenarioId } = useLBOAssumptions()

  return useMemo(() => {
    return scenarios.find((s) => s.id === selectedScenarioId) ?? scenarios[0]
  }, [selectedScenarioId])
}


