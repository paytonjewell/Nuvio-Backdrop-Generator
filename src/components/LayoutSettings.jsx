import React from 'react'
import { SectionLabel, Card, Field, FieldLabel, ToggleRow, RangeRow, ResetButton } from './UI'

export default function LayoutSettings({ layout, onChange, onReset }) {
  const set = (patch) => onChange({ ...layout, ...patch })

  return (
    <div>
      <SectionLabel action={<ResetButton onClick={onReset} />}>Layout</SectionLabel>
      <Card>
        <Field>
          <FieldLabel>Row Direction</FieldLabel>
          <ToggleRow
            options={[{ value: 'straight', label: 'Straight' }, { value: 'angled', label: 'Angled' }]}
            value={layout.angle === 0 ? 'straight' : 'angled'}
            onChange={(v) => set({ angle: v === 'angled' ? 12 : 0 })}
          />
        </Field>
        <Field>
          <FieldLabel>Card Gap</FieldLabel>
          <RangeRow min={2} max={40} value={layout.gap} displayValue={`${layout.gap}px`}
            onChange={(v) => set({ gap: v })} />
        </Field>
        <Field>
          <FieldLabel>Card Scale</FieldLabel>
          <RangeRow min={60} max={160} value={layout.scale} displayValue={`${layout.scale}%`}
            onChange={(v) => set({ scale: v })} />
        </Field>
        <Field>
          <FieldLabel>Corner Radius</FieldLabel>
          <RangeRow min={0} max={20} value={layout.radius} displayValue={`${layout.radius}px`}
            onChange={(v) => set({ radius: v })} />
        </Field>
        <Field>
          <FieldLabel>Vertical Stagger</FieldLabel>
          <RangeRow min={0} max={200} value={layout.stagger} displayValue={`${layout.stagger}px`}
            onChange={(v) => set({ stagger: v })} />
        </Field>
        <Field>
          <FieldLabel>Image Opacity</FieldLabel>
          <RangeRow min={10} max={100} value={layout.imageOpacity} displayValue={`${layout.imageOpacity}%`}
            onChange={(v) => set({ imageOpacity: v })} />
        </Field>
        <Field>
          <FieldLabel>X Position</FieldLabel>
          <RangeRow min={-960} max={960} value={layout.offsetX} displayValue={`${layout.offsetX}px`}
            onChange={(v) => set({ offsetX: v })} />
        </Field>
        <Field>
          <FieldLabel>Y Position</FieldLabel>
          <RangeRow min={-540} max={540} value={layout.offsetY} displayValue={`${layout.offsetY}px`}
            onChange={(v) => set({ offsetY: v })} />
        </Field>
      </Card>
    </div>
  )
}
