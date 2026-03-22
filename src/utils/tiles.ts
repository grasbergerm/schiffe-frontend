/** Convert longitude to OSM tile X index at given zoom. */
export function lonToTileX(lon: number, zoom: number): number {
  return Math.floor((lon + 180) / 360 * (2 ** zoom))
}

/** Convert latitude to OSM tile Y index at given zoom. */
export function latToTileY(lat: number, zoom: number): number {
  const r = lat * Math.PI / 180
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * (2 ** zoom))
}
