import { useAppDispatch, useAppSelector } from '../store/hooks'
import { updateInputs } from '../store/slices/returnComparisonSlice'
import './ReturnComparisonTab.css'

export function FeeInputsSection() {
  const dispatch = useAppDispatch()
  const inputs = useAppSelector((state) => state.returnComparison.inputs)

  const handleInputChange = (
    field: keyof typeof inputs,
    value: number | string | 'before' | 'after'
  ) => {
    dispatch(updateInputs({ [field]: value } as any))
  }

  return (
    <div className="comparison-section">
      <div className="column certificate">
        <h2>Tracking Certificate Investor</h2>
        <div className="fee-inputs">
          <h3>Fee Parameters</h3>
          <div className="fee-input-group">
            <div className="input-item">
              <label htmlFor="structuringFee">Structuring Fee (%)</label>
              <input
                type="number"
                id="structuringFee"
                value={inputs.structuringFee}
                step="0.1"
                onChange={(e) => handleInputChange('structuringFee', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="input-item">
              <label htmlFor="performanceFee">Performance Fee (%)</label>
              <input
                type="number"
                id="performanceFee"
                value={inputs.performanceFee}
                step="0.1"
                onChange={(e) => handleInputChange('performanceFee', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="column vc-fund">
        <h2>Typical VC Fund Investor</h2>
        <div className="fee-inputs">
          <h3>Fee Parameters</h3>
          <div className="fee-input-group">
            <div className="input-item">
              <label htmlFor="managementFee">Management Fee (%)</label>
              <input
                type="number"
                id="managementFee"
                value={inputs.managementFee}
                step="0.1"
                onChange={(e) => handleInputChange('managementFee', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="input-item">
              <label htmlFor="carriedInterest">Carried Interest (%)</label>
              <input
                type="number"
                id="carriedInterest"
                value={inputs.carriedInterest}
                step="0.1"
                onChange={(e) => handleInputChange('carriedInterest', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

