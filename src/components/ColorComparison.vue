<script setup lang="ts">
import { computed, ref } from 'vue'
import { COLOR_METHODS } from '../core/color-distance'
import type { ColorMethod } from '../core/color-distance'
import { quantize } from '../core/mosaic'
import type { PaletteColor } from '../core/mosaic'
import MosaicPreview from './MosaicPreview.vue'

const props = defineProps<{
  samples: Float32Array; width: number; height: number; palette: readonly PaletteColor[]
  strength: number; forcedColors?: readonly (string | undefined)[]; method: ColorMethod
  grid: boolean; groupSize: number; shape: string; baseColor: string
}>()
defineEmits<{ choose: [method: ColorMethod] }>()
const open = ref(false)
const results = computed(() => open.value ? COLOR_METHODS.map(method => ({
  ...method,
  mosaic: quantize(props.samples, props.width, props.height, props.strength, props.palette, method.id, props.forcedColors),
})) : [])
</script>

<template>
  <details class="color-comparison" @toggle="open = ($event.currentTarget as HTMLDetailsElement).open">
    <summary>Comparar métodos de color</summary>
    <p class="control-hint">La misma imagen, encuadre, piezas, reglas y dithering con cada método. Compara primero con Colores planos para ver la elección de color sin la mezcla del dithering. Las opciones experimentales no mejoran todas las imágenes.</p>
    <div v-if="open" class="method-cards">
      <figure v-for="result in results" :key="result.id" class="method-card" :class="{ active: method === result.id }">
        <figcaption>{{ result.name }}</figcaption>
        <div class="method-image"><MosaicPreview :mosaic="result.mosaic" :grid="grid" :palette="palette" :group-size="groupSize" :shape="shape" :base-color="baseColor" /></div>
        <p class="control-hint">{{ result.description }}</p>
        <button type="button" :aria-pressed="method === result.id" @click="$emit('choose', result.id)">{{ method === result.id ? 'Método seleccionado' : 'Usar este método' }}</button>
      </figure>
    </div>
  </details>
</template>

<style scoped>
.color-comparison { margin-top: 28px; padding-block: 16px; border-block: 1px solid #d9ddd2; }
summary { min-height: 44px; padding: 12px 0; cursor: pointer; color: #445b38; font-size: 14px; }
.method-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 16px; margin-top: 16px; }
.method-card { margin: 0; padding: 16px; border: 1px solid #d9ddd2; border-radius: 8px; background: #fffefa; display: flex; flex-direction: column; min-width: 0; }
.method-card.active { border-color: #657d55; box-shadow: inset 0 0 0 1px #657d55; }
figcaption { font-size: 13px; font-weight: 600; margin-bottom: 12px; }
.method-image { height: 240px; display: flex; align-items: center; justify-content: center; background: #f1f0e8; }
.method-image :deep(canvas) { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }
button { margin-top: auto; min-height: 44px; padding: 10px; border: 1px solid #bbc6b0; border-radius: 5px; color: #344331; background: #eef1e7; cursor: pointer; }
button[aria-pressed="true"] { color: white; background: #526b44; }
button:focus-visible, summary:focus-visible { outline: 3px solid #2469a4; outline-offset: 3px; }
</style>
