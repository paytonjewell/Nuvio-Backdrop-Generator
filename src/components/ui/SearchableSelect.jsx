import React, { useState, useRef, useEffect } from 'react'

export function SearchableSelect({ value, onChange, options, emptyLabel, placeholder = 'Search…' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const allOptions = emptyLabel != null
    ? [{ value: '', label: emptyLabel }, ...options]
    : options

  const filtered = query
    ? allOptions.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : allOptions

  const selectedLabel = allOptions.find(o => o.value === value)?.label ?? emptyLabel ?? ''

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function close() {
    setOpen(false)
    setQuery('')
  }

  function select(val) {
    onChange(val)
    close()
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 6,
          color: value ? '#e8e8f0' : 'rgba(255,255,255,0.5)',
          fontSize: 12,
          padding: '8px 28px 8px 10px',
          outline: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.4)' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          transition: 'border-color 0.15s',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          display: 'block',
        }}
      >
        {selectedLabel}
      </button>

      {open && (
        <div
          onKeyDown={e => e.key === 'Escape' && close()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 6,
            zIndex: 1000,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ padding: '6px 6px 4px' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={placeholder}
              style={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', padding: '2px 4px 4px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '8px 10px', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                No results
              </div>
            ) : (
              filtered.map(o => (
                <div
                  key={o.value}
                  onMouseDown={e => { e.preventDefault(); select(o.value) }}
                  style={{
                    padding: '7px 10px',
                    fontSize: 12,
                    color: o.value === value ? '#e8e8f0' : 'rgba(255,255,255,0.7)',
                    background: o.value === value ? 'rgba(108,99,255,0.2)' : 'transparent',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => {
                    if (o.value !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = o.value === value ? 'rgba(108,99,255,0.2)' : 'transparent'
                  }}
                >
                  {o.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
