import React from 'react'
import { SectionLabel, Card, Field, FieldLabel, RangeRow, ResetButton } from './UI'
import s from './TextSettings.module.css'
import { TEXT_FONTS } from '../lib/constants'

const POSITIONS = [
  { value: 'top-left',      label: '↖' },
  { value: 'top-center',    label: '↑' },
  { value: 'top-right',     label: '↗' },
  { value: 'center-left',   label: '←' },
  { value: 'center',        label: '·' },
  { value: 'center-right',  label: '→' },
  { value: 'bottom-left',   label: '↙' },
  { value: 'bottom-center', label: '↓' },
  { value: 'bottom-right',  label: '↘' },
]

export default function TextSettings({ text, onChange, onReset }) {
  const set = (patch) => onChange({ ...text, ...patch })

  return (
    <div>
      <SectionLabel action={<ResetButton onClick={onReset} />}>Text</SectionLabel>
      <Card>
        <Field>
          <input
            type="text"
            value={text.content}
            onChange={(e) => set({ content: e.target.value })}
            placeholder="Add a title..."
          />
        </Field>
        <Field>
          <FieldLabel>Font</FieldLabel>
          <select value={text.font} onChange={(e) => set({ font: e.target.value })}>
            {TEXT_FONTS.map((f) => (
              <option key={f.value} value={f.value}>{f.value}</option>
            ))}
          </select>
        </Field>
        <Field>
          <FieldLabel>Size</FieldLabel>
          <RangeRow min={16} max={240} value={text.size} displayValue={`${text.size}px`}
            onChange={(v) => set({ size: v })} />
        </Field>
        <Field>
          <FieldLabel>Position</FieldLabel>
          <div className={s.posGrid}>
            {POSITIONS.map((p) => (
              <button
                key={p.value}
                className={`${s.posBtn} ${text.preset === p.value ? s.active : ''}`}
                onClick={() => set({ preset: p.value, offsetX: 0, offsetY: 0 })}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Field>
        <Field>
          <FieldLabel>X Offset</FieldLabel>
          <RangeRow min={-500} max={500} value={text.offsetX} displayValue={`${text.offsetX}px`}
            onChange={(v) => set({ offsetX: v })} />
        </Field>
        <Field>
          <FieldLabel>Y Offset</FieldLabel>
          <RangeRow min={-400} max={400} value={text.offsetY} displayValue={`${text.offsetY}px`}
            onChange={(v) => set({ offsetY: v })} />
        </Field>
        <Field>
          <FieldLabel>Color</FieldLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="color" value={text.color}
              onChange={(e) => set({ color: e.target.value })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={text.gradient}
                onChange={(e) => set({ gradient: e.target.checked })}
                style={{ accentColor: '#6c63ff', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                Gradient to
              </span>
            </label>
            {text.gradient && (
              <input type="color" value={text.gradientTo}
                onChange={(e) => set({ gradientTo: e.target.value })} />
            )}
          </div>
        </Field>
        <Field>
          <FieldLabel>Shadow</FieldLabel>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: text.shadow ? 8 : 0 }}>
            <input
              type="checkbox"
              checked={text.shadow}
              onChange={(e) => set({ shadow: e.target.checked })}
              style={{ accentColor: '#6c63ff', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
              Enabled
            </span>
          </label>
          {text.shadow && (
            <RangeRow min={0} max={80} value={text.shadowBlur} displayValue={`${text.shadowBlur}px`}
              onChange={(v) => set({ shadowBlur: v })} />
          )}
        </Field>
      </Card>
    </div>
  )
}
