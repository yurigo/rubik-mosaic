<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import RegionControls from './components/RegionControls.vue'
import { createRegionRaster, projectRegions, selectRegion } from './core/regions'
import type { Point, RegionMask, RegionRule } from './core/regions'
import CropEditor from './components/CropEditor.vue'
import { cropWithin, linkedDimension, suggestLayout } from './core/layout'
import type { Crop } from './core/mosaic'
import CropPreview from './components/CropPreview.vue'
import CropViewport from './components/CropViewport.vue'
import MosaicPreview from './components/MosaicPreview.vue'
import { countColors, getGeometry, getLegoGeometry, PALETTE, quantize, sampleImage } from './core/mosaic'
import type { Raster } from './core/mosaic'
import LegoPalette from './components/LegoPalette.vue'
import { getLegoPalette, LEGO_PARTS } from './core/lego'
import { COLOR_METHODS } from './core/color-distance'
import type { ColorMethod } from './core/color-distance'
import type { LegoPartId } from './core/lego'
import { createExample, readImage } from './io/images'

const source = shallowRef<Raster>()
const fileName = ref('Paisaje de ejemplo')
const cubeAvailable = ref(9)
const legoAvailable = ref(1024)
const material = ref<'rubik' | LegoPartId>('rubik')
const isLego = computed(() => material.value !== 'rubik')
const available = computed({ get: () => isLego.value ? legoAvailable.value : cubeAvailable.value, set: (v) => { if (isLego.value) legoAvailable.value = v; else cubeAvailable.value = v } })
const sizingMode = ref<'budget' | 'size'>('budget')
const keepRatio = ref(true)
const lastAxis = ref<'columns' | 'rows'>('columns')
const selectedCrop = ref<Crop>()
const cropEditorOpen = ref(false)
const bounds = computed(() => source.value ? selectedCrop.value ?? { x: 0, y: 0, width: source.value.width, height: source.value.height } : undefined)
const targetRatio = computed(() => bounds.value ? bounds.value.width / bounds.value.height : 1)
const suggestion = computed(() => {
  try { return { dimensions: suggestLayout(available.value, targetRatio.value, isLego.value ? 22500 : 2500), error: '' } }
  catch (error) { return { dimensions: undefined, error: (error as Error).message } }
})
const cubeColumns = ref(3)
const cubeRows = ref(3)
const legoColumns = ref(32)
const legoRows = ref(32)
const manualColumns = computed({ get: () => isLego.value ? legoColumns.value : cubeColumns.value, set: (v) => { if (isLego.value) legoColumns.value = v; else cubeColumns.value = v } })
const manualRows = computed({ get: () => isLego.value ? legoRows.value : cubeRows.value, set: (v) => { if (isLego.value) legoRows.value = v; else cubeRows.value = v } })
function syncDimension(axis: 'columns' | 'rows') {
  const linked = linkedDimension(axis === 'columns' ? manualColumns.value : manualRows.value, targetRatio.value, axis)
  if (linked !== undefined) { if (axis === 'columns') manualRows.value = linked; else manualColumns.value = linked }
}
const columns = computed({ get: () => sizingMode.value === 'budget' ? suggestion.value.dimensions?.columns ?? 0 : manualColumns.value, set: (v) => { manualColumns.value = v; lastAxis.value = 'columns'; if (keepRatio.value) syncDimension('columns') } })
const rows = computed({ get: () => sizingMode.value === 'budget' ? suggestion.value.dimensions?.rows ?? 0 : manualRows.value, set: (v) => { manualRows.value = v; lastAxis.value = 'rows'; if (keepRatio.value) syncDimension('rows') } })
function chooseSizing(mode: 'budget' | 'size') {
  if (mode === sizingMode.value) return
  if (mode === 'size') {
    const previous = { columns: columns.value, rows: rows.value }
    manualColumns.value = previous.columns || 1; manualRows.value = previous.rows || 1
    lastAxis.value = 'columns'
  }
  sizingMode.value = mode
  if (mode === 'size' && keepRatio.value) syncDimension(lastAxis.value)
}
watch([targetRatio, material], () => { if (sizingMode.value === 'size' && keepRatio.value) syncDimension(lastAxis.value) })
const selections = ref(Object.fromEntries(LEGO_PARTS.map((part) => [part.id, getLegoPalette(part.id).map((color) => color.id)])))
const legoPalette = computed(() => material.value === 'rubik' ? [] : getLegoPalette(material.value))
const selectedColors = computed({ get: () => selections.value[material.value] ?? [], set: (ids: string[]) => { selections.value[material.value] = ids } })
const palette = computed(() => isLego.value ? legoPalette.value.filter((color) => selectedColors.value.includes(color.id)) : PALETTE)
const paletteError = computed(() => palette.value.length ? '' : 'Selecciona al menos un color para generar el mosaico.')
const shape = computed(() => LEGO_PARTS.find((part) => part.id === material.value)?.shape ?? 'square')
const baseColor = ref('#FFFFFF')
const colorMethod = ref<ColorMethod>('rgb')
const methodDescription = computed(() => COLOR_METHODS.find((method) => method.id === colorMethod.value)!.description)
const dither = ref(true)
const strength = ref(80)
const grid = ref(true)
const zoom = ref(1)
const horizontal = ref(50)
const vertical = ref(50)
const loading = ref(false)
const imageError = ref('')
let loadRequest = 0
const selecting = ref(false)
const tolerance = ref(15)
const regionColor = ref('W')
const regionPoint = ref<Point>()
const rules = shallowRef<RegionRule[]>([])
const viewedMask = shallowRef<RegionMask>()
let nextRuleId = 1
const analysis = computed(() => source.value ? createRegionRaster(source.value) : undefined)
const draftMask = computed(() => analysis.value && regionPoint.value ? selectRegion(analysis.value, regionPoint.value, tolerance.value) : undefined)
const selectionMask = computed(() => draftMask.value ?? viewedMask.value)
watch(source, () => { selectedCrop.value = undefined; cropEditorOpen.value = false; rules.value = []; regionPoint.value = undefined; viewedMask.value = undefined; selecting.value = false })
watch(palette, (colors) => { if (!colors.some(color => color.id === regionColor.value)) regionColor.value = colors[0]?.id ?? '' }, { immediate: true })
function pickRegion(point: Point) {
  if (!source.value) return
  regionPoint.value = { x: Math.min(1 - Number.EPSILON, Math.max(0, point.x / source.value.width)), y: Math.min(1 - Number.EPSILON, Math.max(0, point.y / source.value.height)) }
  viewedMask.value = undefined
}
function cancelRegion() { regionPoint.value = undefined; viewedMask.value = undefined }
function applyRegion() {
  if (!draftMask.value || !palette.value.some(color => color.id === regionColor.value) || rules.value.length >= 12) return
  rules.value = [...rules.value, { id: nextRuleId++, mask: draftMask.value, colorId: regionColor.value, tolerance: tolerance.value }]
  viewedMask.value = draftMask.value
  regionPoint.value = undefined
}
function removeRegion(id: number) { rules.value = rules.value.filter(rule => rule.id !== id); viewedMask.value = undefined }
function previewRegion(id: number) { regionPoint.value = undefined; viewedMask.value = rules.value.find(rule => rule.id === id)?.mask }


