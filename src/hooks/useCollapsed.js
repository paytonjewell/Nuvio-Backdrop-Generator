import { useState, useCallback } from 'react'
import { loadStored, useLocalStorage } from './useLocalStorage'

export function useCollapsed(storageKey, defaultCollapsed = false) {
  const [collapsed, setCollapsed] = useState(() => loadStored(storageKey, defaultCollapsed))
  useLocalStorage(storageKey, collapsed)

  const toggle = useCallback(() => setCollapsed(c => !c), [])

  return { collapsed, toggle }
}
