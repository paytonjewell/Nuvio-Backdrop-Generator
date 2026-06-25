import React from 'react'
import s from './UI.module.css'

export function SectionLabel({ children }) {
  return <div className={s.secLabel}>{children}</div>
}

export function Card({ children, style }) {
  return <div className={s.card} style={style}>{children}</div>
}

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

export function RangeRow({ id, min, max, value, step = 1, onChange, displayValue }) {
  return (
    <div className={s.rangeRow}>
      <input type="range" id={id} min={min} max={max} value={value} step={step}
        onChange={e => onChange(Number(e.target.value))} />
      <span className={s.rangeVal}>{displayValue ?? value}</span>
    </div>
  )
}

export function ToggleRow({ options, value, onChange }) {
  return (
    <div className={s.toggleRow}>
      {options.map(opt => (
        <button
          key={opt.value}
          className={`${s.toggleOpt} ${value === opt.value ? s.active : ''}`}
          onClick={() => onChange(opt.value)}
        >{opt.label}</button>
      ))}
    </div>
  )
}

export function TabGroup({ tabs, value, onChange }) {
  return (
    <div className={s.tabGroup}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          className={`${s.tab} ${value === tab.value ? s.active : ''}`}
          onClick={() => onChange(tab.value)}
        >{tab.label}</button>
      ))}
    </div>
  )
}

export function Notice({ children, style }) {
  return <div className={s.notice} style={style}>{children}</div>
}

export function StatusBar({ status }) {
  return (
    <div className={`${s.statusBar} ${status.state ? s[status.state] : ''}`}>
      <div className={s.dot} />
      <span>{status.message}</span>
    </div>
  )
}

export function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button className={s.btnPrimary} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, disabled, style }) {
  return (
    <button className={s.btnSecondary} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  )
}
