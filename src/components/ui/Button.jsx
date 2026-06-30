import React from 'react'
import s from '../UI.module.css'

export function ResetButton({ onClick }) {
  return (
    <button className={s.resetBtn} onClick={onClick} title="Reset to defaults">↺</button>
  )
}

export function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button className={s.btnPrimary} onClick={onClick} disabled={disabled}>{children}</button>
  )
}

export function SecondaryButton({ children, onClick, disabled, style }) {
  return (
    <button className={s.btnSecondary} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  )
}
