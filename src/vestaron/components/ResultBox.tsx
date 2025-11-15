import React from 'react'
import './ResultBox.css'

export interface OwnershipData {
  ev: number
  existing: number
  seriesC: number
  pool: number
}

export interface ResultBoxProps {
  title?: string
  data: OwnershipData
  evDecimals?: number
  ownershipDecimals?: number
  className?: string
  style?: React.CSSProperties
  id?: string
}

export function ResultBox({
  title,
  data,
  evDecimals = 1,
  ownershipDecimals = 1,
  className = '',
  style,
  id,
}: ResultBoxProps) {
  return (
    <div id={id} className={`result-box ${className}`} style={style}>
      {title && <h3>{title}</h3>}
      <table className="calculation-table">
        <tbody>
          <tr>
            <td>EV:</td>
            <td data-field="ev">${data.ev.toFixed(evDecimals)}M</td>
          </tr>
          <tr>
            <td>Existing Shareholders:</td>
            <td data-field="existing">{data.existing.toFixed(ownershipDecimals)}%</td>
          </tr>
          <tr>
            <td>Series C Ownership:</td>
            <td data-field="seriesC">{data.seriesC.toFixed(ownershipDecimals)}%</td>
          </tr>
          <tr>
            <td>Employee Pool Ownership:</td>
            <td data-field="pool">{data.pool.toFixed(ownershipDecimals)}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

