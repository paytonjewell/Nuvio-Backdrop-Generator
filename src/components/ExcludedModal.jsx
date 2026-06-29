import React from 'react'
import s from './ExcludedModal.module.css'

const THUMB_BASE = 'https://image.tmdb.org/t/p/w185'

export default function ExcludedModal({ paths, onToggle, onClearAll, onClose }) {
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <div className={s.header}>
          <span className={s.title}>
            Excluded Images
            <span className={s.count}>{paths.length}</span>
          </span>
          <div className={s.headerActions}>
            {paths.length > 0 && (
              <button className={s.clearBtn} onClick={onClearAll}>Clear all</button>
            )}
            <button className={s.closeBtn} onClick={onClose}>✕</button>
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
                <button key={path} className={s.item} onClick={() => onToggle(path)} title="Click to restore">
                  <img src={THUMB_BASE + path} alt="" loading="lazy" className={s.thumb} />
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
