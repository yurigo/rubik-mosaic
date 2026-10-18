export const COLOR_METHODS = [
  { id: 'rgb', name: 'RGB lineal', description: 'Comparación original de canales RGB lineales.' },
  { id: 'oklab', name: 'OKLab', description: 'Compara luminosidad y color con una distancia perceptual.' },
  { id: 'hsl', name: 'HSL · experimental', description: 'Explora tono, saturación y luminosidad. No es una distancia perceptual.' },
] as const
export type ColorMethod = (typeof COLOR_METHODS)[number]['id']

/** Linear sRGB → OKLab. Björn Ottosson, public-domain matrices (2021-01-25).
 * https://bottosson.github.io/posts/oklab/#converting-from-linear-srgb-to-oklab
 */
export function linearToOklab([r, g, b]: readonly number[]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

/** HSL is defined on encoded sRGB, not linear RGB. Hue is in turns [0, 1). */
export function linearToHsl(rgb: readonly number[]) {
  const [r, g, b] = rgb.map((v) => v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const lightness = (max + min) / 2
  if (delta < 1e-12) return [0, 0, lightness]
  const saturation = delta / (1 - Math.abs(2 * lightness - 1))
  const hue = max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  return [((hue / 6) % 1 + 1) % 1, saturation, lightness]
}

/** Experimental HSL embedding: circular hue, with chroma suppressing hue near neutrals. */
export function hslCoordinates([h, s, l]: readonly number[]) {
  const chroma = (1 - Math.abs(2 * l - 1)) * s
  return [chroma * Math.cos(h * 2 * Math.PI), chroma * Math.sin(h * 2 * Math.PI), l]
}

export function comparisonCoordinates(rgb: readonly number[], method: ColorMethod): readonly number[] {
  if (method === 'oklab') return linearToOklab(rgb)
  if (method === 'hsl') return hslCoordinates(linearToHsl(rgb))
  return rgb
}
