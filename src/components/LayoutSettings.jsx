import React from 'react'
import { SectionLabel, Card, Field, FieldLabel, ToggleRow, RangeRow, CollapseButton, Collapsible, useCollapsed } from './UI'

export default function LayoutSettings({ layout, onChange, imageType, onImageTypeChange, onReset }) {
  const set = (patch) => onChange({ ...layout, ...patch })
  const { collapsed, toggle } = useCollapsed('nuvio_collapsed_layout')

  return (
    <div>
      <SectionLabel action={<CollapseButton collapsed={collapsed} onClick={toggle} />} onClick={toggle}>Layout</SectionLabel>
      <Collapsible open={!collapsed}>
        <Card onReset={onReset}>
          <Field>
            <FieldLabel>Image Style</FieldLabel>
            <ToggleRow
              options={[{ value: 'backdrop', label: 'Backdrops' }, { value: 'poster', label: 'Posters' }]}
              value={imageType}
              onChange={onImageTypeChange}
            />
          </Field>
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
            <FieldLabel action={
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={layout.autoStagger ?? true}
                  onChange={e => set({ autoStagger: e.target.checked })}
                  style={{ accentColor: '#6c63ff', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Auto</span>
              </label>
            }>Vertical Stagger</FieldLabel>
            {layout.autoStagger ?? true
              ? <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', padding: '3px 0' }}>Computed from card size</div>
              : <RangeRow min={0} max={400} value={layout.stagger} displayValue={`${layout.stagger}px`}
                  onChange={(v) => set({ stagger: v })} />
            }
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
      </Collapsible>
    </div>
  )
}