const layout = computed(() => {
  try {
    if (sizingMode.value === 'budget' && suggestion.value.error) throw new Error(suggestion.value.error)
    const used = columns.value * rows.value
    const geometry = isLego.value ? getLegoGeometry(columns.value, rows.value) : getGeometry(sizingMode.value === 'budget' ? available.value : used, columns.value, rows.value)
    return { geometry: { ...geometry, remaining: sizingMode.value === 'budget' ? available.value - used : 0 }, error: '' }
  } catch (error) { return { geometry: undefined, error: (error as Error).message } }
})
const crop = computed(() => bounds.value && layout.value.geometry
  ? cropWithin(bounds.value, columns.value / rows.value, zoom.value, horizontal.value / 100, vertical.value / 100)
  : undefined)
const samples = computed(() => {
  const geometry = layout.value.geometry
  return source.value && crop.value && geometry ? sampleImage(source.value, crop.value, geometry.width, geometry.height) : undefined
})
const forcedColors = computed(() => source.value && crop.value && layout.value.geometry ? projectRegions(rules.value, source.value, crop.value, layout.value.geometry.width, layout.value.geometry.height, palette.value) : undefined)
const draftCellCount = computed(() => {
  const geometry = layout.value.geometry
  return draftMask.value && source.value && crop.value && geometry && regionColor.value ? projectRegions([{ id: 0, mask: draftMask.value, colorId: regionColor.value, tolerance: tolerance.value }], source.value, crop.value, geometry.width, geometry.height, palette.value).filter(Boolean).length : 0
})
const mosaic = computed(() => {
  const geometry = layout.value.geometry
  return samples.value && geometry && !paletteError.value ? quantize(samples.value, geometry.width, geometry.height, dither.value ? strength.value / 100 : 0, palette.value, colorMethod.value, forcedColors.value) : undefined
})

