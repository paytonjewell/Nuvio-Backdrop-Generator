import React from 'react'

export function CollapseButton({ collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.3)', padding: 2,
        display: 'flex', alignItems: 'center', lineHeight: 1,
      }}
      title={collapsed ? 'Expand' : 'Collapse'}
    >
      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
      >
        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export function Collapsible({ open, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.25s ease' }}>
      <div style={{ minHeight: 0, overflow: open ? 'visible' : 'hidden' }}>{children}</div>
    </div>
  )
}
