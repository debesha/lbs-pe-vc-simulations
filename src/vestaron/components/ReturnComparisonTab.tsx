import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { updateCalculations } from '../store/slices/returnComparisonSlice'
import { calculateReturnComparison } from '../utils/returnCalculations'
import { ReturnComparisonCommonInputs } from './ReturnComparisonCommonInputs'
import { FeeInputsSection } from './FeeInputsSection'
import { SeriesCAnalysisSection } from './SeriesCAnalysisSection'
import { InvestmentEconomicsSection } from './InvestmentEconomicsSection'
import { FinalReturnsSection } from './FinalReturnsSection'
import { ComparisonAnalysisSection } from './ComparisonAnalysisSection'
import './ReturnComparisonTab.css'

export function ReturnComparisonTab() {
  const dispatch = useAppDispatch()
  const inputs = useAppSelector((state) => state.returnComparison.inputs)
  const dilutionInputs = useAppSelector((state) => state.dilution.inputs)

  useEffect(() => {
    const calculated = calculateReturnComparison(dilutionInputs, inputs)
    dispatch(updateCalculations(calculated))
  }, [dilutionInputs, inputs, dispatch])

  return (
    <div className="return-comparison-tab">
      <h2>Question 5: Compare tracking certificate returns vs. typical VC fund returns</h2>

      <ReturnComparisonCommonInputs />
      <FeeInputsSection />
      <SeriesCAnalysisSection />
      <InvestmentEconomicsSection />
      <FinalReturnsSection />
      <ComparisonAnalysisSection />
    </div>
  )
}

