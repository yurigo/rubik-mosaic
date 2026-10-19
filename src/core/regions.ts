import type { Crop, PaletteColor, Raster } from './mosaic.ts'

export type Point = { x: number; y: number }
export type RegionMask = { width: number; height: number; data: Uint8Array }
export type RegionRule = { id: number; mask: RegionMask; colorId: string; tolerance: number }

/** A bounded analysis image; source coordinates remain authoritative. */
export function createRegionRaster(source: Raster): Raster {
  const scale = Math.min(1, 640 / Math.max(source.width, source.height))
  const width = Math.max(1, Math.round(source.width * scale))
  const height = Math.max(1, Math.round(source.height * scale))
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const sx = Math.min(source.width - 1, Math.floor((x + 0.5) * source.width / width))
    const sy = Math.min(source.height - 1, Math.floor((y + 0.5) * source.height / height))
    const from = (sy * source.width + sx) * 4
    const to = (y * width + x) * 4
    const alpha = source.data[from + 3] / 255
    for (let c = 0; c < 3; c++) data[to + c] = Math.round(source.data[from + c] * alpha + 255 * (1 - alpha))
    data[to + 3] = 255
  }
  return { width, height, data }
}

/** Four-connected fill against the seed color, not a drifting neighbor threshold. */
export function selectRegion(analysis: Raster, point: Point, tolerance: number): RegionMask {
  if (!Number.isFinite(tolerance) || tolerance < 0 || tolerance > 100 || ![point.x, point.y].every((v) => Number.isFinite(v) && v >= 0 && v < 1)) throw new Error('La selección de zona no es válida.')
  const { width, height, data } = analysis
  const seed = Math.floor(point.y * height) * width + Math.floor(point.x * width)
  const mask = new Uint8Array(width * height)
  const visited = new Uint8Array(mask.length)
  const queue = new Int32Array(mask.length)
  const limit = (tolerance / 100) ** 2 * 3 * 255 ** 2
  let next = 0
  let end = 1
  queue[0] = seed
  visited[seed] = 1
  while (next < end) {
    const at = queue[next++]
    const distance = [0, 1, 2].reduce((sum, c) => sum + (data[at * 4 + c] - data[seed * 4 + c]) ** 2, 0)
    if (distance > limit) continue
    mask[at] = 1
    const x = at % width
    const neighbors = [x > 0 ? at - 1 : -1, x + 1 < width ? at + 1 : -1, at - width, at + width]
    for (const neighbor of neighbors) {
      if (neighbor < 0 || neighbor >= mask.length || visited[neighbor]) continue
      visited[neighbor] = 1
      queue[end++] = neighbor
    }
  }
  return { width, height, data: mask }
}

/** Force cells whose area is at least half covered. Last active rule wins. */
export function projectRegions(rules: readonly RegionRule[], source: Pick<Raster, 'width' | 'height'>, crop: Crop, width: number, height: number, palette: readonly PaletteColor[]) {
  const colors = new Set(palette.map((color) => color.id))
  const forced: (string | undefined)[] = Array(width * height).fill(undefined)
  for (const rule of rules) {
    if (!colors.has(rule.colorId)) continue
    const mask = rule.mask
    const dx = crop.width / source.width * mask.width / width
    const dy = crop.height / source.height * mask.height / height
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const left = crop.x / source.width * mask.width + x * dx
      const top = crop.y / source.height * mask.height + y * dy
      const right = left + dx
      const bottom = top + dy
      let area = 0
      for (let sy = Math.max(0, Math.floor(top)); sy < Math.min(mask.height, Math.ceil(bottom)); sy++) {
        const wy = Math.min(bottom, sy + 1) - Math.max(top, sy)
        for (let sx = Math.max(0, Math.floor(left)); sx < Math.min(mask.width, Math.ceil(right)); sx++) {
          if (mask.data[sy * mask.width + sx]) area += wy * (Math.min(right, sx + 1) - Math.max(left, sx))
        }
      }
      if (area / (dx * dy) >= 0.5 - 1e-9) forced[y * width + x] = rule.colorId
    }
  }
  return forced
}
