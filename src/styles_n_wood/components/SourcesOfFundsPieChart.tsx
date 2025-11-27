import { useEffect, useRef, useState } from 'react'

interface SourcesOfFundsData {
  targetCash: number | undefined
  seniorDebt: number
  subordinatedDebt: number
  equityPlug: number | undefined
}

interface PieChartProps {
  data: SourcesOfFundsData
  width?: number
  height?: number
}

export function SourcesOfFundsPieChart({ data, width = 300, height = 300 }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    if (typeof window !== 'undefined') {
      const isSmallMobile = window.innerWidth <= 480
      const isMobile = window.innerWidth <= 768
      if (isSmallMobile) {
        return { width: 200, height: 200 }
      }
      if (isMobile) {
        return { width: 250, height: 250 }
      }
    }
    return { width, height }
  }

  const [dimensions, setDimensions] = useState(getResponsiveDimensions())

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getResponsiveDimensions())
    }
    setDimensions(getResponsiveDimensions())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prepare chart data with colors
  const chartData = [
    { label: 'Target cash acquired', value: data.targetCash ?? 0, color: '#4caf50' },
    { label: 'Senior debt', value: data.seniorDebt, color: '#2196f3' },
    { label: 'Subordinated debt', value: data.subordinatedDebt, color: '#ff9800' },
    { label: 'Equity', value: data.equityPlug ?? 0, color: '#9c27b0' },
  ].filter((item) => item.value > 0) // Only show slices with value > 0

  // Calculate total and percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0)
  const chartDataWithPercentages = chartData.map((item) => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const actualWidth = canvas.width
    const actualHeight = canvas.height
    const centerX = actualWidth / 2
    const centerY = actualHeight / 2
    const radius = Math.min(centerX, centerY) - 20

    // Clear canvas
    ctx.clearRect(0, 0, actualWidth, actualHeight)

    // Draw pie slices
    let currentAngle = -Math.PI / 2 // Start at top
    chartDataWithPercentages.forEach((item) => {
      const sliceAngle = (item.percentage / 100) * 2 * Math.PI

      // Draw slice
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()

      // Draw border
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw percentage label on slice (only if slice is large enough)
      if (item.percentage >= 5) {
        const labelAngle = currentAngle + sliceAngle / 2
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)

        ctx.fillStyle = '#fff'
        const fontSize = actualWidth <= 200 ? 10 : 12
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${item.percentage.toFixed(1)}%`, labelX, labelY)
      }

      currentAngle += sliceAngle
    })
  }, [data, dimensions, chartDataWithPercentages])

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} style={{ maxWidth: '100%', height: 'auto' }} />
      <div style={{ textAlign: 'center', marginTop: '10px', width: '100%' }}>
        {chartDataWithPercentages.map((item, index) => (
          <div
            key={index}
            style={{
              display: isMobile ? 'block' : 'inline-block',
              margin: isMobile ? '3px 0' : '3px 10px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                background: item.color,
                borderRadius: '3px',
                verticalAlign: 'middle',
                marginRight: '6px',
              }}
            />
            <span style={{ fontSize: isMobile ? '11px' : '12px' }}>
              {item.label}: {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

