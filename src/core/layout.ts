import { getCrop } from './mosaic.ts'
import type { Crop } from './mosaic.ts'

/** Fit a rectangle without stretching, inside a non-destructive source selection. */
export function cropWithin(bounds: Crop, ratio: number, zoom = 1, x = 0.5, y = 0.5): Crop {
  const crop = getCrop(bounds.width, bounds.height, ratio, zoom, x, y)
  return { ...crop, x: bounds.x + crop.x, y: bounds.y + crop.y }
}

/** All feasible integer rectangles, balancing relative aspect error and unused pieces. */
export function suggestLayout(available: number, ratio: number, limit: number) {
  if (!Number.isInteger(available) || available < 1 || available > limit) throw new Error(`Introduce entre 1 y ${limit.toLocaleString('es-ES')} piezas enteras.`)
  if (!Number.isFinite(ratio) || ratio <= 0) throw new Error('La proporción no es válida.')
  let best = { columns: 1, rows: 1 }
  let score = Infinity
  for (let columns = 1; columns <= available; columns++) {
    for (let rows = 1; rows <= Math.floor(available / columns); rows++) {
      const used = columns * rows
      const candidate = Math.log(columns / rows / ratio) ** 2 + 0.15 * (1 - used / available) ** 2
      if (candidate < score - 1e-12 || (Math.abs(candidate - score) <= 1e-12 && used > best.columns * best.rows)) {
        score = candidate
        best = { columns, rows }
      }
    }
  }
  return best
}

export function linkedDimension(value: number, ratio: number, axis: 'columns' | 'rows') {
  if (!Number.isInteger(value) || value < 1 || !Number.isFinite(ratio) || ratio <= 0) return undefined
  return Math.max(1, Math.round(axis === 'columns' ? value / ratio : value * ratio))
}
