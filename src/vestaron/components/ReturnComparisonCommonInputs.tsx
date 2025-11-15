import { useAppDispatch, useAppSelector } from '../store/hooks'
import { updateInputs } from '../store/slices/returnComparisonSlice'
import './ReturnComparisonTab.css'

export function ReturnComparisonCommonInputs() {
  const dispatch = useAppDispatch()
  const inputs = useAppSelector((state) => state.returnComparison.inputs)
  const dilutionInputs = useAppSelector((state) => state.dilution.inputs)

  const postMoney = dilutionInputs.preMoney + dilutionInputs.seriesCAmount

  const handleInputChange = (
    field: keyof typeof inputs,
    value: number | string | 'before' | 'after'
  ) => {
    dispatch(updateInputs({ [field]: value } as any))
  }

  return (
    <div className="common-inputs">
      <h3>Common Parameters</h3>
      <div className="input-group">
        <div className="input-item">
          <label htmlFor="postMoney">Post-Money Valuation (Round C) ($M)</label>
          <input
            type="number"
            id="postMoney"
            value={postMoney.toFixed(1)}
            step="0.1"
            readOnly
            style={{ background: '#e9ecef', cursor: 'not-allowed' }}
            title="Calculated from Dilution tab: Pre-Money + Series C Amount"
          />
        </div>
        <div className="input-item">
          <label htmlFor="ipoMultiple">IPO Exit Multiple</label>
          <input
            type="number"
            id="ipoMultiple"
            value={inputs.ipoMultiple}
            step="0.1"
            onChange={(e) => handleInputChange('ipoMultiple', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="input-item">
          <label htmlFor="ipoExitYear">IPO Exit Year</label>
          <select
            id="ipoExitYear"
            value={inputs.ipoExitYear}
            onChange={(e) => handleInputChange('ipoExitYear', parseInt(e.target.value))}
            style={{
              padding: '8px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '13px',
              background: 'white',
            }}
          >
            {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="input-item">
          <label htmlFor="initialInvestment">Initial Investment ($)</label>
          <input
            type="number"
            id="initialInvestment"
            value={inputs.initialInvestment}
            step="100"
            onChange={(e) => handleInputChange('initialInvestment', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="radio-group">
        <div className="radio-option">
          <input
            type="radio"
            id="returnPoolBefore"
            name="returnPoolTiming"
            value="before"
            checked={inputs.poolTiming === 'before'}
            onChange={() => handleInputChange('poolTiming', 'before')}
          />
          <label htmlFor="returnPoolBefore">Pool Established BEFORE Round C</label>
        </div>
        <div className="radio-option">
          <input
            type="radio"
            id="returnPoolAfter"
            name="returnPoolTiming"
            value="after"
            checked={inputs.poolTiming === 'after'}
            onChange={() => handleInputChange('poolTiming', 'after')}
          />
          <label htmlFor="returnPoolAfter">Pool Established AFTER Round C</label>
        </div>
      </div>
    </div>
  )
}

