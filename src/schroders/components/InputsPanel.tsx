import { formatMillions } from '../utils/calculations'

type InputsPanelProps = {
  totalCapital: number
  buyoutAllocation: number
  vcAllocation: number
  currentBuyoutCap: number
  vcCap: number
  totalAllocated: number
  unallocatedCapital: number
  includeCoInvest: boolean
  buyoutMainAllocation: number
  coInvestAllocation: number
  onTotalCapitalChange: (value: number) => void
  onBuyoutAllocationChange: (value: number) => void
  onVcAllocationChange: (value: number) => void
  onToggleCoInvest: (nextValue: boolean) => void
  toggleHelperMessage: string
}

function InputsPanel({
  totalCapital,
  buyoutAllocation,
  vcAllocation,
  currentBuyoutCap,
  vcCap,
  totalAllocated,
  unallocatedCapital,
  includeCoInvest,
  buyoutMainAllocation,
  coInvestAllocation,
  onTotalCapitalChange,
  onBuyoutAllocationChange,
  onVcAllocationChange,
  onToggleCoInvest,
  toggleHelperMessage,
}: InputsPanelProps) {
  return (
    <section className="inputs-panel">
      <div className="inputs-grid">
        <div className="input-field">
          <label htmlFor="totalCapital">Total capital allocated to Schroders private funds (€m)</label>
          <input
            id="totalCapital"
            type="number"
            value={totalCapital}
            onChange={(event) => onTotalCapitalChange(Number(event.target.value))}
            min={0}
          />
        </div>
        <div className="input-field">
          <label htmlFor="buyoutAllocation">Buyout allocation (€m)</label>
          <input
            id="buyoutAllocation"
            type="number"
            value={buyoutAllocation}
            onChange={(event) => onBuyoutAllocationChange(Number(event.target.value))}
            min={0}
            max={currentBuyoutCap}
          />
        </div>
        <div className="input-field">
          <label htmlFor="vcAllocation">VC allocation (€m)</label>
          <input
            id="vcAllocation"
            type="number"
            value={vcAllocation}
            onChange={(event) => onVcAllocationChange(Number(event.target.value))}
            min={0}
            max={vcCap}
          />
        </div>
      </div>
      <div className="capital-status">
        <span>Total capital: €{formatMillions(totalCapital)}m</span>
        <span>Allocated: €{formatMillions(totalAllocated)}m</span>
        {unallocatedCapital > 0 && (
          <span className="warning">Unallocated (fund caps): €{formatMillions(unallocatedCapital)}m</span>
        )}
      </div>
      <div className="coinvest-toggle">
        <label className="switch">
          <input
            type="checkbox"
            id="includeCoInvest"
            checked={includeCoInvest}
            onChange={(event) => onToggleCoInvest(event.target.checked)}
          />
          <span className="slider" />
        </label>
        <div>
          <p className="toggle-title">Include co-invest vehicle</p>
          <p className="toggle-helper">
            {includeCoInvest
              ? `Split: €${formatMillions(buyoutMainAllocation)}m buyout / €${formatMillions(coInvestAllocation)}m co-invest`
              : toggleHelperMessage}
          </p>
        </div>
      </div>
    </section>
  )
}

export default InputsPanel


