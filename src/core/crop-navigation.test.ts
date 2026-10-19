import assert from 'node:assert/strict'
import test from 'node:test'
import { containedSize, navigateCrop } from './crop-navigation.ts'
import { getCrop } from './mosaic.ts'

const source = { width: 800, height: 600 }
const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} ≠ ${expected}`)
function resultCrop(next: ReturnType<typeof navigateCrop>, ratio = 1) { return getCrop(source.width, source.height, ratio, next.zoom, next.horizontal / 100, next.vertical / 100) }

test('zoom keeps the source point under the pointer when not at an edge', () => {
  const crop = getCrop(800, 600, 1, 1)
  const anchor = { x: .25, y: .7 }
  const next = navigateCrop(source, crop, 2, anchor, anchor)
  const output = resultCrop(next)
  near(crop.x + anchor.x * crop.width, output.x + anchor.x * output.width)
  near(crop.y + anchor.y * crop.height, output.y + anchor.y * output.height)
})
test('drag follows the finger, preserving resolution and aspect', () => {
  const crop = getCrop(800, 600, 2, 2)
  const next = navigateCrop(source, crop, 2, { x: .4, y: .4 }, { x: .5, y: .6 })
  const output = resultCrop(next, 2)
  near(output.x, crop.x - .1 * crop.width)
  near(output.y, crop.y - .2 * crop.height)
  near(output.width / output.height, 2)
})
test('pinch combines moving midpoint with anchored zoom', () => {
  const crop = getCrop(800, 600, 1, 2)
  const from = { x: .3, y: .4 }, to = { x: .6, y: .7 }
  const output = resultCrop(navigateCrop(source, crop, 3, from, to))
  near(crop.x + from.x * crop.width, output.x + to.x * output.width)
  near(crop.y + from.y * crop.height, output.y + to.y * output.height)
})
test('large drags and zoom stay within image and zoom limits', () => {
  const crop = getCrop(800, 600, 1, 2)
  for (const zoom of [.1, 100]) {
    for (const delta of [-100, 100]) {
      const next = navigateCrop(source, crop, zoom, { x: .5, y: .5 }, { x: delta, y: delta })
      const output = resultCrop(next)
      assert.ok(next.zoom >= 1 && next.zoom <= 4)
      assert.ok(output.x >= 0 && output.y >= 0)
      assert.ok(output.x + output.width <= 800 && output.y + output.height <= 600)
    }
  }
})
test('uncropped axis has a stable center without dividing by zero', () => {
  const crop = getCrop(800, 600, 1, 1)
  const next = navigateCrop(source, crop, 1, { x: .5, y: .5 }, { x: .7, y: .9 })
  near(next.vertical, 50)
  assert.ok(Number.isFinite(next.horizontal))
})

test('gesture surface fits the actual stage for wide, tall and square crops', () => {
  for (const stage of [{ width: 380, height: 340 }, { width: 300, height: 600 }, { width: 400, height: 400 }]) {
    for (const ratio of [.2, 1, 5]) {
      const image = containedSize(stage.width, stage.height, ratio)
      assert.ok(image.width <= stage.width && image.height <= stage.height)
      near(image.width / image.height, ratio)
      assert.ok(image.width === stage.width || image.height === stage.height)
    }
  }
})
