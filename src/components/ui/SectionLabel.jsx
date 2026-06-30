import React from 'react'
import s from '../UI.module.css'

export function SectionLabel({ children, action, onClick }) {
  return (
    <div className={s.secLabelRow}>
      <span
        className={s.secLabel}
        onClick={onClick}
        style={onClick ? { cursor: 'pointer', userSelect: 'none' } : undefined}
      >
        {children}
      </span>
      {action}
    </div>
  )
}
