import React from 'react'
import './CommonInputs.css'

export interface InputField {
  id: string
  label: string
  value: number
  step?: number
  onChange: (value: number) => void
}

export interface CommonInputsProps {
  title: string
  fields: InputField[]
}

export function CommonInputs({ title, fields }: CommonInputsProps) {
  return (
    <div className="common-inputs">
      <h3>{title}</h3>
      <div className="input-group">
        {fields.map((field) => (
          <div key={field.id} className="input-item">
            <label htmlFor={field.id}>{field.label}</label>
            <input
              type="number"
              id={field.id}
              value={field.value}
              step={field.step ?? 0.1}
              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

