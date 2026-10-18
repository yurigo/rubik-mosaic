import test from 'node:test'
import assert from 'node:assert/strict'
import { createRegionRaster, projectRegions, selectRegion } from './regions.ts'
import type { RegionRule } from './regions.ts'
import { getCrop, quantize } from './mosaic.ts'

function raster(values: number[], width = values.length) {
  return { width, height: values.length / width, data: new Uint8ClampedArray(values.flatMap(v => [v, v, v, 255])) }
}
const blackWhite = [{ id: 'black', name: 'Negro', hex: '#000000' }, { id: 'white', name: 'Blanco', hex: '#ffffff' }]
const rule = (data: number[], width: number, colorId = 'white', id = 1): RegionRule => ({ id, colorId, tolerance: 0, mask: { width, height: data.length / width, data: new Uint8Array(data) } })

test('RF-19: flood fill selects only connected seed-similar pixels, without diagonal links or color drift', () => {
  const source = raster([10, 20, 30, 40, 10])
  assert.deepEqual([...selectRegion(source, { x: 0, y: 0 }, 5).data], [1, 1, 0, 0, 0])
  assert.deepEqual([...selectRegion(raster([10, 255, 255, 10], 2), { x: 0, y: 0 }, 0).data], [1, 0, 0, 0])
  assert.throws(() => selectRegion(source, { x: 1, y: 0 }, 5))
  assert.throws(() => selectRegion(source, { x: 0, y: 0 }, -1))
})

test('RF-19: analysis is bounded and transparency matches the original white background', () => {
  const analysis = createRegionRaster({ width: 1280, height: 2, data: new Uint8ClampedArray(1280 * 2 * 4) })
  assert.equal(analysis.width, 640)
  assert.equal(analysis.height, 1)
  assert.equal(analysis.data.length, 640 * 4)
  assert.ok(analysis.data.every(v => v === 255))
})

test('RF-19: masks follow source coordinates through crop and resolution changes', () => {
  const source = { width: 4, height: 1 }
  const rules = [rule([0, 0, 1, 1], 4)]
  assert.deepEqual(projectRegions(rules, source, getCrop(4, 1, 4), 4, 1, blackWhite), [undefined, undefined, 'white', 'white'])
  assert.deepEqual(projectRegions(rules, source, { x: 2, y: 0, width: 2, height: 1 }, 2, 1, blackWhite), ['white', 'white'])
  assert.deepEqual(projectRegions(rules, source, { x: 0, y: 0, width: 2, height: 1 }, 2, 1, blackWhite), [undefined, undefined])
  assert.deepEqual(projectRegions(rules, source, getCrop(4, 1, 4), 2, 1, blackWhite), [undefined, 'white'])
})

test('RF-19: area threshold handles fractional crop and avoids forcing tiny details', () => {
  const source = { width: 4, height: 1 }
  const rules = [rule([0, 1, 0, 0], 4)]
  assert.deepEqual(projectRegions(rules, source, { x: .5, y: 0, width: 2, height: 1 }, 1, 1, blackWhite), ['white'])
  assert.deepEqual(projectRegions(rules, source, getCrop(4, 1, 4), 1, 1, blackWhite), [undefined])
})

test('RF-19: last active rule wins, missing colors suspend rules without mutating them', () => {
  const rules = [rule([1, 1], 2), rule([0, 1], 2, 'black', 2)]
  const source = { width: 2, height: 1 }
  const crop = getCrop(2, 1, 2)
  assert.deepEqual(projectRegions(rules, source, crop, 2, 1, blackWhite), ['white', 'black'])
  assert.deepEqual(projectRegions(rules, source, crop, 2, 1, [blackWhite[0]]), [undefined, 'black'])
  assert.deepEqual(projectRegions(rules, source, crop, 2, 1, blackWhite), ['white', 'black'])
  assert.equal(rules.length, 2)
})

test('RF-19: all methods respect forced colors; imposed colors do not diffuse errors to neighbors', () => {
  const samples = new Float32Array([1, 1, 1, .8, .8, .8, .4, .4, .4])
  for (const method of ['rgb', 'oklab', 'hsl'] as const) for (const strength of [0, .8, 1]) {
    const result = quantize(samples, 3, 1, strength, blackWhite, method, [undefined, 'black', undefined])
    assert.equal(result.pixels[1], 'black')
    assert.equal(result.pixels[2], quantize(samples.slice(6), 1, 1, 0, blackWhite, method).pixels[0])
  }
  assert.throws(() => quantize(samples, 3, 1, 1, blackWhite, 'rgb', ['missing', undefined, undefined]))
  assert.throws(() => quantize(samples, 3, 1, 1, blackWhite, 'rgb', []))
  assert.equal(samples[3], Math.fround(.8))
})
