import FundCard from './FundCard'
import { PerformanceResult } from '../types'

type SliderConfig = {
  min: number
  max: number
  step: number
}

type FundColumnsProps = {
  buyout: {
    allocation: number
    results: PerformanceResult
    slider: SliderConfig & { value: number; onChange: (value: number) => void }
    exitYear: number
    onExitYearChange: (value: number) => void
  }
  coInvest: {
    allocation: number
    results: PerformanceResult
    exitYear: number
    active: boolean
  }
  venture: {
    allocation: number
    results: PerformanceResult
    slider: SliderConfig & { value: number; onChange: (value: number) => void }
    exitYear: number
    onExitYearChange: (value: number) => void
  }
}

function FundColumns({ buyout, coInvest, venture }: FundColumnsProps) {
  return (
    <section className="fund-columns">
      <FundCard
        label="European Buyout Fund"
        allocation={buyout.allocation}
        results={buyout.results}
        options={{
          slider: buyout.slider,
          exitYear: buyout.exitYear,
          onExitYearChange: buyout.onExitYearChange,
          highlightClass: 'buyout',
        }}
      />

      <FundCard
        label="Buyout Co-Invest Vehicle"
        allocation={coInvest.allocation}
        results={coInvest.results}
        options={{
          slider: {
            ...buyout.slider,
            value: buyout.slider.value,
            onChange: () => {},
          },
          exitYear: buyout.exitYear,
          onExitYearChange: () => {},
          highlightClass: 'coinvest',
          disabled: !coInvest.active,
          controlsDisabled: true,
          inactiveMessage: coInvest.active ? undefined : 'Co-invest is disabled. All capital sits in the main buyout fund.',
        }}
      />

      <FundCard
        label="European VC Fund"
        allocation={venture.allocation}
        results={venture.results}
        options={{
          slider: venture.slider,
          exitYear: venture.exitYear,
          onExitYearChange: venture.onExitYearChange,
          highlightClass: 'vc',
        }}
      />
    </section>
  )
}

export default FundColumns

