import { useRef, useEffect, useState } from 'react'
import { lonToTileX, latToTileY } from '../utils/tiles'

interface Props {
  lat:     number
  lon:     number
  flipped: boolean
  bearing: number
}

const ZOOM   = 13
const HALF   = 9    // 19×19 tile grid — fills OFF_SIZE at any rotation ≤45°
const GRID   = 160  // dot resolution
const SAMPLE = 4    // pixels sampled per dot dimension (4×4 block = 16 samples per dot)

const COLOR_BG    = '#050d14'
const COLOR_WATER = '#1a3a5c'
const COLOR_LAND  = '#0a1a0a'
const COLOR_SELF  = '#e08030'

const API_URL = (import.meta as { env: Record<string, string> }).env.VITE_API_URL ?? 'http://localhost:3000'

function tileUrl(z: number, x: number, y: number): string {
  return `${API_URL}/tiles/${z}/${x}/${y}`
}

function isWater(r: number, g: number, b: number): boolean {
  return b > r + 15 && b > g
}

const OFF_SIZE = Math.ceil(GRID * SAMPLE * Math.SQRT2)   // ~452 px; covers any rotation angle
const OFF_INSET = Math.floor((OFF_SIZE - GRID * SAMPLE) / 2) // pixel offset to centre region

function renderDots(
  ctx:    CanvasRenderingContext2D,
  offCtx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  w:      number,
  h:      number,
) {
  ctx.fillStyle = COLOR_BG
  ctx.fillRect(0, 0, w, h)

  const { data } = offCtx.getImageData(OFF_INSET, OFF_INSET, GRID * SAMPLE, GRID * SAMPLE)
  const cellW  = w / GRID
  const cellH  = h / GRID
  const dotW   = cellW * 0.65
  const dotH   = cellH * 0.65

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      let water = 0, opaque = 0
      for (let sy = 0; sy < SAMPLE; sy++) {
        for (let sx = 0; sx < SAMPLE; sx++) {
          const i = ((row * SAMPLE + sy) * (GRID * SAMPLE) + (col * SAMPLE + sx)) * 4
          if (data[i + 3] === 0) continue
          opaque++
          if (isWater(data[i], data[i + 1], data[i + 2])) water++
        }
      }
      if (opaque === 0) continue
      ctx.fillStyle = water > opaque / 2 ? COLOR_WATER : COLOR_LAND
      ctx.fillRect(
        col * cellW + (cellW - dotW) / 2,
        row * cellH + (cellH - dotH) / 2,
        dotW,
        dotH,
      )
    }
  }

  const selfCol  = Math.floor(GRID / 2)
  const selfRow  = Math.floor(GRID / 2)
  const selfX    = selfCol * cellW + (cellW - dotW) / 2
  const selfY    = selfRow * cellH + (cellH - dotH) / 2
  const selfCx   = selfCol * cellW + cellW / 2
  const selfCy   = selfRow * cellH + cellH / 2
  const crossT   = Math.max(1, dotW * 0.15)

  ctx.fillStyle = COLOR_SELF
  ctx.fillRect(selfCx - crossT / 2, selfY, crossT, dotH)  // vertical bar
  ctx.fillRect(selfX, selfCy - crossT / 2, dotW, crossT)  // horizontal bar
}

export function MapCanvas({ lat, lon, flipped, bearing }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = canvasRef.current
    if (!el || size.w === 0) return
    el.width  = size.w
    el.height = size.h
  }, [size])

  useEffect(() => {
    const el = canvasRef.current
    if (!el || size.w === 0) return
    const ctx = el.getContext('2d')!
    const { w, h } = size

    let cancelled = false
    let rafId: number | null = null

    const cx   = lonToTileX(lon, ZOOM)
    const cy   = latToTileY(lat, ZOOM)
    const cols = 2 * HALF + 1
    const rows = 2 * HALF + 1

    const offscreen = document.createElement('canvas')
    offscreen.width  = OFF_SIZE
    offscreen.height = OFF_SIZE
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true })!

    // Rotate the offscreen context so water ends up at the top after sampling
    const θ = (bearing + (flipped ? 180 : 0)) * Math.PI / 180
    offCtx.translate(OFF_SIZE / 2, OFF_SIZE / 2)
    offCtx.rotate(-θ)
    offCtx.translate(-OFF_SIZE / 2, -OFF_SIZE / 2)

    const tileW = OFF_SIZE / cols
    const tileH = OFF_SIZE / rows

    ctx.fillStyle = COLOR_BG
    ctx.fillRect(0, 0, w, h)

    // Debounce renderDots: cancel any pending frame and queue a fresh one.
    // This means at most one getImageData readback per animation frame regardless
    // of how many tiles arrive in a batch.
    function scheduleRender() {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        rafId = null
        if (!cancelled) renderDots(ctx, offCtx, w, h)
      })
    }

    for (let dy = -HALF; dy <= HALF; dy++) {
      for (let dx = -HALF; dx <= HALF; dx++) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          if (!cancelled) {
            offCtx.drawImage(img, (dx + HALF) * tileW, (dy + HALF) * tileH, tileW, tileH)
            scheduleRender()
          }
        }
        img.src = tileUrl(ZOOM, cx + dx, cy + dy)
      }
    }

    return () => {
      cancelled = true
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [lat, lon, size, bearing, flipped])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display:   'block',
        position:  'absolute',
        inset:     0,
        width:     '100%',
        height:    '100%',
        cursor:    'inherit',
        transform: 'none',
      }}
    />
  )
}
