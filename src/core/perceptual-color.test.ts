import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { deltaE2000Squared, linearToLab } from './color-distance.ts'
import { getLegoPalette, LEGO_PARTS } from './lego.ts'
import { quantize, sampleImage } from './mosaic.ts'

function patch(hex: string) {
  const data = new Uint8ClampedArray([...hex.slice(1).match(/../g)!.map(v => parseInt(v, 16)), 255])
  return sampleImage({ width: 1, height: 1, data }, { x: 0, y: 0, width: 1, height: 1 }, 1, 1)
}

test('CIELAB D65 conversion preserves neutral axis, black, white and sRGB red', () => {
  for (const v of [0, 0.01, 0.18, 0.5, 1]) {
    const [l, a, b] = linearToLab([v, v, v])
    assert.ok(l >= 0 && l <= 100.000001)
    assert.ok(Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10)
  }
  assert.equal(linearToLab([0, 0, 0])[0], 0)
  assert.ok(Math.abs(linearToLab([1, 1, 1])[0] - 100) < 1e-10)
  const red = linearToLab([1, 0, 0])
  ;[53.2371, 80.0901, 67.2033].forEach((v, i) => assert.ok(Math.abs(red[i] - v) < .0001))
})

test('CIEDE2000 matches all 34 published Sharma/Wu/Dalal pairs, both directions', () => {
  const rows = readFileSync(new URL('../../data/ciede2000-reference.txt', import.meta.url), 'utf8').split('\n').filter(row => row && !row.startsWith('#'))
  assert.equal(rows.length, 34)
  for (const [i, row] of rows.entries()) {
    const values = row.trim().split(/\s+/).map(Number)
    const a = values.slice(0, 3), b = values.slice(3, 6), expected = values[6]
    for (const [first, second] of [[a, b], [b, a]]) {
      const actual = Math.sqrt(deltaE2000Squared(first, second))
      assert.ok(Math.abs(actual - expected) < .00005, `pair ${i + 1}: ${actual} vs ${expected}`)
    }
    assert.equal(deltaE2000Squared(a, a), 0)
  }
})

test('both new methods keep teal and blue mountains together with Lechonk gray', () => {
  for (const part of LEGO_PARTS) for (const method of ['oklab-color', 'ciede2000'] as const) {
    const palette = getLegoPalette(part.id)
    for (const [hex, expected] of [['#167C7E', 'BL-39'], ['#11449A', 'BL-7'], ['#4E585C', palette.some(c => c.id === 'BL-10') ? 'BL-10' : 'BL-85']]) {
      assert.deepEqual(quantize(patch(hex), 1, 1, 0, palette, method).pixels, [expected], `${part.id} ${method} ${hex}`)
    }
  }
  // Keep the original methods reproducible; the experimental mode is opt-in.
  assert.deepEqual(quantize(patch('#167C7E'), 1, 1, 0, getLegoPalette('3024'), 'oklab').pixels, ['BL-85'])
  assert.deepEqual(quantize(patch('#11449A'), 1, 1, 0, getLegoPalette('3024'), 'rgb').pixels, ['BL-89'])
})

test('CIEDE2000 keeps neutral ramps gray without dithering', () => {
  const grays = new Set(['BL-11', 'BL-1', 'BL-9', 'BL-10', 'BL-49', 'BL-85', 'BL-86'])
  for (const part of LEGO_PARTS) {
    for (let value = 40; value <= 240; value += 10) {
      const hex = '#' + value.toString(16).padStart(2, '0').repeat(3)
      const id = quantize(patch(hex), 1, 1, 0, getLegoPalette(part.id), 'ciede2000').pixels[0]
      assert.ok(grays.has(id), `${part.id} ${hex}: ${id}`)
    }
  }
})
