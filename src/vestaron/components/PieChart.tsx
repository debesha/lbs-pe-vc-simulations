import { useEffect, useRef } from 'react'
import { OwnershipData } from './ResultBox'

interface PieChartProps {
  data: OwnershipData
  width?: number
  height?: number
  canvasId?: string
}

export function PieChart({ data, width = 300, height = 300, canvasId }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const idCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Fixed colors and labels for ownership structure
  const chartData = [
    { label: 'Existing Shareholders', value: data.existing, color: '#667eea' },
    { label: 'Series C', value: data.seriesC, color: '#4caf50' },
    { label: 'Employee Pool', value: data.pool, color: '#ff9800' },
  ]

  // If canvasId is provided, get that element
  useEffect(() => {
    if (canvasId) {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement
      idCanvasRef.current = canvas
    } else {
      idCanvasRef.current = null
    }
  }, [canvasId])

  useEffect(() => {
    let canvas: HTMLCanvasElement | null = null
    
    if (canvasId) {
      canvas = document.getElementById(canvasId) as HTMLCanvasElement
      if (canvas) {
        idCanvasRef.current = canvas
      }
    } else {
      canvas = canvasRef.current
    }
    
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 20

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Calculate total and draw pie slices
    let currentAngle = -Math.PI / 2 // Start at top
    chartData.forEach((item) => {
      const sliceAngle = (item.value / 100) * 2 * Math.PI

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

      // Draw label on slice
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${item.value.toFixed(1)}%`, labelX, labelY)

      currentAngle += sliceAngle
    })
    
    // Update legend if canvasId is provided
    if (canvasId) {
      const legendId = `${canvasId}Legend`
      const legend = document.getElementById(legendId)
      if (legend) {
        legend.innerHTML = chartData.map(item => 
          `<div style="display: inline-block; margin: 3px 10px;">
            <span style="display: inline-block; width: 16px; height: 16px; background: ${item.color}; border-radius: 3px; vertical-align: middle; margin-right: 6px;"></span>
            <span style="font-size: 12px;">${item.label}: ${item.value.toFixed(2)}%</span>
          </div>`
        ).join('')
      }
    }
    }, [data, width, height, canvasId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!canvasId && <canvas ref={canvasRef} width={width} height={height} />}
      <div id={canvasId ? `${canvasId}Legend` : undefined} style={{ textAlign: 'center', marginTop: '10px' }}>
        {chartData.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'inline-block',
              margin: '3px 10px',
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
            <span style={{ fontSize: '12px' }}>
              {item.label}: {item.value.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

