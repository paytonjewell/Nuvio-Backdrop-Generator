import React from 'react'
import s from '../UI.module.css'

export function RangeRow({ id, min, max, value, step = 1, onChange, displayValue }) {
  return (
    <div className={s.rangeRow}>
      <input
        type="range" id={id} min={min} max={max} value={value} step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className={s.rangeVal}>{displayValue ?? value}</span>
    </div>
  )
}
