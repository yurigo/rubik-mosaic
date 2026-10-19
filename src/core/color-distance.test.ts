import test from 'node:test'
import assert from 'node:assert/strict'
import { COLOR_METHODS, hslCoordinates, linearToHsl, linearToOklab } from './color-distance.ts'
import { getLegoPalette, LEGO_PARTS } from './lego.ts'
import { PALETTE, quantize, sampleImage } from './mosaic.ts'

function close(actual: readonly number[], expected: readonly number[], tolerance = 1e-6) {
  actual.forEach((value, i) => assert.ok(Math.abs(value - expected[i]) < tolerance, `${actual} ≠ ${expected}`))
}

test('OKLab reference values for black, white and linear sRGB primaries', () => {
  close(linearToOklab([0, 0, 0]), [0, 0, 0])
  close(linearToOklab([1, 1, 1]), [1, 0, 0])
  close(linearToOklab([1, 0, 0]), [0.62795536, 0.22486306, 0.12584630])
  close(linearToOklab([0, 1, 0]), [0.86643961, -0.23388757, 0.17949848])
  close(linearToOklab([0, 0, 1]), [0.45201372, -0.03245698, -0.31152815])
})

test('HSL uses encoded sRGB; circular hue and neutral colors have no artificial seam', () => {
  close(linearToHsl([1, 0, 0]), [0, 1, 0.5])
  close(linearToHsl([0, 1, 0]), [1 / 3, 1, 0.5])
  close(linearToHsl([0, 0, 1]), [2 / 3, 1, 0.5])
  close(linearToHsl([0.21404114048223255, 0.21404114048223255, 0.21404114048223255]), [0, 0, 0.5])
  close(hslCoordinates([0, 1, 0.5]), hslCoordinates([1, 1, 0.5]))
  close(hslCoordinates([0.1, 0, 0.5]), hslCoordinates([0.9, 0, 0.5]))
  close(hslCoordinates([0.1, 1, 0]), hslCoordinates([0.9, 1, 0]))
  const a = hslCoordinates([359 / 360, 1, 0.5])
  const b = hslCoordinates([1 / 360, 1, 0.5])
  assert.ok(Math.hypot(...a.map((v, i) => v - b[i])) < 0.04)
})

test('RF-18: RGB preserves pre-selector results, both flat and dithered', () => {
  const samples = Float32Array.from([.1,.2,.3,.8,.8,.7,.4,.5,.7,.2,.6,.5,.9,.6,.1,.1,.1,.1,.9,.9,.9,.6,.1,.3,.3,.4,.5,.1,.8,.4,.8,.2,.1,.4,.4,.4])
  const expected = [
    ['B','W','B','G','Y','G','W','R','B','G','O','G'],
    ['B','W','B','G','Y','G','W','R','B','G','O','B'],
    ['B','W','B','G','Y','G','W','R','B','G','Y','B'],
  ]
  ;[0, 0.8, 1].forEach((strength, i) => {
    assert.deepEqual(quantize(samples, 4, 3, strength).pixels, expected[i])
    assert.deepEqual(quantize(samples, 4, 3, strength, PALETTE, 'rgb').pixels, expected[i])
  })
})

test('RF-18: all methods preserve exact Rubik/LEGO colors and respect selected subsets', () => {
  for (const palette of [PALETTE, ...LEGO_PARTS.map((part) => getLegoPalette(part.id))]) {
    const source = { width: palette.length, height: 1, data: new Uint8ClampedArray(palette.flatMap(({ hex }) => [...[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)), 255])) }
    const samples = sampleImage(source, { x: 0, y: 0, width: palette.length, height: 1 }, palette.length, 1)
    for (const { id: method } of COLOR_METHODS) {
      for (const strength of [0, 0.8, 1]) {
        assert.deepEqual(quantize(samples, palette.length, 1, strength, palette, method).pixels, palette.map((c) => c.id))
        const subset = palette.slice(0, 2)
        const mosaic = quantize(samples, palette.length, 1, strength, subset, method)
        assert.ok(mosaic.pixels.every((id) => subset.some((c) => c.id === id)))
        assert.deepEqual(mosaic, quantize(samples, palette.length, 1, strength, subset, method))
      }
      assert.throws(() => quantize(samples, palette.length, 1, 0, [], method), /Selecciona/)
    }
  }
})

test('RF-18: methods can change a near-white decision; invalid methods are rejected', () => {
  const samples = sampleImage({ width: 1, height: 1, data: new Uint8ClampedArray([234, 227, 185, 255]) }, { x: 0, y: 0, width: 1, height: 1 }, 1, 1)
  assert.deepEqual(quantize(samples, 1, 1, 0, PALETTE, 'rgb').pixels, ['Y'])
  assert.deepEqual(quantize(samples, 1, 1, 0, PALETTE, 'oklab').pixels, ['W'])
  // @ts-expect-error Check external callers at runtime as well as typed callers.
  assert.throws(() => quantize(samples, 1, 1, 0, PALETTE, 'unknown'), /método/)
})
