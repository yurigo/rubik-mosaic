<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import CropPreview from './components/CropPreview.vue'
import MosaicPreview from './components/MosaicPreview.vue'
import { getCrop, getGeometry, PALETTE, quantize, sampleImage } from './core/mosaic'
import type { Raster } from './core/mosaic'
import { createExample, readImage } from './io/images'

const source = shallowRef<Raster>()
const fileName = ref('Paisaje de ejemplo')
const available = ref(9)
const columns = ref(3)
const rows = ref(3)
const dither = ref(true)
const strength = ref(80)
const grid = ref(true)
const zoom = ref(1)
const horizontal = ref(50)
const vertical = ref(50)
const loading = ref(false)
const imageError = ref('')
let loadRequest = 0

const layout = computed(() => {
  try { return { geometry: getGeometry(available.value, columns.value, rows.value), error: '' } }
  catch (error) { return { geometry: undefined, error: (error as Error).message } }
})
const crop = computed(() => source.value && layout.value.geometry
  ? getCrop(source.value.width, source.value.height, columns.value / rows.value, zoom.value, horizontal.value / 100, vertical.value / 100)
  : undefined)
const samples = computed(() => {
  const geometry = layout.value.geometry
  return source.value && crop.value && geometry ? sampleImage(source.value, crop.value, geometry.width, geometry.height) : undefined
})
const mosaic = computed(() => {
  const geometry = layout.value.geometry
  return samples.value && geometry ? quantize(samples.value, geometry.width, geometry.height, dither.value ? strength.value / 100 : 0) : undefined
})

