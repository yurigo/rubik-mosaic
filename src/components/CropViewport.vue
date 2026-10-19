<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import type { Crop, Raster } from '../core/mosaic'
import { clamp, containedSize, navigateCrop } from '../core/crop-navigation'
import type { Point } from '../core/crop-navigation'

const props = defineProps<{ source: Raster; crop: Crop; zoom: number; horizontal: number; vertical: number; disabled?: boolean }>()
const emit = defineEmits<{ 'update:zoom': [value: number]; 'update:horizontal': [value: number]; 'update:vertical': [value: number]; reset: [] }>()
const stage = ref<HTMLElement>()
const stageSize = ref({ width: 0, height: 0 })
const surface = ref<HTMLElement>()
let resizeObserver: ResizeObserver | undefined
const dragging = ref(false)
const hintId = useId()
const ratio = computed(() => props.crop.width / props.crop.height)
const surfaceStyle = computed(() => {
  const size = containedSize(stageSize.value.width, stageSize.value.height, ratio.value)
  return { width: `${size.width}px`, height: `${size.height}px` }
})
const pointers = new Map<number, Point>()
let start: { crop: Crop; zoom: number; center: Point; distance: number } | undefined

function point(event: { clientX: number; clientY: number }): Point {
  const box = surface.value!.getBoundingClientRect()
  return { x: (event.clientX - box.left) / box.width, y: (event.clientY - box.top) / box.height }
}
function gesture() {
  const points = [...pointers.values()].slice(0, 2)
  const a = points[0]!
  const b = points[1] ?? a
  // Distance in CSS pixels: normalized coordinates alone distort non-square crops.
  const box = surface.value!.getBoundingClientRect()
  return { center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, distance: Math.hypot((a.x - b.x) * box.width, (a.y - b.y) * box.height) }
}
function rebase() {
  start = pointers.size ? { crop: { ...props.crop }, zoom: props.zoom, ...gesture() } : undefined
  dragging.value = pointers.size > 0
}
function update(crop: Crop, zoom: number, from: Point, to = from) {
  const next = navigateCrop(props.source, crop, zoom, from, to)
  emit('update:zoom', next.zoom)
  emit('update:horizontal', next.horizontal)
  emit('update:vertical', next.vertical)
}
function pointerDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0) return
  surface.value!.focus({ preventScroll: true })
  surface.value!.setPointerCapture(event.pointerId)
  pointers.set(event.pointerId, point(event))
  rebase()
}
function pointerMove(event: PointerEvent) {
  if (props.disabled || !pointers.has(event.pointerId) || !start) return
  pointers.set(event.pointerId, point(event))
  const current = gesture()
  const zoom = pointers.size >= 2 && start.distance > 0 ? start.zoom * current.distance / start.distance : start.zoom
  update(start.crop, zoom, start.center, current.center)
}
function pointerEnd(event: PointerEvent) {
  if (!pointers.delete(event.pointerId)) return
  rebase()
}
function zoomBy(factor: number, anchor: Point = { x: .5, y: .5 }) {
  if (!props.disabled) update(props.crop, props.zoom * factor, anchor)
}
function wheel(event: WheelEvent) {
  if (props.disabled || event.ctrlKey || event.metaKey || !event.deltaY) return
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? surface.value!.clientHeight : 1)
  const zoom = clamp(props.zoom * Math.exp(-delta * .002), 1, 4)
  if (Math.abs(zoom - props.zoom) < 1e-10) return
  event.preventDefault()
  update(props.crop, zoom, point(event))
}
function keydown(event: KeyboardEvent) {
  // Scope shortcuts to the focused image, never fields, toolbar buttons or browser shortcuts.
  if (props.disabled || event.target !== surface.value || event.ctrlKey || event.metaKey || event.altKey) return
  if (['+', '=', '-', '_'].includes(event.key)) {
    event.preventDefault()
    zoomBy(['+', '='].includes(event.key) ? 1.2 : 1 / 1.2)
  } else if (event.key === 'Home') {
    event.preventDefault()
    emit('reset')
  } else {
    const step = event.shiftKey ? .15 : .05
    const directions: Record<string, Point> = { ArrowLeft: { x: step, y: 0 }, ArrowRight: { x: -step, y: 0 }, ArrowUp: { x: 0, y: step }, ArrowDown: { x: 0, y: -step } }
    const delta = directions[event.key]
    if (!delta) return
    event.preventDefault()
    update(props.crop, props.zoom, { x: .5, y: .5 }, { x: .5 + delta.x, y: .5 + delta.y })
  }
}
function clearPointers() {
  const ids = [...pointers.keys()]
  pointers.clear()
  for (const id of ids) if (surface.value?.hasPointerCapture(id)) surface.value.releasePointerCapture(id)
  start = undefined
  dragging.value = false
}
watch([() => props.disabled, () => props.source, () => Math.round(ratio.value * 1e8)], clearPointers)
onMounted(() => {
  resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return
    clearPointers()
    stageSize.value = { width: entry.contentRect.width, height: entry.contentRect.height }
  })
  resizeObserver.observe(stage.value!)
  surface.value!.addEventListener('wheel', wheel, { passive: false })
})
onBeforeUnmount(() => { resizeObserver?.disconnect(); surface.value?.removeEventListener('wheel', wheel); clearPointers() })
</script>

