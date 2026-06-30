import React from 'react'
import { SectionLabel, Card, Field, FieldLabel, RangeRow, CollapseButton, Collapsible, useCollapsed } from './UI'
import s from './OverlaySettings.module.css'
import { DEFAULT_BG_COLOR } from '../lib/constants'

const PRESETS = [
  { value: 'dark-left',  label: '◀ Dark Left',   ariaLabel: 'Dark Left' },
  { value: 'dark-right', label: 'Dark Right ▶',   ariaLabel: 'Dark Right' },
  { value: 'vignette',   label: '⬜ Vignette',    ariaLabel: 'Vignette' },
  { value: 'cinematic',  label: '🎬 Cinematic',   ariaLabel: 'Cinematic' },
  { value: 'bottom',     label: '▼ Bottom Fade',  ariaLabel: 'Bottom Fade' },
  { value: 'none',       label: '✕ None',         ariaLabel: 'None' },
]

export default function OverlaySettings({ overlay, onChange, onReset }) {
  const set = (patch) => onChange({ ...overlay, ...patch })
  const { collapsed, toggle } = useCollapsed('nuvio_collapsed_overlay')

  return (
    <div>
      <SectionLabel action={<CollapseButton collapsed={collapsed} onClick={toggle} />} onClick={toggle}>Overlay</SectionLabel>
      <Collapsible open={!collapsed}>
      <Card onReset={onReset}>
        <Field>
          <div className={s.presetGrid}>
            {PRESETS.map(p => (
              <button
                key={p.value}
                className={`${s.presetBtn} ${overlay.preset === p.value ? s.active : ''}`}
                onClick={() => set({ preset: p.value })}
                aria-label={p.ariaLabel}
                aria-pressed={overlay.preset === p.value}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Field>
        <Field>
          <FieldLabel>Overlay Opacity</FieldLabel>
          <RangeRow min={0} max={100} value={Math.round(overlay.opacity * 100)}
            displayValue={`${Math.round(overlay.opacity * 100)}%`}
            onChange={(v) => set({ opacity: v / 100 })} />
        </Field>
        {overlay.preset !== 'none' && (
          <Field>
            <FieldLabel>Gradient Coverage</FieldLabel>
            <RangeRow min={10} max={100} value={Math.round(overlay.reach * 100)}
              displayValue={`${Math.round(overlay.reach * 100)}%`}
              onChange={(v) => set({ reach: v / 100 })} />
          </Field>
        )}
        <Field>
          <FieldLabel>Background</FieldLabel>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={overlay.bgColor === 'transparent'}
                onChange={e => set({ bgColor: e.target.checked ? 'transparent' : DEFAULT_BG_COLOR })}
                style={{ accentColor: '#6c63ff', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Transparent</span>
            </label>
            {overlay.bgColor !== 'transparent' && (
              <input type="color" value={overlay.bgColor}
                onChange={e => set({ bgColor: e.target.value })} />
            )}
          </div>
        </Field>
      </Card>
      </Collapsible>
    </div>
  )
}
