import React from 'react'
import s from '../UI.module.css'

export function StatusBar({ status }) {
  return (
    <div className={`${s.statusBar} ${status.state ? s[status.state] : ''}`}>
      <div className={s.dot} />
      <span>{status.message}</span>
    </div>
  )
}
