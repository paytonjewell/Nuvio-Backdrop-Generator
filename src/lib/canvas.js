import { FONT_WEIGHTS, TEXT_ANCHORS } from './constants'

export const CANVAS_W = 1920
export const CANVAS_H = 1080

export function getPathFromSrc(src) {
  const m = src.match(/\/p\/w\d+(\/.+)$/)
  return m ? m[1] : null
}

function getColOrder(numCols, visibleCols, centerCol) {
  const colOrder = []
  for (let d = 0; d < visibleCols; d++) {
    if (d === 0) { colOrder.push(centerCol); continue }
    if (centerCol + d < visibleCols) colOrder.push(centerCol + d)
    if (centerCol - d >= 0) colOrder.push(centerCol - d)
  }
  for (let col = visibleCols; col < numCols; col++) colOrder.push(col)
  return colOrder
}

// Returns the index into the images array that was drawn at the given canvas-pixel coordinate,
// or null if no image was found at that position.
export function hitTestCanvas(canvasX, canvasY, images, settings) {
  const { gap, scale, stagger, autoStagger = true, angleDeg, offsetX = 0, offsetY = 0,
          imageType = 'backdrop', width = CANVAS_W, height = CANVAS_H } = settings
  const W = width, H = height
  const cardW = Math.round(320 * scale * (W / 1920))
  const cardH = imageType === 'poster' ? Math.round(cardW * 3 / 2) : Math.round(cardW * 9 / 16)
  const effectiveStagger = autoStagger ? Math.round((cardH + gap) / 2) : stagger
  const angleRad = -(angleDeg * Math.PI) / 180
  const diag = Math.ceil(Math.sqrt(W * W + H * H))
  const numCols = Math.ceil(diag / (cardW + gap)) + 4
  const numRows = Math.ceil(diag / (cardH + gap)) + 4
  const visibleCols = numCols - 4
  const centerCol = Math.min(Math.round((diag - cardW) / (2 * (cardW + gap))), visibleCols - 1)

  // Inverse transform: canvas pixel → grid pixel
  const dx = canvasX - (W / 2 + offsetX)
  const dy = canvasY - (H / 2 + offsetY)
  const cos_a = Math.cos(angleRad), sin_a = Math.sin(angleRad)
  const gx = dx * cos_a + dy * sin_a + diag / 2
  const gy = -dx * sin_a + dy * cos_a + diag / 2

  const colOrder = getColOrder(numCols, visibleCols, centerCol)

  let imgIdx = 0
  for (const col of colOrder) {
    const rowOffset = col % 2 === 0 ? 0 : effectiveStagger
    for (let row = -1; row < numRows; row++) {
      const cardGy = row * (cardH + gap) + cardH / 2 + rowOffset
      const cardGx = col * (cardW + gap) + cardW / 2
      const projY = (cardGx - diag / 2) * sin_a + (cardGy - diag / 2) * cos_a + H / 2
      if (projY < -(cardH / 2) || projY > H + cardH / 2) continue
      if (imgIdx >= images.length) return null
      const cardX = col * (cardW + gap), cardY = row * (cardH + gap) + rowOffset
      if (gx >= cardX && gx <= cardX + cardW && gy >= cardY && gy <= cardY + cardH)
        return imgIdx
      imgIdx++
    }
  }
  return null
}

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

