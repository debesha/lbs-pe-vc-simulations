import { useEffect, useMemo, useRef, useState } from 'react'

export interface PieChartDatum {
  label: string
  value: number | undefined | null
  color?: string
}

interface PieChartProps {
  data: PieChartDatum[]
  width?: number
  height?: number
  emptyStateMessage?: string
  minLabelPercentage?: number
}

const DEFAULT_COLORS = ['#4caf50', '#2196f3', '#ff9800', '#8bc34a', '#9c27b0', '#f44336', '#00bcd4', '#673ab7', '#cddc39', '#ff5722']

export function PieChart({
  data,
  width = 300,
  height = 300,
  emptyStateMessage = 'No data available to display.',
  minLabelPercentage = 5,
}: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const sanitizedData = useMemo(
    () =>
      data
        .map((item, index) => ({
          label: item.label,
          value: typeof item.value === 'number' && item.value > 0 ? item.value : 0,
          color: item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        }))
        .filter((item) => item.value > 0),
    [data]
  )

  const total = useMemo(() => sanitizedData.reduce((sum, item) => sum + item.value, 0), [sanitizedData])

  const chartData = useMemo(
    () =>
      sanitizedData.map((item) => ({
        ...item,
        percentage: total > 0 ? (item.value / total) * 100 : 0,
      })),
    [sanitizedData, total]
  )

  const getResponsiveDimensions = () => {
    if (typeof window !== 'undefined') {
      const isSmallMobile = window.innerWidth <= 480
      const isMobile = window.innerWidth <= 768
      if (isSmallMobile) {
        return { width: Math.min(200, width), height: Math.min(200, height) }
      }
      if (isMobile) {
        return { width: Math.min(250, width), height: Math.min(250, height) }
      }
    }
    return { width, height }
  }

  const [dimensions, setDimensions] = useState(() => getResponsiveDimensions())
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false))

  useEffect(() => {
    if (typeof window === 'undefined') {
      setDimensions(getResponsiveDimensions())
      return
    }
    const handleResize = () => {
      setDimensions(getResponsiveDimensions())
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [width, height])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const { width: canvasWidth, height: canvasHeight } = canvas
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const radius = Math.min(centerX, centerY) - 20

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    if (chartData.length === 0) {
      return
    }

    let currentAngle = -Math.PI / 2
    chartData.forEach((item) => {
      const sliceAngle = (item.percentage / 100) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()

      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      if (item.percentage >= minLabelPercentage) {
        const labelAngle = currentAngle + sliceAngle / 2
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)

        ctx.fillStyle = '#fff'
        const fontSize = canvasWidth <= 200 ? 10 : 12
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${item.percentage.toFixed(1)}%`, labelX, labelY)
      }

      currentAngle += sliceAngle
    })
  }, [chartData, dimensions, minLabelPercentage])

  if (chartData.length === 0) {
    return (
      <div style={{ width: '100%', textAlign: 'center', color: '#6b7280', fontSize: '13px', fontStyle: 'italic' }}>
        {emptyStateMessage}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} style={{ maxWidth: '100%', height: 'auto' }} />
      <div style={{ textAlign: 'center', marginTop: '10px', width: '100%' }}>
        {chartData.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
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


