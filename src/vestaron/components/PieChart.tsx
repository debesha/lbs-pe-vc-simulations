import { useEffect, useRef, useState } from 'react'
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
    // Set initial dimensions
    setDimensions(getResponsiveDimensions())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
        // Update canvas size for responsive behavior
        const dims = getResponsiveDimensions()
        canvas.width = dims.width
        canvas.height = dims.height
      }
    } else {
      canvas = canvasRef.current
      if (canvas) {
        canvas.width = dimensions.width
        canvas.height = dimensions.height
      }
    }
    
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const actualWidth = canvas.width
    const actualHeight = canvas.height
    const centerX = actualWidth / 2
    const centerY = actualHeight / 2
    const radius = Math.min(centerX, centerY) - 20

    // Clear canvas
    ctx.clearRect(0, 0, actualWidth, actualHeight)

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
      const fontSize = actualWidth <= 200 ? 10 : 12
      ctx.font = `bold ${fontSize}px sans-serif`
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
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
        const legendStyle = isMobile 
          ? 'display: block; margin: 3px 0;' 
          : 'display: inline-block; margin: 3px 10px;'
        legend.innerHTML = chartData.map(item => 
          `<div style="${legendStyle}">
            <span style="display: inline-block; width: 16px; height: 16px; background: ${item.color}; border-radius: 3px; vertical-align: middle; margin-right: 6px;"></span>
            <span style="font-size: ${isMobile ? '11px' : '12px'};">${item.label}: ${item.value.toFixed(2)}%</span>
          </div>`
        ).join('')
      }
    }
    }, [data, dimensions, canvasId])

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
      {!canvasId && <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} style={{ maxWidth: '100%', height: 'auto' }} />}
      <div id={canvasId ? `${canvasId}Legend` : undefined} style={{ textAlign: 'center', marginTop: '10px', width: '100%' }}>
        {chartData.map((item, index) => (
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
              {item.label}: {item.value.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