const consumption = computed(() => mosaic.value ? countColors(mosaic.value) : {})

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
function preset(count: number) { sizingMode.value = 'budget'; available.value = count }
function applyCrop(rect: Crop) { selectedCrop.value = rect; cropEditorOpen.value = false; resetCrop() }
function openCrop() { selecting.value = false; cropEditorOpen.value = true }
function fullImage() { selectedCrop.value = undefined; resetCrop() }
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
        <div><p class="eyebrow">DE UNA IMAGEN A ALGO QUE PUEDES CONSTRUIR</p><h1>Tu imagen,<br class="mobile-break" /> pieza a pieza<span>.</span></h1><p class="intro-copy">Un poco de color. Un poco de paciencia. Un mosaico muy tuyo.</p></div>
        <div class="edition"><span>EL TALLER</span><strong>01 <span>/ Mosaicos</span></strong></div>
      </section>

      <div class="workspace">
        <aside class="controls" aria-label="Configuración del mosaico">
          <section class="control-section">
            <h2><span class="step">01</span> La imagen</h2>
            <label class="upload-button"><input type="file" accept="image/jpeg,image/png,image/webp" @change="upload" /><span aria-hidden="true">↥</span> {{ loading ? 'Abriendo imagen…' : 'Subir una imagen' }}</label>
            <p class="control-hint">JPG, PNG o WebP · hasta 20 MiB</p>
            <div v-if="source" class="crop-entry"><button type="button" class="crop-open-button" @click="openCrop">Recortar imagen</button><button v-if="selectedCrop" type="button" class="text-button" @click="fullImage">Usar imagen completa</button><p class="control-hint">Proporción {{ targetRatio.toFixed(3) }}:1 · {{ selectedCrop ? 'Recorte personalizado' : 'Imagen completa' }}</p></div>
            <p v-if="imageError" class="error-message" role="alert">{{ imageError }}</p>
            <button class="text-button" type="button" @click="useExample">Usar el paisaje de ejemplo <span aria-hidden="true">↗</span></button>
          </section>

          <section class="control-section">
            <h2><span class="step">02</span> Tus piezas</h2>
            <label class="material-label">Material<select v-model="material"><option value="rubik">Cubos de Rubik 3×3</option><option v-for="part in LEGO_PARTS" :key="part.id" :value="part.id">{{ part.name }}</option></select></label>
            <div class="segmented sizing-modes" role="group" aria-label="Cómo definir el tamaño"><button type="button" :aria-pressed="sizingMode === 'budget'" :class="{ selected: sizingMode === 'budget' }" @click="chooseSizing('budget')">Tengo estas piezas</button><button type="button" :aria-pressed="sizingMode === 'size'" :class="{ selected: sizingMode === 'size' }" @click="chooseSizing('size')">Quiero este tamaño</button></div>
            <div v-if="sizingMode === 'budget'" class="number-fields one-field">
              <label>{{ isLego ? 'Piezas disponibles' : 'Cubos disponibles' }}<input v-model.number="available" type="number" min="1" :max="isLego ? 22500 : 2500" step="1" inputmode="numeric" :aria-invalid="!!layout.error" /></label>
            </div>
            <template v-else>
              <label class="checkbox-label ratio-lock"><input v-model="keepRatio" type="checkbox" @change="keepRatio && syncDimension(lastAxis)" /> Mantener proporción del recorte</label>
              <div class="number-fields lego-dimensions">
                <label>Columnas<input v-model.number="columns" type="number" min="1" :max="isLego ? 22500 : 2500" step="1" inputmode="numeric" :aria-invalid="!!layout.error" /></label>
                <label>Filas<input v-model.number="rows" type="number" min="1" :max="isLego ? 22500 : 2500" step="1" inputmode="numeric" :aria-invalid="!!layout.error" /></label>
              </div>
            </template>
            <p v-if="isLego" class="control-hint">Una pieza = un píxel. Columnas y filas en piezas.</p>
            <p v-else class="control-hint">Columnas y filas en cubos. Cada cubo aporta 3×3 píxeles.</p>
            <div v-if="sizingMode === 'budget'" class="presets"><span>Probar con</span><button v-for="count in (isLego ? [256, 1024, 4096] : [9, 100, 900])" :key="count" type="button" :class="{ active: available === count }" @click="preset(count)">{{ count }}</button></div>
            <p v-if="layout.error" class="error-message" role="alert">{{ layout.error }}</p>
            <div v-else-if="layout.geometry" class="resolution-box" aria-live="polite">
              <p class="layout-summary"><strong>{{ columns }} × {{ rows }}</strong> {{ isLego ? 'piezas' : 'cubos' }}</p>
              <div><span>Resolución del mosaico</span><strong>{{ layout.geometry.width }} <small>×</small> {{ layout.geometry.height }} <em>px</em></strong></div>
              <span class="resolution-note">{{ sizingMode === 'budget' ? 'Usas' : 'Necesitas' }} {{ layout.geometry.used }} {{ isLego ? 'piezas' : 'cubos' }}<template v-if="sizingMode === 'budget'"> · {{ layout.geometry.remaining }} sobrantes</template></span>
            </div>
            <p v-if="layout.geometry" class="control-hint">Las filas y columnas son enteras: la proporción puede aproximarse. La vista muestra el encuadre final sin deformar la imagen.</p>
          </section>

          <section v-if="isLego" class="control-section lego-controls">
            <h2>Los colores de tu caja</h2>
            <LegoPalette v-model="selectedColors" :colors="legoPalette" />
            <p class="control-hint">Marca los colores que tienes. Sin límites de cantidad por color. Muestras de pantalla aproximadas; incluye colores históricos.</p>
            <a class="text-button" :href="`https://www.bricklink.com/v2/catalog/catalogitem.page?P=${material}#T=C`" target="_blank" rel="noopener noreferrer">Ver pieza en BrickLink ↗</a>
            <p v-if="paletteError" class="error-message" role="alert">{{ paletteError }}</p>
            <label v-if="shape === 'round'" class="base-label">Color de la base<input v-model="baseColor" type="color" /><span>Solo previsualización; la base no cuenta como piezas.</span></label>
          </section>

          <section class="control-section">
            <h2><span class="step">03</span> Encuadra a tu gusto</h2>
            <p class="control-hint">En modo Encuadrar, mueve la imagen arrastrando. Amplía con dos dedos, la rueda o los botones + y − sobre la imagen. Con el encuadre enfocado también puedes usar +, − y las flechas del teclado.</p>
            <button class="text-button subtle" type="button" @click="resetCrop">Restablecer encuadre</button>
          </section>

          <section class="control-section last-section">
            <h2><span class="step">04</span> Mezcla los colores</h2>
            <label class="material-label">Método de comparación de colores<select v-model="colorMethod" aria-describedby="color-method-description"><option v-for="method in COLOR_METHODS" :key="method.id" :value="method.id">{{ method.name }}</option></select></label>
            <p id="color-method-description" class="control-hint">{{ methodDescription }}</p>
            <div class="segmented" role="group" aria-label="Modo de conversión"><button type="button" :aria-pressed="!dither" :class="{ selected: !dither }" @click="dither = false">Colores planos</button><button type="button" :aria-pressed="dither" :class="{ selected: dither }" @click="dither = true">Dithering</button></div>
            <p class="control-hint">El dithering mezcla pequeñas casillas para sugerir más tonos.</p>
            <label class="range-label" for="strength" :class="{ muted: !dither }">Intensidad <output>{{ strength }} %</output><input id="strength" v-model.number="strength" type="range" min="0" max="100" :disabled="!dither" /></label>
          </section>
        </aside>

        <section class="preview-area" aria-label="Vista previa" :aria-busy="loading">
          <div class="preview-toolbar"><div><span class="status-dot" /><span>{{ loading ? 'Abriendo tu imagen' : 'Vista previa' }}</span></div><label class="checkbox-label"><input v-model="grid" type="checkbox" /> {{ isLego ? 'Ver límites de piezas' : 'Ver cubos 3×3' }}</label></div>
          <RegionControls v-if="source" v-model:selecting="selecting" v-model:tolerance="tolerance" v-model:color-id="regionColor" :palette="palette" :rules="rules" :has-selection="!!draftMask" :cell-count="draftCellCount" @apply="applyRegion" @cancel="cancelRegion" @remove="removeRegion" @preview="previewRegion" />
          <div v-if="source && crop && mosaic" class="comparison">
            <figure class="preview-card">
              <figcaption><span>Tu punto de partida</span><span class="caption-number">01</span></figcaption>
              <CropViewport :source="source" :crop="crop" :bounds="bounds" v-model:zoom="zoom" v-model:horizontal="horizontal" v-model:vertical="vertical" :disabled="selecting" @reset="resetCrop">
                <CropPreview :source="source" :crop="crop" :selecting="selecting" :selection="selectionMask" @select="pickRegion" />
              </CropViewport>
              <p class="image-caption" :title="fileName">{{ fileName }}</p>
            </figure>
            <figure class="preview-card result-card"><figcaption><span>Tu mosaico</span><span class="caption-number">02</span></figcaption><div class="canvas-stage"><MosaicPreview :mosaic="mosaic" :grid="grid" :palette="palette" :group-size="isLego ? 1 : 3" :shape="shape" :base-color="baseColor" /></div><p class="image-caption">{{ mosaic.width }} × {{ mosaic.height }} casillas · {{ palette.length }} colores disponibles</p></figure>
          </div>
          <div v-else class="preview-empty" role="status"><span aria-hidden="true">▦</span><h2>Un espacio para tu mosaico</h2><p>{{ paletteError || layout.error || 'Sube una imagen o prueba nuestro paisaje.' }}</p></div>
          <div v-if="!isLego" class="palette-strip"><span class="palette-label">SEIS COLORES.<br />INFINITAS IDEAS.</span><div class="palette-colors"><span v-for="color in PALETTE" :key="color.id" class="palette-chip" :style="{ '--chip-color': color.hex }" :title="color.name"><i aria-hidden="true" /><span>{{ color.name }}</span></span></div></div>
          <section v-if="isLego && mosaic" class="consumption" aria-label="Piezas necesarias por color"><h2>Piezas necesarias · {{ mosaic.width * mosaic.height }} en total</h2><p class="control-hint">{{ Object.keys(consumption).length }} colores utilizados · referencia de color BrickLink</p><ul><li v-for="color in legoPalette.filter((item) => consumption[item.id])" :key="color.id"><i :style="{ background: color.hex }" aria-hidden="true" /><span>{{ color.name }} <small>#{{ color.bricklinkId }}</small></span><strong>{{ consumption[color.id] }}</strong></li></ul></section>
          <div class="preview-footnote"><p><span aria-hidden="true">↳</span> ¿Pocas piezas? Prueba un encuadre sencillo y con buen contraste.</p><span>{{ isLego ? 'Paleta sólida · colores aproximados · base no incluida' : 'Patrón visual · montaje pendiente de verificar' }}</span></div>
        </section>
      </div>
    </main>
    <CropEditor v-if="cropEditorOpen && source && bounds" :source="source" :initial="bounds" @apply="applyCrop" @cancel="cropEditorOpen = false" />
    <footer class="site-footer"><span>Hecho para imaginar con las manos.</span><a href="https://github.com/yurigo/rubik-mosaic" target="_blank" rel="noopener noreferrer">El proyecto en GitHub <span aria-hidden="true">↗</span></a></footer>
  </div>
</template>
