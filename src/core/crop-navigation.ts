import { getCrop } from './mosaic.ts'
import type { Crop } from './mosaic.ts'

export type CropPosition = { zoom: number; horizontal: number; vertical: number }
export type Point = { x: number; y: number }
export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value))

/** Keep the source point at `from` under `to`; points are relative to the viewport. */
export function navigateCrop(source: { width: number; height: number }, crop: Crop, zoom: number, from: Point, to: Point, bounds: Crop = { x: 0, y: 0, ...source }): CropPosition {
  const nextZoom = clamp(zoom, 1, 4)
  const next = getCrop(bounds.width, bounds.height, crop.width / crop.height, nextZoom)
  const x = crop.x + from.x * crop.width - to.x * next.width
  const y = crop.y + from.y * crop.height - to.y * next.height
  return {
    zoom: nextZoom,
    horizontal: bounds.width > next.width ? 100 * clamp((x - bounds.x) / (bounds.width - next.width)) : 50,
    vertical: bounds.height > next.height ? 100 * clamp((y - bounds.y) / (bounds.height - next.height)) : 50,
  }
}

/** Image dimensions contained inside an actual stage, including non-square mobile stages. */
export function containedSize(width: number, height: number, ratio: number) {
  const imageWidth = Math.min(width, height * ratio)
  return { width: imageWidth, height: imageWidth / ratio }
}
