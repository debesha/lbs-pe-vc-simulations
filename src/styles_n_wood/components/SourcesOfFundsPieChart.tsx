import { PieChart, type PieChartDatum } from './PieChart'

export interface SourcesOfFundsData {
  targetCash?: number
  seniorDebt: number
  subordinatedDebt: number
  managementRollover: number
  sponsorEquity: number
}

interface SourcesOfFundsPieChartProps {
  data: SourcesOfFundsData
  width?: number
  height?: number
  sponsorLabel?: string
}

export function SourcesOfFundsPieChart({ data, width = 300, height = 300, sponsorLabel }: SourcesOfFundsPieChartProps) {
  const resolvedSponsorLabel = sponsorLabel ?? 'Sponsor equity'

  const chartData: PieChartDatum[] = [
    { label: 'Target cash acquired', value: data.targetCash ?? 0, color: '#4caf50' },
    { label: 'Senior debt', value: data.seniorDebt, color: '#2196f3' },
    { label: 'Subordinated debt', value: data.subordinatedDebt, color: '#ff9800' },
    { label: 'Management rollover', value: data.managementRollover, color: '#8bc34a' },
    { label: resolvedSponsorLabel, value: data.sponsorEquity, color: '#9c27b0' },
  ]

  return (
    <PieChart
      data={chartData}
      width={width}
      height={height}
      emptyStateMessage="Add at least one funding source to display the distribution."
    />
  )
}