function resetCrop() { zoom.value = 1; horizontal.value = 50; vertical.value = 50 }
function useExample() {
  loadRequest++
  loading.value = false
  source.value = createExample()
  fileName.value = 'Paisaje de ejemplo'
  imageError.value = ''
  resetCrop()
}
async function upload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const request = ++loadRequest
  loading.value = true
  imageError.value = ''
  try {
    const image = await readImage(file)
    if (request !== loadRequest) return
    source.value = image
    fileName.value = file.name
    resetCrop()
  } catch (error) {
    if (request === loadRequest) imageError.value = (error as Error).message
  } finally { if (request === loadRequest) loading.value = false }
}
function preset(side: number) { available.value = side * side; columns.value = side; rows.value = side }
onMounted(useExample)
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <a class="brand" href="./" aria-label="Rubik Mosaic, inicio">
        <span class="brand-mark" aria-hidden="true"><i v-for="color in PALETTE" :key="color.id" :style="{ background: color.hex }" /></span>
        <span>rubik<span class="brand-light">mosaic</span><span class="brand-dot">.</span></span>
      </a>
      <span class="header-note"><span class="status-dot" /> Tu imagen se queda en tu dispositivo</span>
    </header>

    <main>
      <section class="intro">
        <div><p class="eyebrow">DE UNA IMAGEN A ALGO QUE PUEDES CONSTRUIR</p><h1>Tu imagen,<br class="mobile-break" /> cubo a cubo<span>.</span></h1><p class="intro-copy">Un poco de color. Un poco de paciencia. Un mosaico muy tuyo.</p></div>
        <div class="edition"><span>EL TALLER</span><strong>01 <span>/ Mosaicos</span></strong></div>
      </section>

      <div class="workspace">
        <aside class="controls" aria-label="Configuración del mosaico">
          <section class="control-section">
            <h2><span class="step">01</span> La imagen</h2>
            <label class="upload-button"><input type="file" accept="image/jpeg,image/png,image/webp" @change="upload" /><span aria-hidden="true">↥</span> {{ loading ? 'Abriendo imagen…' : 'Subir una imagen' }}</label>
            <p class="control-hint">JPG, PNG o WebP · hasta 20 MiB</p>
            <p v-if="imageError" class="error-message" role="alert">{{ imageError }}</p>
            <button class="text-button" type="button" @click="useExample">Usar el paisaje de ejemplo <span aria-hidden="true">↗</span></button>
          </section>

          <section class="control-section">
            <h2><span class="step">02</span> Tus cubos</h2>
            <div class="number-fields">
              <label>Disponibles<input v-model.number="available" type="number" min="1" max="2500" step="1" inputmode="numeric" :aria-invalid="!!layout.error" /></label>
              <label>Columnas<input v-model.number="columns" type="number" min="1" max="2500" step="1" inputmode="numeric" :aria-invalid="!!layout.error" /></label>
              <label>Filas<input v-model.number="rows" type="number" min="1" max="2500" step="1" inputmode="numeric" :aria-invalid="!!layout.error" /></label>
            </div>
            <div class="presets"><span>Probar con</span><button v-for="side in [3, 10, 30]" :key="side" type="button" :class="{ active: available === side * side && columns === side && rows === side }" @click="preset(side)">{{ side * side }}</button><span>cubos</span></div>
            <p v-if="layout.error" class="error-message" role="alert">{{ layout.error }}</p>
            <div v-else-if="layout.geometry" class="resolution-box" aria-live="polite"><div><span>Resolución del mosaico</span><strong>{{ layout.geometry.width }} <small>×</small> {{ layout.geometry.height }} <em>px</em></strong></div><span class="resolution-note">{{ layout.geometry.used }} cubos · {{ layout.geometry.remaining }} sobrantes</span></div>
          </section>

          <section class="control-section">
            <h2><span class="step">03</span> Encuadra a tu gusto</h2>
            <label class="range-label">Ampliación <output>{{ zoom.toFixed(1) }}×</output><input v-model.number="zoom" type="range" min="1" max="4" step="0.1" /></label>
            <label class="range-label">Posición horizontal<input v-model.number="horizontal" type="range" min="0" max="100" /></label>
            <label class="range-label">Posición vertical<input v-model.number="vertical" type="range" min="0" max="100" /></label>
            <button class="text-button subtle" type="button" @click="resetCrop">Restablecer encuadre</button>
          </section>

          <section class="control-section last-section">
            <h2><span class="step">04</span> Mezcla los colores</h2>
            <div class="segmented" role="group" aria-label="Modo de conversión"><button type="button" :aria-pressed="!dither" :class="{ selected: !dither }" @click="dither = false">Colores planos</button><button type="button" :aria-pressed="dither" :class="{ selected: dither }" @click="dither = true">Dithering</button></div>
            <p class="control-hint">El dithering mezcla pequeñas casillas para sugerir más tonos.</p>
            <label class="range-label" :class="{ muted: !dither }">Intensidad <output>{{ strength }} %</output><input v-model.number="strength" type="range" min="0" max="100" :disabled="!dither" /></label>
          </section>
        </aside>

        <section class="preview-area" aria-label="Vista previa" :aria-busy="loading">
          <div class="preview-toolbar"><div><span class="status-dot" /><span>{{ loading ? 'Abriendo tu imagen' : 'Vista previa' }}</span></div><label class="checkbox-label"><input v-model="grid" type="checkbox" /> Ver cubos 3×3</label></div>
          <div v-if="source && crop && mosaic" class="comparison">
            <figure class="preview-card"><figcaption><span>Tu punto de partida</span><span class="caption-number">01</span></figcaption><div class="canvas-stage"><CropPreview :source="source" :crop="crop" /></div><p class="image-caption" :title="fileName">{{ fileName }}</p></figure>
            <figure class="preview-card result-card"><figcaption><span>Tu mosaico</span><span class="caption-number">02</span></figcaption><div class="canvas-stage"><MosaicPreview :mosaic="mosaic" :grid="grid" /></div><p class="image-caption">{{ mosaic.width }} × {{ mosaic.height }} casillas · 6 colores</p></figure>
          </div>
          <div v-else class="preview-empty" role="status"><span aria-hidden="true">▦</span><h2>Un espacio para tu mosaico</h2><p>{{ layout.error ? 'Ajusta la disposición de tus cubos para ver el resultado.' : 'Sube una imagen o prueba nuestro paisaje.' }}</p></div>
          <div class="palette-strip"><span class="palette-label">SEIS COLORES.<br />INFINITAS IDEAS.</span><div class="palette-colors"><span v-for="color in PALETTE" :key="color.id" class="palette-chip" :style="{ '--chip-color': color.hex }" :title="color.name"><i aria-hidden="true" /><span>{{ color.name }}</span></span></div></div>
          <div class="preview-footnote"><p><span aria-hidden="true">↳</span> ¿Pocos cubos? Prueba un encuadre sencillo y con buen contraste.</p><span>Patrón visual · montaje pendiente de verificar</span></div>
        </section>
      </div>
    </main>
    <footer class="site-footer"><span>Hecho para imaginar con las manos.</span><a href="https://github.com/yurigo/rubik-mosaic" target="_blank" rel="noopener noreferrer">El proyecto en GitHub <span aria-hidden="true">↗</span></a></footer>
  </div>
</template>
