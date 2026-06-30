import React from 'react'
import s from '../UI.module.css'

export function Notice({ children, style }) {
  return <div className={s.notice} style={style}>{children}</div>
}
