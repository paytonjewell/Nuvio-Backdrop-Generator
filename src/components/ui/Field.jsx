import React from 'react'
import s from '../UI.module.css'

export function Field({ children, style }) {
  return <div className={s.field} style={style}>{children}</div>
}

export function FieldLabel({ children, action }) {
  return (
    <div className={s.fieldLabelRow}>
      <label className={s.label}>{children}</label>
      {action}
    </div>
  )
}
