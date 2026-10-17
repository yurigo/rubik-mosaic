export const PALETTE = [
  { id: 'R', name: 'Rojo', hex: '#C41E3A' },
  { id: 'G', name: 'Verde', hex: '#009E60' },
  { id: 'Y', name: 'Amarillo', hex: '#FFD500' },
  { id: 'B', name: 'Azul', hex: '#0051BA' },
  { id: 'W', name: 'Blanco', hex: '#FFFFFF' },
  { id: 'O', name: 'Naranja', hex: '#FF5800' },
] as const

export type ColorId = (typeof PALETTE)[number]['id']
export type Raster = { width: number; height: number; data: Uint8ClampedArray<ArrayBuffer> }
export type Crop = { x: number; y: number; width: number; height: number }
export type Geometry = { columns: number; rows: number; width: number; height: number; used: number; remaining: number }
export type Mosaic = { width: number; height: number; pixels: ColorId[] }

const linear = Array.from({ length: 256 }, (_, value) => {
  const s = value / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
})
const paletteRgb = PALETTE.map(({ hex }) => [1, 3, 5].map((start) => linear[parseInt(hex.slice(start, start + 2), 16)]))

export function getGeometry(available: number, columns: number, rows: number): Geometry {
  if (![available, columns, rows].every((n) => Number.isInteger(n) && n > 0)) {
    throw new Error('Introduce números enteros mayores que cero.')
  }
  if (available > 2500) throw new Error('Esta versión admite hasta 2.500 cubos.')
  const used = columns * rows
  if (used > available) throw new Error(`Esta disposición necesita ${used} cubos; tienes ${available}.`)
  return { columns, rows, width: columns * 3, height: rows * 3, used, remaining: available - used }
}

export function getCrop(width: number, height: number, ratio: number, zoom = 1, x = 0.5, y = 0.5): Crop {
  if (![width, height, ratio, zoom].every((n) => Number.isFinite(n) && n > 0) || zoom < 1 || ![x, y].every((n) => Number.isFinite(n) && n >= 0 && n <= 1)) {
    throw new Error('El recorte no es válido.')
  }
  const cropWidth = Math.min(width, height * ratio) / zoom
  const cropHeight = cropWidth / ratio
  return { x: (width - cropWidth) * x, y: (height - cropHeight) * y, width: cropWidth, height: cropHeight }
}

/** Area-weighted reduction into linear RGB. Alpha is composited over white. */
export function sampleImage(source: Raster, crop: Crop, width: number, height: number): Float32Array {
  if (!Number.isInteger(source.width) || !Number.isInteger(source.height) || source.width < 1 || source.height < 1 || source.data.length !== source.width * source.height * 4) throw new Error('Los datos de imagen no son válidos.')
  if (![width, height].every((n) => Number.isInteger(n) && n > 0) || width * height > 22500) throw new Error('La resolución no es válida.')
  if (![crop.x, crop.y, crop.width, crop.height].every(Number.isFinite) || crop.x < 0 || crop.y < 0 || crop.width <= 0 || crop.height <= 0 || crop.x + crop.width > source.width + 1e-6 || crop.y + crop.height > source.height + 1e-6) throw new Error('El recorte está fuera de la imagen.')
  const output = new Float32Array(width * height * 3)
  const dx = crop.width / width
  const dy = crop.height / height
  for (let row = 0; row < height; row++) {
    const top = crop.y + row * dy
    const bottom = top + dy
    for (let col = 0; col < width; col++) {
      const left = crop.x + col * dx
      const right = left + dx
      const out = (row * width + col) * 3
      for (let sy = Math.floor(top); sy < Math.min(source.height, Math.ceil(bottom)); sy++) {
        const wy = Math.min(bottom, sy + 1) - Math.max(top, sy)
        for (let sx = Math.floor(left); sx < Math.min(source.width, Math.ceil(right)); sx++) {
          const weight = wy * (Math.min(right, sx + 1) - Math.max(left, sx)) / (dx * dy)
          const index = (sy * source.width + sx) * 4
          const alpha = source.data[index + 3] / 255
          for (let channel = 0; channel < 3; channel++) {
            // Composite in sRGB, matching the browser preview, then linearize.
            const value = Math.round(source.data[index + channel] * alpha + 255 * (1 - alpha))
            output[out + channel] += linear[value] * weight
          }
        }
      }
    }
  }
  return output
}

export function quantize(samples: Float32Array, width: number, height: number, strength = 0): Mosaic {
  if (![width, height].every((n) => Number.isInteger(n) && n > 0) || width * height > 22500 || samples.length !== width * height * 3 || !samples.every(Number.isFinite)) throw new Error('La matriz de color no es válida.')
  if (!Number.isFinite(strength) || strength < 0 || strength > 1) throw new Error('La intensidad debe estar entre 0 y 1.')
  const work = new Float32Array(samples)
  const pixels: ColorId[] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 3
      // Clip only when visiting a sample; errors remain unbounded until then.
      const rgb = [0, 1, 2].map((channel) => Math.max(0, Math.min(1, work[index + channel])))
      let nearest = 0
      let distance = Infinity
      paletteRgb.forEach((color, candidate) => {
        const d = color.reduce((sum, v, channel) => sum + (v - rgb[channel]) ** 2, 0)
        if (d < distance) { distance = d; nearest = candidate }
      })
      pixels.push(PALETTE[nearest].id)
      if (strength === 0) continue
      for (const [nx, ny, weight] of [[x + 1, y, 7 / 16], [x - 1, y + 1, 3 / 16], [x, y + 1, 5 / 16], [x + 1, y + 1, 1 / 16]]) {
        if (nx < 0 || nx >= width || ny >= height) continue
        for (let channel = 0; channel < 3; channel++) work[(ny * width + nx) * 3 + channel] += (rgb[channel] - paletteRgb[nearest][channel]) * weight * strength
      }
    }
  }
  return { width, height, pixels }
}
