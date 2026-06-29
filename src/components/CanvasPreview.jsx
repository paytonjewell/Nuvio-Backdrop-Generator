import React, { useRef, useEffect, useState } from "react";
import { renderCanvas, hitTestCanvas, getPathFromSrc } from "../lib/canvas";
import s from "./CanvasPreview.module.css";

export default function CanvasPreview({
  images,
  imageType,
  layout,
  overlay,
  text,
  resolution = { width: 1920, height: 1080 },
  excludedPaths = [],
  onToggleExclusion,
  onExitEditMode,
  onShuffle,
  triggerRender,
}) {
  const canvasRef = useRef(null);
  const hasImages = images.length > 0;
  const [editMode, setEditMode] = useState(false);
  const settingsRef = useRef({});

  const handleCanvasClick = (e) => {
    if (!editMode || !canvasRef.current || images.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    const idx = hitTestCanvas(canvasX, canvasY, images, settingsRef.current);
    if (idx !== null) {
      const path = getPathFromSrc(images[idx].src);
      if (path) onToggleExclusion(path);
    }
  };

  useEffect(() => {
    if (!hasImages || !canvasRef.current) return;
    const render = async () => {
      await document.fonts.ready;
      const settings = {
        gap: layout.gap,
        scale: layout.scale / 100,
        radius: layout.radius,
        stagger: layout.stagger,
        autoStagger: layout.autoStagger,
        angleDeg: layout.angle,
        offsetX: layout.offsetX,
        offsetY: layout.offsetY,
        imageOpacity: layout.imageOpacity / 100,
        bgColor: overlay.bgColor,
        overlayPreset: overlay.preset,
        overlayOpacity: overlay.opacity,
        overlayReach: overlay.reach,
        imageType,
        width: resolution.width,
        height: resolution.height,
      };
      settingsRef.current = settings;
      renderCanvas(canvasRef.current, images, settings, text, excludedPaths);
    };
    render();
  }, [images, layout, overlay, text, resolution, excludedPaths, triggerRender]);

  return (
    <div className={s.wrap}>
      <div className={s.toolbar}>
        <span className={s.toolbarLabel}>
          Preview · {resolution.width} × {resolution.height}
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {hasImages && (
            <button
              className={`${s.shuffleBtn} ${editMode ? s.editBtnActive : ""}`}
              onClick={() => {
                if (editMode && onExitEditMode) onExitEditMode();
                setEditMode((m) => !m);
              }}
              title={
                editMode
                  ? "Exit edit mode"
                  : "Click images to exclude them from future generations"
              }
            >
              {editMode ? "✕ Done" : "✎ Edit"}
            </button>
          )}
          {onShuffle && (
            <button
              className={s.shuffleBtn}
              onClick={onShuffle}
              disabled={!hasImages}
              title="Shuffle images"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-shuffle-icon lucide-shuffle"
              >
                <path d="m18 14 4 4-4 4" />
                <path d="m18 2 4 4-4 4" />
                <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" />
                <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" />
                <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
              </svg>{" "}
              Shuffle Images
            </button>
          )}
        </div>
      </div>
      <div className={s.canvasWrap}>
        {!hasImages && (
          <div className={s.placeholder}>
            <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
              <rect
                x="8"
                y="16"
                width="48"
                height="32"
                rx="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M8 28h48"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <circle
                cx="20"
                cy="22"
                r="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <p>Your backdrop will appear here</p>
            <small>Configure a source and click Generate</small>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={s.canvas}
          style={{
            display: hasImages ? "block" : "none",
            cursor: editMode ? "crosshair" : "default",
          }}
          onClick={handleCanvasClick}
        />
      </div>
    </div>
  );
}
