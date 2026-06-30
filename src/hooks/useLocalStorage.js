import { useEffect } from 'react'

/**
 * Persists `value` to localStorage under `key` whenever it changes.
 * Pass `debounceMs > 0` for high-frequency values like sliders.
 * Serializes with JSON.stringify — pass pre-serialized primitives separately.
 */
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
