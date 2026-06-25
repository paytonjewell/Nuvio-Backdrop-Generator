import React from 'react'
import { SectionLabel, Card, Field, FieldLabel, RangeRow } from './UI'
import s from './OverlaySettings.module.css'

const PRESETS = [
  { value: 'dark-left', label: '◀ Dark Left' },
  { value: 'dark-right', label: 'Dark Right ▶' },
  { value: 'vignette', label: '⬜ Vignette' },
  { value: 'cinematic', label: '🎬 Cinematic' },
  { value: 'bottom', label: '▼ Bottom Fade' },
  { value: 'none', label: '✕ None' },
]

export default function OverlaySettings({ overlay, onChange }) {
  const set = (patch) => onChange({ ...overlay, ...patch })

  return (
    <div>
      <SectionLabel>Overlay</SectionLabel>
      <Card>
        <Field>
          <div className={s.presetGrid}>
            {PRESETS.map(p => (
              <button
                key={p.value}
                className={`${s.presetBtn} ${overlay.preset === p.value ? s.active : ''}`}
                onClick={() => set({ preset: p.value })}
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
        <Field>
          <FieldLabel>Background Color</FieldLabel>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={overlay.bgColor}
              onChange={e => set({ bgColor: e.target.value })} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Canvas fill behind images</span>
          </div>
        </Field>
      </Card>
    </div>
  )
}
