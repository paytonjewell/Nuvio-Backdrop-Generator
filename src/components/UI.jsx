import React, { useState, useCallback } from "react";
import s from "./UI.module.css";

export function useCollapsed(storageKey, defaultCollapsed = false) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const v = localStorage.getItem(storageKey)
      return v !== null ? JSON.parse(v) : defaultCollapsed
    } catch {
      return defaultCollapsed
    }
  })

  const toggle = useCallback(() => {
    setCollapsed(c => {
      const next = !c
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      return next
    })
  }, [storageKey])

  return { collapsed, toggle }
}

export function SectionLabel({ children, action }) {
  return (
    <div className={s.secLabelRow}>
      <span className={s.secLabel}>{children}</span>
      {action}
    </div>
  );
}

export function CollapseButton({ collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "rgba(255,255,255,0.3)",
        padding: 2,
        display: "flex",
        alignItems: "center",
        lineHeight: 1,
      }}
      title={collapsed ? "Expand" : "Collapse"}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        style={{
          transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }}
      >
        <path
          d="M3 5l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function Collapsible({ open, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows 0.25s ease",
      }}
    >
      <div style={{ minHeight: 0, overflow: open ? "visible" : "hidden" }}>{children}</div>
    </div>
  );
}

export function ResetButton({ onClick }) {
  return (
    <button className={s.resetBtn} onClick={onClick} title="Reset to defaults">
      ↺
    </button>
  );
}

export function Card({ children, style, onReset }) {
  return (
    <div className={s.card} style={style}>
      {onReset && (
        <button
          className={s.cardReset}
          onClick={onReset}
          title="Reset to defaults"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-undo2-icon lucide-undo-2"
          >
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
          </svg>
        </button>
      )}
      {children}
    </div>
  );
}

export function Field({ children, style }) {
  return (
    <div className={s.field} style={style}>
      {children}
    </div>
  );
}

export function FieldLabel({ children, action }) {
  return (
    <div className={s.fieldLabelRow}>
      <label className={s.label}>{children}</label>
      {action}
    </div>
  );
}

export function RangeRow({
  id,
  min,
  max,
  value,
  step = 1,
  onChange,
  displayValue,
}) {
  return (
    <div className={s.rangeRow}>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className={s.rangeVal}>{displayValue ?? value}</span>
    </div>
  );
}

export function ToggleRow({ options, value, onChange }) {
  return (
    <div className={s.toggleRow}>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`${s.toggleOpt} ${value === opt.value ? s.active : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function TabGroup({ tabs, value, onChange }) {
  return (
    <div className={s.tabGroup}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`${s.tab} ${value === tab.value ? s.active : ""}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Notice({ children, style }) {
  return (
    <div className={s.notice} style={style}>
      {children}
    </div>
  );
}

export function StatusBar({ status }) {
  return (
    <div className={`${s.statusBar} ${status.state ? s[status.state] : ""}`}>
      <div className={s.dot} />
      <span>{status.message}</span>
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button className={s.btnPrimary} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, disabled, style }) {
  return (
    <button
      className={s.btnSecondary}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
