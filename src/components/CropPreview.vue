<script setup lang="ts">
import { ref, shallowRef, watch, watchEffect } from 'vue'
import type { Point, RegionMask } from '../core/regions'
import type { Crop, Raster } from '../core/mosaic'

const props = defineProps<{ source: Raster; crop: Crop; selecting?: boolean; selection?: RegionMask }>()
const emit = defineEmits<{ select: [point: Point] }>()
const cursor = ref({ x: 0.5, y: 0.5 })
const keyboardCursor = ref(false)
const overlay = shallowRef<HTMLCanvasElement>()
watch(() => props.selection, (mask) => {
  if (!mask) { overlay.value = undefined; return }
  const layer = document.createElement('canvas')
  layer.width = mask.width; layer.height = mask.height
  const data = new Uint8ClampedArray(mask.width * mask.height * 4)
  mask.data.forEach((value, index) => { if (value) { data[index * 4] = 0; data[index * 4 + 1] = 220; data[index * 4 + 2] = 220; data[index * 4 + 3] = 115 } })
  layer.getContext('2d')!.putImageData(new ImageData(data, mask.width, mask.height), 0, 0)
  overlay.value = layer
}, { immediate: true })
function selectAt(x: number, y: number) { emit('select', { x: props.crop.x + x * props.crop.width, y: props.crop.y + y * props.crop.height }) }
function pick(event: MouseEvent) {
  if (!props.selecting || !canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(1 - Number.EPSILON, (event.clientX - rect.left) / rect.width))
  const y = Math.max(0, Math.min(1 - Number.EPSILON, (event.clientY - rect.top) / rect.height))
  cursor.value = { x, y }; keyboardCursor.value = false; selectAt(x, y)
}
function keydown(event: KeyboardEvent) {
  if (!props.selecting) return
  const offsets: Record<string, [number, number]> = { ArrowLeft: [-0.01, 0], ArrowRight: [0.01, 0], ArrowUp: [0, -0.01], ArrowDown: [0, 0.01] }
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectAt(cursor.value.x, cursor.value.y); return }
  const offset = offsets[event.key]
  if (!offset) return
  event.preventDefault(); keyboardCursor.value = true
  cursor.value = { x: Math.max(0, Math.min(0.999, cursor.value.x + offset[0])), y: Math.max(0, Math.min(0.999, cursor.value.y + offset[1])) }
}
const canvas = ref<HTMLCanvasElement>()
const sourceCanvas = shallowRef<HTMLCanvasElement>()
watch(() => props.source, (raster) => {
  const source = document.createElement('canvas')
  source.width = raster.width
  source.height = raster.height
  source.getContext('2d')!.putImageData(new ImageData(raster.data, source.width, source.height), 0, 0)
  sourceCanvas.value = source
}, { immediate: true })
watchEffect(() => {
  if (!canvas.value || !sourceCanvas.value) return
  const ratio = props.crop.width / props.crop.height
  canvas.value.width = Math.max(1, Math.round(640 * Math.min(1, ratio)))
  canvas.value.height = Math.max(1, Math.round(640 * Math.min(1, 1 / ratio)))
  const ctx = canvas.value.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
  ctx.drawImage(sourceCanvas.value, props.crop.x, props.crop.y, props.crop.width, props.crop.height, 0, 0, canvas.value.width, canvas.value.height)
  if (overlay.value) {
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(overlay.value, props.crop.x / props.source.width * overlay.value.width, props.crop.y / props.source.height * overlay.value.height, props.crop.width / props.source.width * overlay.value.width, props.crop.height / props.source.height * overlay.value.height, 0, 0, canvas.value.width, canvas.value.height)
  }
  if (props.selecting && keyboardCursor.value) {
    const x = cursor.value.x * canvas.value.width
    const y = cursor.value.y * canvas.value.height
    ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y); ctx.moveTo(x, y - 12); ctx.lineTo(x, y + 12)
    ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.stroke()
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()
  }
})
</script>

<template>
  <canvas ref="canvas" :role="selecting ? 'button' : 'img'" :tabindex="selecting ? 0 : undefined" :class="{ selecting }" :aria-label="selecting ? 'Seleccionar zona: flechas para mover la cruz, Intro para seleccionar' : 'Imagen original con el recorte seleccionado'" @click="pick" @keydown="keydown" @focus="keyboardCursor = true" @blur="keyboardCursor = false" />
</template>

<style scoped>
.selecting { cursor: crosshair; touch-action: manipulation; }
.selecting:focus-visible { outline: 3px solid #2469a4; outline-offset: 4px; }
</style>
