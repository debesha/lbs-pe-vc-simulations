import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { updateInputs, updateScenarios } from '../store/slices/dilutionSlice'
import { calculateDilutionScenarios } from '../utils/dilutionCalculations'
import { PieChart } from './PieChart'
import { ResultBox } from './ResultBox'
import { CommonInputs } from './CommonInputs'
import './DilutionTab.css'

export function DilutionTab() {
  const dispatch = useAppDispatch()
  const inputs = useAppSelector((state) => state.dilution.inputs)
  const scenarios = useAppSelector((state) => state.dilution.scenarios)

  useEffect(() => {
    const calculated = calculateDilutionScenarios(inputs)
    dispatch(updateScenarios(calculated))
  }, [inputs, dispatch])

  const handleInputChange = (field: 'preMoney' | 'seriesCAmount' | 'employeePool', value: number) => {
    dispatch(updateInputs({ [field]: value }))
  }

  return (
    <div className="dilution-tab">
      <h2>Question 3: Compute the dilution impact of the employee equity pool on Round C investors</h2>

      <CommonInputs
        title="Input Parameters"
        fields={[
          {
            id: 'dilutionPreMoney',
            label: 'Pre-Money Valuation (Round C) ($M)',
            value: inputs.preMoney,
            onChange: (value) => handleInputChange('preMoney', value),
          },
          {
            id: 'seriesCAmount',
            label: 'Series C Amount Raised ($M)',
            value: inputs.seriesCAmount,
            onChange: (value) => handleInputChange('seriesCAmount', value),
          },
          {
            id: 'employeePool',
            label: 'Employee Equity Pool (%)',
            value: inputs.employeePool,
            onChange: (value) => handleInputChange('employeePool', value),
          },
        ]}
      />

      <div className="comparison-section">
        {/* Scenario 1: Pool BEFORE Round C */}
        <div className="column certificate">
          <h2>Scenario 1: Pool Established BEFORE Round C</h2>

          <ResultBox
            title="Stage 1: Initial Ownership Structure"
            data={scenarios.before.initial}
            ownershipDecimals={1}
            id="beforeInitial"
          />

          <ResultBox
            title="Stage 2: After Establishing Equity Pool"
            data={scenarios.before.afterPool}
            ownershipDecimals={1}
            id="beforeAfterPool"
          />

          <ResultBox
            title="Stage 3: After Round C"
            data={scenarios.before.final}
            ownershipDecimals={2}
            id="beforeFinal"
          />
        </div>

        {/* Scenario 2: Pool AFTER Round C */}
        <div className="column vc-fund">
          <h2>Scenario 2: Pool Established AFTER Round C</h2>

          <ResultBox
            title="Stage 1: Initial Ownership Structure"
            data={scenarios.after.initial}
            ownershipDecimals={1}
            id="afterInitial"
          />

          <ResultBox
            title="Stage 2: After Round C"
            data={scenarios.after.afterRoundC}
            ownershipDecimals={1}
            id="afterAfterRoundC"
          />

          <ResultBox
            title="Stage 3: After Establishing Equity Pool"
            data={scenarios.after.final}
            ownershipDecimals={2}
            id="afterFinal"
          />
        </div>
      </div>

      <div className="comparison-section" style={{ marginTop: '18px' }}>
        <div className="column certificate">
          <h2>Scenario 1: Final Ownership Structure</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px' }}>
            <canvas id="pieChart1" width="300" height="300"></canvas>
          </div>
          <PieChart canvasId="pieChart1" data={scenarios.before.final} />
        </div>

        <div className="column vc-fund">
          <h2>Scenario 2: Final Ownership Structure</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px' }}>
            <canvas id="pieChart2" width="300" height="300"></canvas>
          </div>
          <PieChart canvasId="pieChart2" data={scenarios.after.final} />
        </div>
      </div>
    </div>
  )
}

