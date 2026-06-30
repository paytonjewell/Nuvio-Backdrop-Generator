import React, { useEffect, useRef } from 'react'
import s from './ExcludedModal.module.css'
import { TMDB_IMAGE_BASE } from '../lib/constants'

const THUMB_SIZE = 'w185'

export default function ExcludedModal({ paths, onToggle, onClearAll, onClose }) {
  const closeRef = useRef(null)

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Focus close button when modal opens
  useEffect(() => { closeRef.current?.focus() }, [])

  return (
    <div className={s.overlay} onClick={onClose} role="presentation">
      <div
        className={s.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="excluded-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <div className={s.header}>
          <span className={s.title} id="excluded-modal-title">
            Excluded Images
            <span className={s.count}>{paths.length}</span>
          </span>
          <div className={s.headerActions}>
            {paths.length > 0 && (
              <button className={s.clearBtn} onClick={onClearAll}>Clear all</button>
            )}
            <button ref={closeRef} className={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className={s.body}>
          {paths.length === 0 ? (
            <div className={s.empty}>
              <p>No images excluded yet.</p>
              <small>In the preview, click ✎ Edit then click any image to exclude it from future generations.</small>
            </div>
          ) : (
            <div className={s.grid}>
              {paths.map(path => (
                <button
                  key={path}
                  className={s.item}
                  onClick={() => onToggle(path)}
                  aria-label="Restore this image"
                >
                  <img src={`${TMDB_IMAGE_BASE}${THUMB_SIZE}${path}`} alt="" loading="lazy" className={s.thumb} />
                  <div className={s.restoreOverlay}>
                    <span className={s.restoreLabel}>Restore</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
