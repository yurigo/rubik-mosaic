import test from 'node:test'
import assert from 'node:assert/strict'
import { getCrop, getGeometry, PALETTE, quantize, sampleImage } from './mosaic.ts'
import type { Raster } from './mosaic.ts'

test('RF-02: geometry counts cubes and visible casillas separately', () => {
  assert.deepEqual(getGeometry(9, 3, 3), { columns: 3, rows: 3, width: 9, height: 9, used: 9, remaining: 0 })
  assert.equal(getGeometry(10, 3, 3).remaining, 1)
  assert.equal(getGeometry(12, 4, 3).width, 12)
  assert.equal(getGeometry(9, 1, 9).height, 27)
})

test('RF-02: reject invalid counts, overspending and excessive inventory', () => {
  for (const args of [[0, 1, 1], [9, -1, 3], [9, 1.5, 3], [9, 4, 3], [2501, 1, 1], [NaN, 1, 1]]) assert.throws(() => getGeometry(...args as [number, number, number]))
})

test('RF-03: aspect-preserving crop, zoom and positioning remain within the source', () => {
  assert.deepEqual(getCrop(200, 100, 1), { x: 50, y: 0, width: 100, height: 100 })
  assert.deepEqual(getCrop(200, 100, 1, 2, 1, 0), { x: 150, y: 0, width: 50, height: 50 })
  assert.equal(getCrop(100, 200, 2).width / getCrop(100, 200, 2).height, 2)
  assert.throws(() => getCrop(100, 100, 0))
  assert.throws(() => getCrop(100, 100, 1, 1, 2))
})

test('RF-04: area reduction combines source pixels with fractional overlap in linear light', () => {
  const source: Raster = { width: 2, height: 1, data: new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 255]) }
  assert.deepEqual([...sampleImage(source, { x: 0, y: 0, width: 2, height: 1 }, 1, 1)], [0.5, 0, 0.5])
  const samples = sampleImage(source, { x: 0.5, y: 0, width: 1.5, height: 1 }, 1, 1)
  assert.ok(Math.abs(samples[0] - 1 / 3) < 1e-6)
  assert.ok(Math.abs(samples[2] - 2 / 3) < 1e-6)
})

test('RF-01: transparency is composited over white before conversion', () => {
  const source: Raster = { width: 1, height: 1, data: new Uint8ClampedArray([0, 0, 0, 0]) }
  const samples = sampleImage(source, getCrop(1, 1, 1), 1, 1)
  assert.deepEqual([...samples], [1, 1, 1])
  assert.deepEqual(quantize(samples, 1, 1).pixels, ['W'])
})

test('RF-05: an exact palette image preserves every color with and without dithering', () => {
  const data = new Uint8ClampedArray(PALETTE.flatMap(({ hex }) => [...[1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)), 255]))
  const source = { width: 6, height: 1, data }
  const samples = sampleImage(source, getCrop(6, 1, 6), 6, 1)
  for (const strength of [0, 0.8, 1]) assert.deepEqual(quantize(samples, 6, 1, strength).pixels, PALETTE.map((color) => color.id))
})

test('RF-06: zero strength matches flat conversion; diffusion is deterministic and changes a gradient', () => {
  const width = 30
  const height = 3
  const samples = new Float32Array(width * height * 3)
  samples.forEach((_, index) => { samples[index] = (Math.floor(index / 3) % width) / (width - 1) })
  const flat = quantize(samples, width, height)
  assert.deepEqual(quantize(samples, width, height, 0), flat)
  const dithered = quantize(samples, width, height, 1)
  assert.deepEqual(dithered, quantize(samples, width, height, 1))
  assert.notDeepEqual(dithered.pixels, flat.pixels)
  assert.equal(dithered.pixels.length, width * height)
  assert.ok(dithered.pixels.every((id) => PALETTE.some((color) => color.id === id)))
  assert.ok(samples.every((value) => value >= 0 && value <= 1), 'the input is not mutated')
})

test('RF-12: invalid raster, crop, samples and intensity produce controlled errors', () => {
  const source: Raster = { width: 1, height: 1, data: new Uint8ClampedArray(4) }
  assert.throws(() => sampleImage({ ...source, data: new Uint8ClampedArray(0) }, getCrop(1, 1, 1), 1, 1))
  assert.throws(() => sampleImage(source, { x: 1, y: 0, width: 1, height: 1 }, 1, 1))
  assert.throws(() => quantize(new Float32Array([NaN, 0, 0]), 1, 1))
  assert.throws(() => quantize(new Float32Array(3), 1, 1, 2))
})
