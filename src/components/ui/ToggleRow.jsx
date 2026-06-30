import React from 'react'
import s from '../UI.module.css'

export function ToggleRow({ options, value, onChange }) {
  return (
    <div className={s.toggleRow}>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`${s.toggleOpt} ${value === opt.value ? s.active : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
