import React, { useRef, useEffect } from 'react'
import { renderCanvas } from '../lib/canvas'
import s from './CanvasPreview.module.css'

export default function CanvasPreview({ images, layout, overlay, triggerRender }) {
  const canvasRef = useRef(null)
  const hasImages = images.length > 0

  useEffect(() => {
    if (!hasImages || !canvasRef.current) return
    renderCanvas(canvasRef.current, images, {
      gap: layout.gap,
      scale: layout.scale / 100,
      radius: layout.radius,
      stagger: layout.stagger,
      angleDeg: layout.angle,
      offsetX: layout.offsetX,
      offsetY: layout.offsetY,
      bgColor: overlay.bgColor,
      overlayPreset: overlay.preset,
      overlayOpacity: overlay.opacity,
    })
  }, [images, layout, overlay, triggerRender])

  return (
    <div className={s.wrap}>
      <div className={s.toolbar}>
        <span className={s.toolbarLabel}>Preview · 1920 × 1080</span>
      </div>
      <div className={s.canvasWrap}>
        {!hasImages && (
          <div className={s.placeholder}>
            <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
              <rect x="8" y="16" width="48" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 28h48" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"/>
              <circle cx="20" cy="22" r="3" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <p>Your backdrop will appear here</p>
            <small>Configure a source and click Generate</small>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={s.canvas}
          style={{ display: hasImages ? 'block' : 'none' }}
        />
      </div>
    </div>
  )
}
