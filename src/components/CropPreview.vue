<script setup lang="ts">
import { ref, shallowRef, watch, watchEffect } from 'vue'
import type { Crop, Raster } from '../core/mosaic'

const props = defineProps<{ source: Raster; crop: Crop }>()
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
})
</script>

<template>
  <canvas ref="canvas" role="img" aria-label="Imagen original con el recorte seleccionado" />
</template>
