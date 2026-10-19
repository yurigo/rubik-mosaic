import test from 'node:test'
import assert from 'node:assert/strict'
import { LEGO_COLORS, LEGO_PARTS, getLegoPalette } from './lego.ts'
import { quantize, sampleImage } from './mosaic.ts'

function patch(rgb: number[]) {
  return sampleImage({ width: 1, height: 1, data: new Uint8ClampedArray([...rgb, 255]) }, { x: 0, y: 0, width: 1, height: 1 }, 1, 1)
}

test('RGB audit: numerical VALUE references keep historical grays and catalog IDs distinct', () => {
  const byId = (id: number) => LEGO_COLORS.find((c) => c.bricklinkId === id)!
  assert.deepEqual([byId(10).ldrawCode, byId(10).hex], [8, '#545955'])
  assert.deepEqual([byId(85).ldrawCode, byId(85).hex], [72, '#646464'])
  assert.deepEqual([byId(11).ldrawCode, byId(11).hex], [0, '#1B2A34'])
  assert.equal(byId(174).ldrawCode, 431, 'Blue Violet 2026 is not LDraw 89')
  assert.equal(byId(56).ldrawCode, 10017, 'Rose is not the unreleased Light Pink 77')
  assert.equal(byId(175).ldrawCode, 430)
  assert.equal(new Set(LEGO_COLORS.map((c) => c.ldrawCode)).size, 55)
})

test('RGB audit: neutral gray and dominant opaque PNG body samples select gray without file-dependent filters', () => {
  const grays = new Set(['BL-9', 'BL-10', 'BL-49', 'BL-85', 'BL-86'])
  // Actual opaque RGB triplets from the locally decoded PNG; the image is not bundled in the repo.
  const samples = [[80,80,80], [78,88,92], [77,87,91], [77,88,92], [77,88,91], [78,89,93], [88,97,101]]
  for (const part of LEGO_PARTS) for (const method of ['rgb', 'oklab', 'hsl'] as const) {
    for (const rgb of samples) {
      const chosen = quantize(patch(rgb), 1, 1, 0, getLegoPalette(part.id), method).pixels[0]
      assert.ok(grays.has(chosen), `${part.id} ${method} ${rgb} chose ${chosen}`)
    }
  }
})

test('RGB audit: a gray ramp avoids a dominant green cast, with and without diffusion', () => {
  const width = 64, height = 4
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    const value = Math.round(80 + (i % width) / (width - 1) * 128)
    data.set([value, value, value, 255], i * 4)
  }
  const samples = sampleImage({ width, height, data }, { x: 0, y: 0, width, height }, width, height)
  const saturatedGreens = new Set(['BL-6', 'BL-36', 'BL-80'])
  for (const part of LEGO_PARTS) for (const method of ['rgb', 'oklab', 'hsl'] as const) for (const strength of [0, .8, 1]) {
    const result = quantize(samples, width, height, strength, getLegoPalette(part.id), method)
    const greenCount = result.pixels.filter((id) => saturatedGreens.has(id)).length
    // Diffusion can use sparse chromatic cells to compensate non-neutral swatches.
    assert.ok(greenCount <= (strength === 0 ? 0 : result.pixels.length * .05), `${part.id} ${method} ${strength}: ${greenCount}`)
  }
})
