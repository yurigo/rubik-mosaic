import test from 'node:test'
import assert from 'node:assert/strict'
import { getLegoPalette, LEGO_PARTS } from './lego.ts'
import { countColors, getLegoGeometry, quantize, sampleImage } from './mosaic.ts'

test('RF-14: each piece has its own solid palette with stable BrickLink IDs', () => {
  assert.deepEqual(LEGO_PARTS.map((part) => getLegoPalette(part.id).length), [54, 52, 42])
  for (const part of LEGO_PARTS) {
    const palette = getLegoPalette(part.id)
    assert.equal(new Set(palette.map((color) => color.id)).size, palette.length)
    assert.ok(palette.every((color) => color.id === `BL-${color.bricklinkId}` && /^#[0-9A-F]{6}$/.test(color.hex)))
  }
  assert.ok(getLegoPalette('3070').some((color) => color.name === 'Purple'))
  assert.ok(!getLegoPalette('3024').some((color) => color.name === 'Purple'))
  assert.ok(!getLegoPalette('98138').some((color) => color.name === 'Sand Green'))
})

test('RF-15: LEGO dimensions count individual pixels, including rectangles and limits', () => {
  assert.deepEqual(getLegoGeometry(3, 3), { columns: 3, rows: 3, width: 3, height: 3, used: 9, remaining: 0 })
  assert.equal(getLegoGeometry(32, 48).used, 1536)
  assert.equal(getLegoGeometry(150, 150).used, 22500)
  for (const [width, height] of [[0, 3], [3, -1], [1.5, 3], [NaN, 1], [151, 150], [Infinity, 1]]) assert.throws(() => getLegoGeometry(width, height))
})

test('RF-16: quantization and dithering use only the selected subset, without mutating input', () => {
  const palette = getLegoPalette('3024').filter((color) => ['Black', 'White'].includes(color.name))
  const samples = Float32Array.from({ length: 48 * 3 }, (_, index) => (Math.floor(index / 3) % 16) / 15)
  const original = new Float32Array(samples)
  for (const strength of [0, 0.8, 1]) {
    const mosaic = quantize(samples, 16, 3, strength, palette)
    assert.ok(mosaic.pixels.every((id) => palette.some((color) => color.id === id)))
    assert.deepEqual(mosaic, quantize(samples, 16, 3, strength, palette))
    assert.equal(Object.values(countColors(mosaic)).reduce((sum, n) => sum + n, 0), 48)
  }
  assert.deepEqual(samples, original)
  assert.throws(() => quantize(samples, 16, 3, 0, []), /Selecciona/)
  assert.throws(() => quantize(samples, 16, 3, 0, [{ id: 'x', name: 'bad', hex: 'oops' }]), /paleta/)
  assert.throws(() => quantize(samples, 16, 3, 0, [palette[0], palette[0]]), /paleta/)
  assert.deepEqual(countColors(quantize(samples, 16, 3, 1, palette.slice(0, 1))), { [palette[0].id]: 48 })
})

test('RF-16: all LEGO swatches survive exact-color sampling with and without diffusion', () => {
  for (const part of LEGO_PARTS) {
    const palette = getLegoPalette(part.id)
    const data = new Uint8ClampedArray(palette.flatMap(({ hex }) => [...[1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)), 255]))
    const source = { width: palette.length, height: 1, data }
    const samples = sampleImage(source, { x: 0, y: 0, width: palette.length, height: 1 }, palette.length, 1)
    for (const strength of [0, 1]) assert.deepEqual(quantize(samples, palette.length, 1, strength, palette).pixels, palette.map((color) => color.id))
  }
})
