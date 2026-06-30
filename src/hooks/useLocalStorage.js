import { useEffect } from 'react'

export function loadStored(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

export function useLocalStorage(key, value, debounceMs = 0) {
  useEffect(() => {
    const save = () => {
      try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
    }
    if (debounceMs <= 0) { save(); return }
    const t = setTimeout(save, debounceMs)
    return () => clearTimeout(t)
  }, [key, value, debounceMs])
}
