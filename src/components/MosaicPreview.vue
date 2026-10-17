<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { PALETTE } from '../core/mosaic'
import type { Mosaic } from '../core/mosaic'

const props = defineProps<{ mosaic: Mosaic; grid: boolean }>()
const canvas = ref<HTMLCanvasElement>()
const colors = Object.fromEntries(PALETTE.map((color) => [color.id, color.hex]))
watchEffect(() => {
  if (!canvas.value) return
  const { width, height, pixels } = props.mosaic
  const cell = Math.max(2, Math.floor(900 / Math.max(width, height)))
  canvas.value.width = width * cell
  canvas.value.height = height * cell
  const ctx = canvas.value.getContext('2d')!
  pixels.forEach((id, index) => {
    ctx.fillStyle = colors[id]
    ctx.fillRect((index % width) * cell, Math.floor(index / width) * cell, cell, cell)
  })
  if (!props.grid) return
  ctx.strokeStyle = 'rgba(24, 32, 29, 0.42)'
  ctx.lineWidth = Math.max(1, cell / 25)
  ctx.beginPath()
  for (let x = 3; x < width; x += 3) { ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, height * cell) }
  for (let y = 3; y < height; y += 3) { ctx.moveTo(0, y * cell); ctx.lineTo(width * cell, y * cell) }
  ctx.stroke()
})
</script>

<template>
  <canvas ref="canvas" class="mosaic-canvas" role="img" :aria-label="`Mosaico de ${mosaic.width} por ${mosaic.height} casillas en seis colores`" />
</template>