function applyOverlay(ctx, preset, opacity, reach = 0.6, W = CANVAS_W, H = CANVAS_H) {
  if (preset === 'none') return

  let grad
  if (preset === 'dark-left') {
    grad = ctx.createLinearGradient(0, 0, W * reach, 0)
    grad.addColorStop(0, `rgba(0,0,0,${opacity})`)
    grad.addColorStop(0.5, `rgba(0,0,0,${(opacity * 0.5).toFixed(2)})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
  } else if (preset === 'dark-right') {
    grad = ctx.createLinearGradient(W, 0, W * (1 - reach), 0)
    grad.addColorStop(0, `rgba(0,0,0,${opacity})`)
    grad.addColorStop(0.5, `rgba(0,0,0,${(opacity * 0.5).toFixed(2)})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
  } else if (preset === 'bottom') {
    grad = ctx.createLinearGradient(0, H, 0, H * (1 - reach))
    grad.addColorStop(0, `rgba(0,0,0,${opacity})`)
    grad.addColorStop(0.5, `rgba(0,0,0,${(opacity * 0.5).toFixed(2)})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
  } else if (preset === 'vignette') {
    const outerR = Math.max(W, H) * (0.9 - reach * 0.5)
    grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, outerR)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(0.5, `rgba(0,0,0,${(opacity * 0.3).toFixed(2)})`)
    grad.addColorStop(1, `rgba(0,0,0,${opacity})`)
  } else if (preset === 'cinematic') {
    const lg = ctx.createLinearGradient(0, 0, W * reach, 0)
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


function drawText(ctx, text, W = CANVAS_W, H = CANVAS_H) {
  const { content, font, size, preset, offsetX, offsetY, color, shadow, shadowBlur, gradient, gradientTo } = text
  if (!content.trim()) return

  const dpr = W / 1920
  const PAD = Math.round(80 * dpr)
  const weight = FONT_WEIGHTS[font] || 700
  ctx.save()
  ctx.font = `${weight} ${Math.round(size * dpr)}px "${font}"`

  const anchor = TEXT_ANCHORS[preset] || TEXT_ANCHORS['bottom-left']
  const x = PAD + anchor.xFrac * (W - PAD * 2) + offsetX * dpr
  const y = PAD + anchor.yFrac * (H - PAD * 2) + offsetY * (H / 1080)

  ctx.textAlign = anchor.align
  ctx.textBaseline = anchor.baseline

  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.9)'
    ctx.shadowBlur = shadowBlur * dpr
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4 * dpr
  }

  if (gradient) {
    const textW = ctx.measureText(content).width
    const startX = anchor.align === 'center' ? x - textW / 2
                 : anchor.align === 'right'  ? x - textW
                 : x
    const grad = ctx.createLinearGradient(startX, y, startX + textW, y)
    grad.addColorStop(0, color)
    grad.addColorStop(1, gradientTo)
    ctx.fillStyle = grad
  } else {
    ctx.fillStyle = color
  }

  ctx.fillText(content, x, y)
  ctx.restore()
}

export function renderCanvas(canvas, images, settings, text = {}, excludedPaths = []) {
  const excluded = new Set(excludedPaths)
  const { gap, scale, radius, stagger, autoStagger = true, angleDeg, bgColor, overlayPreset, overlayOpacity, overlayReach = 0.6, offsetX = 0, offsetY = 0, imageType = 'backdrop', imageOpacity = 1, width = CANVAS_W, height = CANVAS_H } = settings
  const W = width, H = height

  const cardW = Math.round(320 * scale * (W / 1920))
  const cardH = imageType === 'poster'
    ? Math.round(cardW * 3 / 2)
    : Math.round(cardW * 9 / 16)
  const effectiveStagger = autoStagger ? Math.round((cardH + gap) / 2) : stagger
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
  const colOrder = getColOrder(numCols, visibleCols, centerCol)

  let imgIdx = 0
  ctx.save()
  ctx.translate(W / 2 + offsetX, H / 2 + offsetY)
  ctx.rotate(angleRad)
  ctx.translate(-diag / 2, -diag / 2)

  outer:
  for (const col of colOrder) {
    const rowOffset = col % 2 === 0 ? 0 : effectiveStagger
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
      ctx.globalAlpha = imageOpacity
      ctx.drawImage(img, x, y, cardW, cardH)
      if (excluded.size > 0) {
        const imgPath = getPathFromSrc(img.src)
        if (imgPath && excluded.has(imgPath)) {
          ctx.globalAlpha = 0.65
          ctx.fillStyle = 'rgba(220,38,38,0.85)'
          ctx.fillRect(x, y, cardW, cardH)
          ctx.globalAlpha = 1
          ctx.strokeStyle = 'rgba(255,255,255,0.9)'
          ctx.lineWidth = Math.max(2, cardW * 0.03)
          ctx.lineCap = 'round'
          const pad = cardW * 0.2
          ctx.beginPath()
          ctx.moveTo(x + pad, y + pad); ctx.lineTo(x + cardW - pad, y + cardH - pad)
          ctx.moveTo(x + cardW - pad, y + pad); ctx.lineTo(x + pad, y + cardH - pad)
          ctx.stroke()
        }
      }
      ctx.restore()
    }
  }

  ctx.restore()
  applyOverlay(ctx, overlayPreset, overlayOpacity, overlayReach, W, H)
  if (text.content) drawText(ctx, text, W, H)
}
