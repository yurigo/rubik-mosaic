import type { Crop } from './mosaic.ts'
export type Handle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
const clamp = (v: number, low: number, high: number) => Math.max(low, Math.min(high, v))
export function validSelection(rect: Crop, image: { width: number; height: number }) {
  return [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) && rect.x >= 0 && rect.y >= 0 && rect.width > 0 && rect.height > 0 && rect.x + rect.width <= image.width + 1e-6 && rect.y + rect.height <= image.height + 1e-6
}
export function moveSelection(rect: Crop, dx: number, dy: number, image: { width: number; height: number }): Crop {
  return { ...rect, x: clamp(rect.x + dx, 0, image.width - rect.width), y: clamp(rect.y + dy, 0, image.height - rect.height) }
}
export function fitSelection(rect: Crop, ratio: number): Crop {
  const width = Math.min(rect.width, rect.height * ratio)
  const height = width / ratio
  return { x: rect.x + (rect.width - width) / 2, y: rect.y + (rect.height - height) / 2, width, height }
}

/** Resize with the opposite edge/corner anchored; locked edges keep the other axis centered. */
export function resizeSelection(rect: Crop, handle: Handle, point: { x: number; y: number }, image: { width: number; height: number }, ratio?: number): Crop {
  const west = handle.includes('w'), east = handle.includes('e'), north = handle.includes('n'), south = handle.includes('s')
  if (!ratio) {
    const left = west ? clamp(point.x, 0, rect.x + rect.width - Math.min(1, rect.width)) : rect.x
    const right = east ? clamp(point.x, rect.x + Math.min(1, rect.width), image.width) : rect.x + rect.width
    const top = north ? clamp(point.y, 0, rect.y + rect.height - Math.min(1, rect.height)) : rect.y
    const bottom = south ? clamp(point.y, rect.y + Math.min(1, rect.height), image.height) : rect.y + rect.height
    return { x: left, y: top, width: right - left, height: bottom - top }
  }
  const ax = west ? rect.x + rect.width : east ? rect.x : rect.x + rect.width / 2
  const ay = north ? rect.y + rect.height : south ? rect.y : rect.y + rect.height / 2
  const maxWidth = west ? ax : east ? image.width - ax : 2 * Math.min(ax, image.width - ax)
  const maxHeight = north ? ay : south ? image.height - ay : 2 * Math.min(ay, image.height - ay)
  const xWidth = west ? ax - point.x : point.x - ax
  const yWidth = (north ? ay - point.y : point.y - ay) * ratio
  const desired = !(west || east) ? yWidth : !(north || south) ? xWidth : Math.abs(xWidth - rect.width) > Math.abs(yWidth - rect.width) ? xWidth : yWidth
  const maximum = Math.min(maxWidth, maxHeight * ratio)
  const width = clamp(desired, Math.min(Math.max(1, ratio), maximum), maximum)
  const height = width / ratio
  return { x: west ? ax - width : east ? ax : ax - width / 2, y: north ? ay - height : south ? ay : ay - height / 2, width, height }
}
