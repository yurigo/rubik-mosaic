export const COLOR_METHODS = [
  { id: 'rgb', name: 'RGB lineal', description: 'Comparación original de canales RGB lineales.' },
  { id: 'oklab', name: 'OKLab', description: 'Compara luminosidad y color con una distancia perceptual.' },
  { id: 'oklab-color', name: 'OKLab · conservar color', description: 'Experimental: prioriza el color sobre la luminosidad. Puede cambiar el brillo y teñir algunos grises claros.' },
  { id: 'ciede2000', name: 'CIELAB · CIEDE2000', description: 'Compara diferencias perceptuales con CIEDE2000. No garantiza conservar el tono de cada objeto.' },
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
  if (method === 'oklab-color') {
    const [l, a, b] = linearToOklab(rgb)
    // Deliberate artistic preference, not standard ΔEOK: 0.25 ΔL² + Δa² + Δb².
    return [l * 0.5, a, b]
  }
  if (method === 'ciede2000') return linearToLab(rgb)
  if (method === 'hsl') return hslCoordinates(linearToHsl(rgb))
  return rgb
}

/** Linear sRGB → XYZ → CIELAB, D65 white throughout (no D50 adaptation).
 * sRGB matrix and CIELAB equations: https://www.w3.org/TR/css-color-4/#color-conversion-code
 */
export function linearToLab([r, g, b]: readonly number[]) {
  const x = (0.4123907992659595 * r + 0.357584339383878 * g + 0.1804807884018343 * b) / (0.3127 / 0.329)
  const y = 0.2126390058715104 * r + 0.715168678767756 * g + 0.0721923153607337 * b
  const z = (0.0193308187155919 * r + 0.119194779794626 * g + 0.9505321522496606 * b) / ((1 - 0.3127 - 0.329) / 0.329)
  const f = (v: number) => v > 216 / 24389 ? Math.cbrt(v) : ((24389 / 27) * v + 16) / 116
  const [fx, fy, fz] = [x, y, z].map(f)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

/** CIEDE2000, kL=kC=kH=1. Returns squared ΔE00 for nearest-color comparisons.
 * Sharma, Wu & Dalal (2005): https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/
 */
export function deltaE2000Squared([l1, a1, b1]: readonly number[], [l2, a2, b2]: readonly number[]) {
  const radians = Math.PI / 180
  const cos = (degrees: number) => Math.cos(degrees * radians)
  const sin = (degrees: number) => Math.sin(degrees * radians)
  const cMean = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2
  const g = 0.5 * (1 - Math.sqrt(cMean ** 7 / (cMean ** 7 + 25 ** 7)))
  const ap1 = (1 + g) * a1, ap2 = (1 + g) * a2
  const c1 = Math.hypot(ap1, b1), c2 = Math.hypot(ap2, b2)
  const hue = (a: number, b: number) => a === 0 && b === 0 ? 0 : (Math.atan2(b, a) / radians + 360) % 360
  const h1 = hue(ap1, b1), h2 = hue(ap2, b2)
  const dl = l2 - l1, dc = c2 - c1
  let dh = h2 - h1
  if (c1 * c2 === 0) dh = 0
  else if (dh > 180) dh -= 360
  else if (dh < -180) dh += 360
  const dH = 2 * Math.sqrt(c1 * c2) * sin(dh / 2)
  const l = (l1 + l2) / 2, c = (c1 + c2) / 2
  let h = (h1 + h2) / 2
  if (c1 * c2 === 0) h = h1 + h2
  else if (Math.abs(h1 - h2) > 180) h += h1 + h2 < 360 ? 180 : -180
  const t = 1 - 0.17 * cos(h - 30) + 0.24 * cos(2 * h) + 0.32 * cos(3 * h + 6) - 0.20 * cos(4 * h - 63)
  const sl = 1 + 0.015 * (l - 50) ** 2 / Math.sqrt(20 + (l - 50) ** 2)
  const sc = 1 + 0.045 * c, sh = 1 + 0.015 * c * t
  const rt = -2 * Math.sqrt(c ** 7 / (c ** 7 + 25 ** 7)) * sin(60 * Math.exp(-(((h - 275) / 25) ** 2)))
  const lightness = dl / sl, chroma = dc / sc, hueDifference = dH / sh
  return lightness ** 2 + chroma ** 2 + hueDifference ** 2 + rt * chroma * hueDifference
}

export function colorDistanceSquared(a: readonly number[], b: readonly number[], method: ColorMethod) {
  return method === 'ciede2000' ? deltaE2000Squared(a, b) : a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0)
}
