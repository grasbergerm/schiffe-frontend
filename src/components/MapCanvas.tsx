import { useRef, useEffect, useState } from 'react'
import type { CellType, MapGrid } from '../types'
import { rotateGrid } from '../utils/rotateGrid'

interface Props {
  lat:     number
  lon:     number
  flipped: boolean
  bearing: number
}

const GRID = 160

const API_URL = (import.meta as { env: Record<string, string> }).env.VITE_API_URL ?? 'http://localhost:3000'

function getMapColors(el: HTMLElement) {
  const s = getComputedStyle(el)
  return {
    bg:    s.getPropertyValue('--map-bg').trim(),
    water: s.getPropertyValue('--map-water').trim(),
    land:  s.getPropertyValue('--map-land').trim(),
    self:  s.getPropertyValue('--map-self').trim(),
  }
}

export function MapCanvas({ lat, lon, flipped, bearing }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [grid, setGrid] = useState<CellType[][] | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  // Observe canvas size
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Sync canvas resolution with element size
  useEffect(() => {
    const el = canvasRef.current
    if (!el || size.w === 0) return
    el.width  = size.w
    el.height = size.h
  }, [size])

  // Listen for theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Fetch grid from /map endpoint
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`${API_URL}/map?lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then((data: MapGrid) => {
        if (!cancelled) {
          setGrid(data.grid)
          setLoading(false)
        }
      })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [lat, lon])

  // Render dots
  useEffect(() => {
    const el = canvasRef.current
    if (!el || size.w === 0) return
    const ctx = el.getContext('2d')!
    const { w, h } = size
    const colors = getMapColors(el)

    if (!grid) {
      ctx.fillStyle = colors.bg
      ctx.fillRect(0, 0, w, h)
      if (loading) {
        ctx.fillStyle = colors.water
        ctx.font = '11px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('loading map\u2026', w / 2, h / 2)
      }
      return
    }

    const angle = (bearing + (flipped ? 180 : 0)) % 360
    const rotated = rotateGrid(grid, angle, GRID)

    ctx.fillStyle = colors.bg
    ctx.fillRect(0, 0, w, h)

    const cellW = w / GRID
    const cellH = h / GRID
    const dotW  = cellW * 0.65
    const dotH  = cellH * 0.65

    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        const cell = rotated[row][col]
        if (cell === null) continue
        ctx.fillStyle = cell === 'water' ? colors.water : colors.land
        ctx.fillRect(
          col * cellW + (cellW - dotW) / 2,
          row * cellH + (cellH - dotH) / 2,
          dotW,
          dotH,
        )
      }
    }

    // Self-position crosshair at center
    const selfCol = Math.floor(GRID / 2)
    const selfRow = Math.floor(GRID / 2)
    const selfX   = selfCol * cellW + (cellW - dotW) / 2
    const selfY   = selfRow * cellH + (cellH - dotH) / 2
    const selfCx  = selfCol * cellW + cellW / 2
    const selfCy  = selfRow * cellH + cellH / 2
    const crossT  = Math.max(1, dotW * 0.15)

    ctx.fillStyle = colors.self
    ctx.fillRect(selfCx - crossT / 2, selfY, crossT, dotH)
    ctx.fillRect(selfX, selfCy - crossT / 2, dotW, crossT)
  }, [grid, loading, bearing, flipped, size, isDark])

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
