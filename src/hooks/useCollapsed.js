import { useState, useEffect, useCallback } from 'react'

export function useCollapsed(storageKey, defaultCollapsed = false) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const v = localStorage.getItem(storageKey)
      return v !== null ? JSON.parse(v) : defaultCollapsed
    } catch {
      return defaultCollapsed
    }
  })

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(collapsed)) } catch {}
  }, [collapsed, storageKey])

  const toggle = useCallback(() => setCollapsed(c => !c), [])

  return { collapsed, toggle }
}