<template>
  <div ref="stage" class="canvas-stage crop-viewport">
    <div ref="surface" class="crop-surface" :class="{ dragging, disabled }" :style="surfaceStyle" :tabindex="disabled ? -1 : 0" role="group" aria-label="Encuadre de la imagen" :aria-describedby="hintId" :aria-keyshortcuts="disabled ? undefined : '+ - ArrowLeft ArrowRight ArrowUp ArrowDown Home'" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerEnd" @pointercancel="pointerEnd" @lostpointercapture="pointerEnd" @keydown="keydown" @dragstart.prevent>
      <slot />
    </div>
    <div class="crop-toolbar" role="group" aria-label="Ampliación de la imagen">
      <button type="button" aria-label="Alejar imagen" :disabled="disabled || zoom <= 1" @click="zoomBy(1 / 1.2)">−</button>
      <output aria-label="Ampliación actual">{{ zoom.toFixed(1) }}×</output>
      <button type="button" aria-label="Acercar imagen" :disabled="disabled || zoom >= 4" @click="zoomBy(1.2)">+</button>
      <button type="button" class="crop-reset" :disabled="disabled" @click="emit('reset')">Restablecer</button>
    </div>
    <span :id="hintId" class="crop-sr-only">Arrastra para mover la imagen. Pellizca con dos dedos o usa la rueda para ampliar. Con la imagen enfocada, usa + y − para ampliar, flechas para mover e Inicio para restablecer. Ampliación de 1 a 4.</span>
  </div>
</template>

<style scoped>
.crop-viewport { position: relative; }
.crop-surface { position: absolute; inset: 0; margin: auto; display: flex; align-items: center; justify-content: center; touch-action: none; cursor: grab; user-select: none; -webkit-user-select: none; }
.crop-surface.dragging { cursor: grabbing; }
.crop-surface.disabled { cursor: crosshair; touch-action: auto; }
.crop-surface:focus-visible { outline: 3px solid #2469a4; outline-offset: -3px; }
.crop-toolbar { position: absolute; bottom: 8px; right: 8px; display: flex; align-items: center; border: 1px solid #bbc6b0; border-radius: 6px; background: #fffefaed; color: #344331; box-shadow: 0 2px 6px #24312218; }
.crop-toolbar button { border: 0; background: none; color: inherit; min-width: 44px; min-height: 44px; font-size: 22px; border-radius: 5px; padding: 6px; }
.crop-toolbar button:disabled { opacity: .4; }
.crop-toolbar output { font-size: 11px; min-width: 34px; text-align: center; font-variant-numeric: tabular-nums; }
.crop-toolbar .crop-reset { font-size: 10px; padding-inline: 10px; border-left: 1px solid #d9ddd2; }
.crop-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
