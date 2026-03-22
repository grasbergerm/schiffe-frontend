import { useRef, useEffect, useState, useMemo } from 'react'
import type { ShipData, CellType, MapGrid, MapBounds } from '../types'
import { rotateGrid } from '../utils/rotateGrid'
import { getShipTypeInfo } from '../utils/shipTypes'
import { shipPulseAlpha } from '../utils/pulse'

interface Props {
  lat:     number
  lon:     number
  flipped: boolean
  bearing: number
  ships:   ShipData[]
}


const API_URL = (import.meta as { env: Record<string, string> }).env.VITE_API_URL ?? 'http://localhost:3000'

function getMapColors(el: HTMLElement) {
  const s = getComputedStyle(el)
  return {
    bg:        s.getPropertyValue('--map-bg').trim(),
    water:     s.getPropertyValue('--map-water').trim(),
    land:      s.getPropertyValue('--map-land').trim(),
    self:      s.getPropertyValue('--map-self').trim(),
    ship:      s.getPropertyValue('--map-ship').trim(),
    cargo:     s.getPropertyValue('--cargo').trim(),
    tanker:    s.getPropertyValue('--tanker').trim(),
    passenger: s.getPropertyValue('--passenger').trim(),
    other:     s.getPropertyValue('--other').trim(),
  }
}

export function MapCanvas({ lat, lon, flipped, bearing, ships }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [grid, setGrid] = useState<CellType[][] | null>(null)
  const [paddedBounds, setPaddedBounds] = useState<MapBounds | null>(null)
  const [loading, setLoading] = useState(true)
  const colorsRef = useRef<ReturnType<typeof getMapColors> | null>(null)
  const updateColors = () => {
    const el = canvasRef.current
    if (el) colorsRef.current = getMapColors(el)
  }

  // Refs for rAF callback to avoid stale closures
  const shipsRef = useRef(ships)
  const boundsRef = useRef(paddedBounds)
  const gridRef = useRef(grid)
  const bearingRef = useRef(bearing)
  const flippedRef = useRef(flipped)
  shipsRef.current = ships
  boundsRef.current = paddedBounds
  gridRef.current = grid
  bearingRef.current = bearing
  flippedRef.current = flipped

  // Pre-rotate grid when deps change (memoized, not in rAF)
  const rotated = useMemo(() => {
    if (!grid) return null
    const angle = (bearing + (flipped ? 180 : 0)) % 360
    return rotateGrid(grid, angle, grid.length)
  }, [grid, bearing, flipped])
  const rotatedRef = useRef(rotated)
  rotatedRef.current = rotated

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

  // Cache colors and update on theme changes
  useEffect(() => {
    updateColors()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => updateColors()
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
          setPaddedBounds(data.paddedBounds)
          setLoading(false)
        }
      })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [lat, lon])

  // Offscreen canvas caching the static grid + crosshair
  const gridCanvasRef = useRef<OffscreenCanvas | null>(null)
  const cachedRotatedRef = useRef<(CellType | null)[][] | null>(null)
  const cachedSizeRef = useRef('')

  // Single animation loop: blits cached grid + draws pulsing ship dots
  useEffect(() => {
    const el = canvasRef.current
    if (!el || size.w === 0) return
    const ctx = el.getContext('2d')!
    const { w, h } = size

    let animId: number

    function ensureGridCache(
      colors: ReturnType<typeof getMapColors>,
      rotatedGrid: (CellType | null)[][],
      gridSize: number,
    ): OffscreenCanvas {
      const sizeKey = `${w}:${h}:${gridSize}`
      // rotatedGrid is from useMemo — same reference means same content
      if (cachedRotatedRef.current === rotatedGrid && cachedSizeRef.current === sizeKey && gridCanvasRef.current) {
        return gridCanvasRef.current
      }

      const oc = new OffscreenCanvas(w, h)
      const octx = oc.getContext('2d')!
      octx.fillStyle = colors.bg
      octx.fillRect(0, 0, w, h)

      const cellW = w / gridSize
      const cellH = h / gridSize
      const dotW  = cellW * 0.65
      const dotH  = cellH * 0.65

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const cell = rotatedGrid[row][col]
          if (cell === null) continue
          octx.fillStyle = cell === 'water' ? colors.water : colors.land
          octx.fillRect(
            col * cellW + (cellW - dotW) / 2,
            row * cellH + (cellH - dotH) / 2,
            dotW,
            dotH,
          )
        }
      }

      // Self-position crosshair at center
      const selfCol = Math.floor(gridSize / 2)
      const selfRow = Math.floor(gridSize / 2)
      const selfX   = selfCol * cellW + (cellW - dotW) / 2
      const selfY   = selfRow * cellH + (cellH - dotH) / 2
      const selfCx  = selfCol * cellW + cellW / 2
      const selfCy  = selfRow * cellH + cellH / 2
      const crossT  = Math.max(1, dotW * 0.15)

      octx.fillStyle = colors.self
      octx.fillRect(selfCx - crossT / 2, selfY, crossT, dotH)
      octx.fillRect(selfX, selfCy - crossT / 2, dotW, crossT)

      gridCanvasRef.current = oc
      cachedRotatedRef.current = rotatedGrid
      cachedSizeRef.current = sizeKey
      return oc
    }

    function draw(now: number) {
      animId = requestAnimationFrame(draw)

      const colors = colorsRef.current
      if (!colors) return
      const currentGrid = gridRef.current
      const currentRotated = rotatedRef.current

      if (!currentGrid || !currentRotated) {
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

      const gridSize = currentGrid.length

      // Blit cached grid (one drawImage instead of 25,600 fillRects)
      const cached = ensureGridCache(colors, currentRotated, gridSize)
      ctx.drawImage(cached, 0, 0)

      // Ship dots
      const cellW = w / gridSize
      const cellH = h / gridSize
      const currentShips = shipsRef.current
      const currentBounds = boundsRef.current
      if (currentBounds && currentShips.length > 0) {
        const angle = (bearingRef.current + (flippedRef.current ? 180 : 0)) % 360
        const theta = (angle * Math.PI) / 180
        const cos = Math.cos(theta)
        const sin = Math.sin(theta)
        const cx = (gridSize - 1) / 2
        const radius = Math.max(cellW, cellH) * 0.35
        const timeSec = now / 1000

        for (const ship of currentShips) {
          const srcCol = (ship.lon - currentBounds.westLon) / (currentBounds.eastLon - currentBounds.westLon) * gridSize
          const srcRow = (currentBounds.northLat - ship.lat) / (currentBounds.northLat - currentBounds.southLat) * gridSize
          const dx = srcCol - cx
          const dy = srcRow - cx
          const outCol = cx + dx * cos - dy * sin
          const outRow = cx + dx * sin + dy * cos
          if (outCol < 0 || outCol >= gridSize || outRow < 0 || outRow >= gridSize) continue
          const px = outCol * cellW + cellW / 2
          const py = outRow * cellH + cellH / 2

          const { category } = getShipTypeInfo(ship.shipType)
          ctx.fillStyle = colors[category]
          ctx.globalAlpha = shipPulseAlpha(ship.speed, timeSec)
          ctx.beginPath()
          ctx.arc(px, py, radius, 0, 2 * Math.PI)
          ctx.fill()
        }

        ctx.globalAlpha = 1.0
      }
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [size, loading])

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
