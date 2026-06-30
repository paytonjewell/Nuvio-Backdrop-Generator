import React from 'react'
import s from '../UI.module.css'

export function TabGroup({ tabs, value, onChange }) {
  return (
    <div className={s.tabGroup}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`${s.tab} ${value === tab.value ? s.active : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
