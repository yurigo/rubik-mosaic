import test from 'node:test'
import assert from 'node:assert/strict'
import { cropWithin, linkedDimension, suggestLayout } from './layout.ts'
import { fitSelection, moveSelection, resizeSelection, validSelection } from './crop-editor.ts'
import type { Handle } from './crop-editor.ts'
import { navigateCrop } from './crop-navigation.ts'
import { projectRegions } from './regions.ts'

const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`)

test('RF-21: budget generates exact layouts where available, without exceeding stock', () => {
  assert.deepEqual(suggestLayout(9, 1, 2500), { columns: 3, rows: 3 })
  assert.deepEqual(suggestLayout(108, 4 / 3, 2500), { columns: 12, rows: 9 })
  assert.deepEqual(suggestLayout(1, 16 / 9, 2500), { columns: 1, rows: 1 })
  assert.deepEqual(suggestLayout(1024, 1, 22500), { columns: 32, rows: 32 })
  for (const n of [2, 7, 10, 97, 100, 2500, 22500]) for (const ratio of [.01, .75, 1, 16 / 9, 100]) {
    const layout = suggestLayout(n, ratio, 22500)
    assert.ok(Number.isInteger(layout.columns) && layout.columns > 0)
    assert.ok(Number.isInteger(layout.rows) && layout.rows > 0)
    assert.ok(layout.columns * layout.rows <= n)
    assert.deepEqual(layout, suggestLayout(n, ratio, 22500))
  }
})

test('RF-21: reject invalid budgets and proportions; linked dimensions round the other axis', () => {
  for (const n of [0, -1, 1.5, NaN, Infinity, 2501]) assert.throws(() => suggestLayout(n, 1, 2500))
  for (const ratio of [0, -1, NaN, Infinity]) assert.throws(() => suggestLayout(9, ratio, 2500))
  assert.equal(linkedDimension(12, 4 / 3, 'columns'), 9)
  assert.equal(linkedDimension(9, 4 / 3, 'rows'), 12)
  assert.equal(linkedDimension(1, 16 / 9, 'columns'), 1)
  assert.equal(linkedDimension(0, 1, 'columns'), undefined)
  assert.equal(linkedDimension(2.5, 1, 'rows'), undefined)
})

test('RF-20: free move/resize and ratio presets stay within the original image', () => {
  const image = { width: 800, height: 600 }
  const original = { x: 100, y: 100, width: 400, height: 300 }
  assert.deepEqual(moveSelection(original, 900, -900, image), { ...original, x: 400, y: 0 })
  const handles: Handle[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
  for (const ratio of [undefined, .5, 1, 4 / 3, 16 / 9]) {
    const rect = ratio ? fitSelection(original, ratio) : original
    for (const handle of handles) for (const point of [{ x: -500, y: -500 }, { x: 0, y: 0 }, { x: 350, y: 250 }, { x: 900, y: 900 }]) {
      const resized = resizeSelection(rect, handle, point, image, ratio)
      assert.ok(validSelection(resized, image), JSON.stringify({ rect, resized, handle, point, ratio }))
      if (ratio) near(resized.width / resized.height, ratio)
    }
  }
  assert.deepEqual(original, { x: 100, y: 100, width: 400, height: 300 })
  assert.equal(validSelection({ ...original, width: 0 }, image), false)
})

test('RF-20: crop preserves source coordinates and pan/zoom stays within the chosen selection', () => {
  const source = { width: 1000, height: 800 }
  const bounds = { x: 200, y: 150, width: 600, height: 450 }
  const crop = cropWithin(bounds, 4 / 3, 2)
  near(crop.x, 350); near(crop.y, 262.5)
  const anchor = { x: .25, y: .3 }
  const next = navigateCrop(source, crop, 3, anchor, anchor, bounds)
  const output = cropWithin(bounds, 4 / 3, next.zoom, next.horizontal / 100, next.vertical / 100)
  near(crop.x + anchor.x * crop.width, output.x + anchor.x * output.width)
  near(crop.y + anchor.y * crop.height, output.y + anchor.y * output.height)
  for (const delta of [-50, 50]) {
    const moved = navigateCrop(source, crop, 4, anchor, { x: delta, y: delta }, bounds)
    const result = cropWithin(bounds, 4 / 3, moved.zoom, moved.horizontal / 100, moved.vertical / 100)
    assert.ok(result.x >= bounds.x && result.y >= bounds.y)
    assert.ok(result.x + result.width <= bounds.x + bounds.width)
    assert.ok(result.y + result.height <= bounds.y + bounds.height)
  }
})

test('RF-20: source masks follow a custom crop and can be restored without rewriting them', () => {
  const rules = [{ id: 1, colorId: 'W', tolerance: 0, mask: { width: 4, height: 2, data: new Uint8Array([0,0,1,1,0,0,1,1]) } }]
  const source = { width: 800, height: 400 }
  const palette = [{ id: 'W', name: 'White', hex: '#ffffff' }]
  assert.deepEqual(projectRegions(rules, source, cropWithin({ x: 400, y: 0, width: 400, height: 400 }, 1), 2, 2, palette), ['W','W','W','W'])
  assert.deepEqual(projectRegions(rules, source, cropWithin({ x: 0, y: 0, width: 800, height: 400 }, 2), 4, 2, palette), [undefined,undefined,'W','W',undefined,undefined,'W','W'])
})
