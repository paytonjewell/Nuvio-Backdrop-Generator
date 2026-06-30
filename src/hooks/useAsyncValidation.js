import { useState, useEffect, useRef } from 'react'

/**
 * Debounced async validation hook.
 * Returns a status object { state: '' | 'checking' | 'ok' | 'err', message: string }.
 */
export function useAsyncValidation(value, validateFn, {
  checking  = 'Checking…',
  ok        = '✓ Valid',
  err       = '✗ Invalid',
  errNetwork = '✗ Could not reach service',
  debounceMs = 600,
} = {}) {
  const [status, setStatus] = useState({ state: '', message: '' })
  const timer = useRef(null)

  useEffect(() => {
    clearTimeout(timer.current)
    if (!value) { setStatus({ state: '', message: '' }); return }
    setStatus({ state: 'checking', message: checking })
    timer.current = setTimeout(async () => {
      try {
        const valid = await validateFn(value)
        setStatus(valid ? { state: 'ok', message: ok } : { state: 'err', message: err })
      } catch {
        setStatus({ state: 'err', message: errNetwork })
      }
    }, debounceMs)
    return () => clearTimeout(timer.current)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return status
}
