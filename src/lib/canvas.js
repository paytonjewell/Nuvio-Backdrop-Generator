export const CANVAS_W = 1920
export const CANVAS_H = 1080

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function applyOverlay(ctx, preset, opacity) {
  const W = CANVAS_W, H = CANVAS_H
  if (preset === 'none') return

  let grad
  if (preset === 'dark-left') {
    grad = ctx.createLinearGradient(0, 0, W, 0)
    grad.addColorStop(0, `rgba(0,0,0,${opacity})`)
    grad.addColorStop(0.5, `rgba(0,0,0,${(opacity * 0.7).toFixed(2)})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
  } else if (preset === 'dark-right') {
    grad = ctx.createLinearGradient(W, 0, 0, 0)
    grad.addColorStop(0, `rgba(0,0,0,${opacity})`)
    grad.addColorStop(0.5, `rgba(0,0,0,${(opacity * 0.7).toFixed(2)})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
  } else if (preset === 'bottom') {
    grad = ctx.createLinearGradient(0, H, 0, 0)
    grad.addColorStop(0, `rgba(0,0,0,${opacity})`)
    grad.addColorStop(0.5, `rgba(0,0,0,${(opacity * 0.35).toFixed(2)})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
  } else if (preset === 'vignette') {
    grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.65)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(0.55, `rgba(0,0,0,${(opacity * 0.3).toFixed(2)})`)
    grad.addColorStop(1, `rgba(0,0,0,${opacity})`)
  } else if (preset === 'cinematic') {
    const lg = ctx.createLinearGradient(0, 0, W * 0.55, 0)
    lg.addColorStop(0, `rgba(0,0,0,${opacity})`)
    lg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = lg
    ctx.fillRect(0, 0, W, H)
    const barH = H * 0.1
    const tg = ctx.createLinearGradient(0, 0, 0, barH * 2)
    tg.addColorStop(0, `rgba(0,0,0,${opacity})`); tg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = tg; ctx.fillRect(0, 0, W, barH * 2)
    const bg = ctx.createLinearGradient(0, H, 0, H - barH * 2)
    bg.addColorStop(0, `rgba(0,0,0,${opacity})`); bg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = bg; ctx.fillRect(0, H - barH * 2, W, barH * 2)
    return
  }
  if (grad) { ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H) }
}

export function renderCanvas(canvas, images, settings) {
  const { gap, scale, radius, stagger, angleDeg, bgColor, overlayPreset, overlayOpacity, offsetX = 0, offsetY = 0 } = settings
  const W = CANVAS_W, H = CANVAS_H

  const cardW = Math.round(320 * scale * (W / 1920))
  const cardH = Math.round(cardW * 9 / 16)
  const angleRad = -(angleDeg * Math.PI) / 180

  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  if (bgColor !== 'transparent') {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, W, H)
  }

  const diag = Math.ceil(Math.sqrt(W * W + H * H))
  const numCols = Math.ceil(diag / (cardW + gap)) + 4
  const numRows = Math.ceil(diag / (cardH + gap)) + 4
  // The +4 cols in numCols are off-screen buffer for rotation coverage
  const visibleCols = numCols - 4

  // Column whose center aligns closest to the canvas center in rotated space
  const centerCol = Math.min(
    Math.round((diag - cardW) / (2 * (cardW + gap))),
    visibleCols - 1
  )

  // Fill order: center column first, then alternate outward, buffer cols last
  const colOrder = []
  for (let d = 0; d < visibleCols; d++) {
    if (d === 0) { colOrder.push(centerCol); continue }
    if (centerCol + d < visibleCols) colOrder.push(centerCol + d)
    if (centerCol - d >= 0) colOrder.push(centerCol - d)
  }
  for (let col = visibleCols; col < numCols; col++) colOrder.push(col)

  let imgIdx = 0
  ctx.save()
  ctx.translate(W / 2 + offsetX, H / 2 + offsetY)
  ctx.rotate(angleRad)
  ctx.translate(-diag / 2, -diag / 2)

  outer:
  for (const col of colOrder) {
    const rowOffset = col % 2 === 0 ? 0 : stagger
    for (let row = -1; row < numRows; row++) {
      // Check whether this card's center projects onto the canvas vertically.
      // If not, skip the slot without consuming an image so it can be used in
      // the next visible row instead of being wasted off-screen.
      const gx = col * (cardW + gap) + cardW / 2
      const gy = row * (cardH + gap) + cardH / 2 + rowOffset
      const canvasY = (gx - diag / 2) * Math.sin(angleRad) + (gy - diag / 2) * Math.cos(angleRad) + H / 2
      if (canvasY < -(cardH / 2) || canvasY > H + cardH / 2) continue

      if (imgIdx >= images.length) break outer
      const img = images[imgIdx++]
      const x = col * (cardW + gap)
      const y = row * (cardH + gap) + rowOffset
      ctx.save()
      roundRect(ctx, x, y, cardW, cardH, radius)
      ctx.clip()
      ctx.drawImage(img, x, y, cardW, cardH)
      ctx.restore()
    }
  }

  ctx.restore()
  applyOverlay(ctx, overlayPreset, overlayOpacity)
}
