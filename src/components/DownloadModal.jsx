import React, { useState, useEffect, useRef, useCallback } from 'react'
import { renderCanvas } from '../lib/canvas'
import { RESOLUTIONS } from '../lib/constants'
import { loadStored, useLocalStorage } from '../hooks/useLocalStorage'
import s from './DownloadModal.module.css'

const RES_KEY = 'backdrop_download_resolution'

function loadSavedRes() {
  const saved = loadStored(RES_KEY, null)
  return RESOLUTIONS.find(r => `${r.width}x${r.height}` === saved) ?? RESOLUTIONS[1]
}

export default function DownloadModal({ images, imageType, layout, overlay, text, excludedPaths, onClose }) {
  const [selectedRes, setSelectedRes] = useState(loadSavedRes)
  useLocalStorage(RES_KEY, `${selectedRes.width}x${selectedRes.height}`)
  const [previewUrl, setPreviewUrl]   = useState('')
  const [rendering, setRendering]     = useState(false)
  const offscreen = useRef(null)

  const buildSettings = useCallback((res) => ({
    gap:           layout.gap,
    scale:         layout.scale / 100,
    radius:        layout.radius,
    stagger:       layout.stagger,
    autoStagger:   layout.autoStagger,
    angleDeg:      layout.angle,
    offsetX:       layout.offsetX,
    offsetY:       layout.offsetY,
    imageOpacity:  layout.imageOpacity / 100,
    bgColor:       overlay.bgColor,
    overlayPreset: overlay.preset,
    overlayOpacity: overlay.opacity,
    overlayReach:  overlay.reach,
    imageType,
    width:  res.width,
    height: res.height,
  }), [layout, overlay, imageType])

  useEffect(() => {
    if (!images.length) return
    if (!offscreen.current) offscreen.current = document.createElement('canvas')

    let cancelled = false
    const run = async () => {
      setRendering(true)
      await document.fonts.ready
      if (cancelled) return
      renderCanvas(offscreen.current, images, buildSettings(selectedRes), text, excludedPaths)
      if (!cancelled) {
        setPreviewUrl(offscreen.current.toDataURL())
        setRendering(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [selectedRes, images, buildSettings, text, excludedPaths])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const download = () => {
    if (!offscreen.current) return
    const a = document.createElement('a')
    a.download = `backdrop-${Date.now()}.png`
    a.href = offscreen.current.toDataURL('image/png')
    a.click()
    onClose()
  }

  return (
    <div className={s.overlay} onClick={onClose} role="presentation">
      <div
        className={s.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <div className={s.header}>
          <span className={s.title} id="download-modal-title">Download Backdrop</span>
          <button className={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={s.preview}>
          {previewUrl && (
            <img src={previewUrl} alt="Backdrop preview" className={s.previewImg} />
          )}
          {rendering && (
            <div className={s.renderingOverlay}>
              <span>Rendering…</span>
            </div>
          )}
          {!previewUrl && !rendering && (
            <div className={s.empty}>No images loaded.</div>
          )}
        </div>

        <div className={s.controls}>
          <div className={s.resRow}>
            <label className={s.resLabel}>Resolution</label>
            <select
              value={`${selectedRes.width}x${selectedRes.height}`}
              onChange={e => {
                const found = RESOLUTIONS.find(r => `${r.width}x${r.height}` === e.target.value)
                if (found) setSelectedRes(found)
              }}
            >
              {RESOLUTIONS.map(r => (
                <option key={r.label} value={`${r.width}x${r.height}`}>{r.label}</option>
              ))}
            </select>
          </div>
          <button className={s.downloadBtn} onClick={download} disabled={rendering || !previewUrl}>
            {rendering ? 'Rendering…' : `Download ${selectedRes.width}×${selectedRes.height}`}
          </button>
        </div>
      </div>
    </div>
  )
}
