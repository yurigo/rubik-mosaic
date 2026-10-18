<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import type { Mosaic, PaletteColor } from '../core/mosaic'

const props = defineProps<{ mosaic: Mosaic; grid: boolean; palette: readonly PaletteColor[]; groupSize: number; shape: string; baseColor: string }>()
const canvas = ref<HTMLCanvasElement>()
watchEffect(() => {
  if (!canvas.value) return
  const { width, height, pixels } = props.mosaic
  const cell = Math.max(2, Math.floor(900 / Math.max(width, height)))
  canvas.value.width = width * cell
  canvas.value.height = height * cell
  const ctx = canvas.value.getContext('2d')!
  const colors = Object.fromEntries(props.palette.map((color) => [color.id, color.hex]))
  ctx.fillStyle = props.baseColor
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
  pixels.forEach((id, index) => {
    ctx.fillStyle = colors[id]
    const x = (index % width) * cell
    const y = Math.floor(index / width) * cell
    if (props.shape === 'round') {
      ctx.beginPath()
      ctx.arc(x + cell / 2, y + cell / 2, cell * 0.48, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(x, y, cell, cell)
      if (props.shape === 'plate') {
        ctx.beginPath()
        ctx.arc(x + cell / 2, y + cell / 2, cell * 0.3, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)'
        ctx.lineWidth = Math.max(1, cell / 30)
        ctx.stroke()
      }
    }
  })
  if (!props.grid) return
  ctx.strokeStyle = 'rgba(24, 32, 29, 0.42)'
  ctx.lineWidth = Math.max(1, cell / 25)
  ctx.beginPath()
  for (let x = props.groupSize; x < width; x += props.groupSize) { ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, height * cell) }
  for (let y = props.groupSize; y < height; y += props.groupSize) { ctx.moveTo(0, y * cell); ctx.lineTo(width * cell, y * cell) }
  ctx.stroke()
})
</script>

<template>
  <canvas ref="canvas" class="mosaic-canvas" role="img" :aria-label="`Mosaico de ${mosaic.width} por ${mosaic.height} casillas con ${palette.length} colores disponibles`" />
</template>
