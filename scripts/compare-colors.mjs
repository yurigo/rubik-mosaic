// Offline, deterministic palette comparison. No personal images or network calls.
import { readFileSync } from 'node:fs'
import { COLOR_METHODS } from '../src/core/color-distance.ts'
import { getLegoPalette, LEGO_PARTS } from '../src/core/lego.ts'
import { PALETTE, quantize, sampleImage } from '../src/core/mosaic.ts'

const cases = JSON.parse(readFileSync(new URL('../data/color-cases.json', import.meta.url), 'utf8'))
const palettes = [{ name: 'Rubik', colors: PALETTE }, ...LEGO_PARTS.map(part => ({ name: part.id, colors: getLegoPalette(part.id) }))]
console.log('| Paleta | Muestra | Original | ' + COLOR_METHODS.map(m => m.name).join(' | ') + ' |')
console.log('|---|---|---|' + COLOR_METHODS.map(() => '---|').join(''))
for (const palette of palettes) for (const sample of cases) {
  const data = new Uint8ClampedArray([...sample.hex.slice(1).match(/../g).map(v => parseInt(v, 16)), 255])
  const values = sampleImage({ width: 1, height: 1, data }, { x: 0, y: 0, width: 1, height: 1 }, 1, 1)
  const results = COLOR_METHODS.map(method => {
    const id = quantize(values, 1, 1, 0, palette.colors, method.id).pixels[0]
    const color = palette.colors.find(c => c.id === id)
    return `${color.name} (${id}, ${color.hex})`
  })
  console.log(`| ${palette.name} | ${sample.name} | ${sample.hex} | ${results.join(' | ')} |`)
}
