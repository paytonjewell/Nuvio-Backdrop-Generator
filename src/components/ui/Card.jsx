import React from 'react'
import s from '../UI.module.css'

export function Card({ children, style, onReset }) {
  return (
    <div className={s.card} style={style}>
      {onReset && (
        <button className={s.cardReset} onClick={onReset} title="Reset to defaults">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
          </svg>
        </button>
      )}
      {children}
    </div>
  )
}
