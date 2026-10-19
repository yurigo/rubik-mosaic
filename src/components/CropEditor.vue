<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CropPreview from './CropPreview.vue'
import { fitSelection, moveSelection, resizeSelection, validSelection } from '../core/crop-editor'
import type { Handle } from '../core/crop-editor'
import { containedSize } from '../core/crop-navigation'
import type { Crop, Raster } from '../core/mosaic'

const props = defineProps<{ source: Raster; initial: Crop }>()
const emit = defineEmits<{ apply: [crop: Crop]; cancel: [] }>()
const dialog = ref<HTMLDialogElement>()
const stage = ref<HTMLElement>()
const image = ref<HTMLElement>()
const stageSize = ref({ width: 0, height: 0 })
const draft = ref({ ...props.initial })
const preset = ref('free')
const portrait = ref(false)
const full = computed(() => ({ x: 0, y: 0, width: props.source.width, height: props.source.height }))
const ratio = computed(() => {
  const r = preset.value === 'original' ? props.source.width / props.source.height : preset.value === 'square' ? 1 : preset.value === '4:3' ? 4 / 3 : preset.value === '16:9' ? 16 / 9 : undefined
  return r && portrait.value ? 1 / r : r
})
const imageStyle = computed(() => {
  const box = containedSize(Math.max(0, stageSize.value.width - 48), Math.max(0, stageSize.value.height - 48), props.source.width / props.source.height)
  return { width: `${box.width}px`, height: `${box.height}px` }
})
const selectionStyle = computed(() => ({ left: `${100 * draft.value.x / props.source.width}%`, top: `${100 * draft.value.y / props.source.height}%`, width: `${100 * draft.value.width / props.source.width}%`, height: `${100 * draft.value.height / props.source.height}%` }))
const handles: { id: Handle; name: string }[] = [
  { id: 'nw', name: 'Esquina superior izquierda' }, { id: 'n', name: 'Borde superior' }, { id: 'ne', name: 'Esquina superior derecha' },
  { id: 'w', name: 'Borde izquierdo' }, { id: 'e', name: 'Borde derecho' },
  { id: 'sw', name: 'Esquina inferior izquierda' }, { id: 's', name: 'Borde inferior' }, { id: 'se', name: 'Esquina inferior derecha' },
]
let observer: ResizeObserver | undefined
let gesture: { pointer: number; handle?: Handle; start: Crop; point: { x: number; y: number }; target: HTMLElement } | undefined
function position(event: { clientX: number; clientY: number }) {
  const box = image.value!.getBoundingClientRect()
  return { x: (event.clientX - box.left) * props.source.width / box.width, y: (event.clientY - box.top) * props.source.height / box.height }
}
function start(event: PointerEvent, handle?: Handle) {
  if (event.button !== 0 || gesture) return
  event.preventDefault()
  const target = event.currentTarget as HTMLElement
  target.focus({ preventScroll: true })
  target.setPointerCapture(event.pointerId)
  gesture = { pointer: event.pointerId, handle, start: { ...draft.value }, point: position(event), target }
}
function move(event: PointerEvent) {
  if (!gesture || gesture.pointer !== event.pointerId) return
  const point = position(event)
  draft.value = gesture.handle ? resizeSelection(gesture.start, gesture.handle, point, props.source, ratio.value) : moveSelection(gesture.start, point.x - gesture.point.x, point.y - gesture.point.y, props.source)
}
function end(event?: PointerEvent) {
  if (!gesture || (event && gesture.pointer !== event.pointerId)) return
  const old = gesture
  gesture = undefined
  if (old.target.hasPointerCapture(old.pointer)) old.target.releasePointerCapture(old.pointer)
}
function changeRatio() {
  end()
  if (ratio.value) draft.value = fitSelection(full.value, ratio.value)
}
function reset() { end(); preset.value = 'free'; portrait.value = false; draft.value = { ...full.value } }
function cancel() { dialog.value?.close(); emit('cancel') }
function apply() { if (validSelection(draft.value, props.source)) { dialog.value?.close(); emit('apply', { ...draft.value }) } }
function key(event: KeyboardEvent, handle?: Handle) {
  const offsets: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
  const delta = offsets[event.key]
  if (!delta || event.ctrlKey || event.metaKey || event.altKey) return
  event.preventDefault(); event.stopPropagation()
  const step = event.shiftKey ? 0.05 : 0.005
  const dx = delta[0] * props.source.width * step, dy = delta[1] * props.source.height * step
  if (!handle) draft.value = moveSelection(draft.value, dx, dy, props.source)
  else {
    const rect = draft.value
    const point = { x: handle.includes('w') ? rect.x : handle.includes('e') ? rect.x + rect.width : rect.x + rect.width / 2, y: handle.includes('n') ? rect.y : handle.includes('s') ? rect.y + rect.height : rect.y + rect.height / 2 }
    draft.value = resizeSelection(rect, handle, { x: point.x + dx, y: point.y + dy }, props.source, ratio.value)
  }
}
onMounted(() => {
  dialog.value!.showModal()
  observer = new ResizeObserver(([entry]) => { if (entry) { end(); stageSize.value = { width: entry.contentRect.width, height: entry.contentRect.height } } })
  observer.observe(stage.value!)
})
onBeforeUnmount(() => { end(); observer?.disconnect() })
</script>

<template>
  <dialog ref="dialog" class="crop-dialog" aria-labelledby="crop-title" aria-describedby="crop-help" @cancel.prevent="cancel">
    <div class="crop-dialog-header"><h2 id="crop-title">Recortar imagen</h2><button type="button" class="crop-close" aria-label="Cancelar recorte" @click="cancel">×</button></div>
    <p id="crop-help">Arrastra el centro para mover la selección y los bordes para recortar. Con teclado, enfoca el centro o un borde y usa las flechas; Mayús aumenta el paso.</p>
    <div class="crop-options">
      <label>Proporción<select v-model="preset" @change="changeRatio"><option value="free">Libre</option><option value="original">Original</option><option value="square">Cuadrado</option><option value="4:3">4:3</option><option value="16:9">16:9</option></select></label>
      <label v-if="ratio && preset !== 'square'" class="crop-orientation"><input v-model="portrait" type="checkbox" @change="changeRatio" /> Invertir orientación</label>
      <button type="button" class="crop-secondary" @click="reset">Restablecer</button>
    </div>
    <div ref="stage" class="crop-editor-stage">
      <div ref="image" class="crop-editor-image" :style="imageStyle">
        <CropPreview :source="source" :crop="full" />
        <div class="crop-selection" :style="selectionStyle">
          <button type="button" class="crop-move" aria-label="Mover selección de recorte" @pointerdown="start($event)" @pointermove="move" @pointerup="end" @pointercancel="end" @lostpointercapture="end" @keydown="key($event)"><span class="crop-thirds" aria-hidden="true" /></button>
          <button v-for="handle in handles" :key="handle.id" type="button" class="crop-handle" :class="`handle-${handle.id}`" :aria-label="handle.name" @pointerdown.stop="start($event, handle.id)" @pointermove="move" @pointerup="end" @pointercancel="end" @lostpointercapture="end" @keydown="key($event, handle.id)"><span aria-hidden="true" /></button>
        </div>
      </div>
    </div>
    <p class="crop-summary" aria-live="polite">{{ Math.round(draft.width) }} × {{ Math.round(draft.height) }} píxeles originales · proporción {{ (draft.width / draft.height).toFixed(3) }}:1</p>
    <div class="crop-dialog-footer"><button type="button" class="crop-secondary" @click="cancel">Cancelar</button><button type="button" class="crop-apply" :disabled="!validSelection(draft, source)" @click="apply">Aplicar recorte</button></div>
  </dialog>
</template>

<style scoped>
.crop-dialog { width: min(920px, 96vw); max-height: 96dvh; padding: 24px; border: 1px solid #c4ceb9; border-radius: 12px; background: #fcfbf7; color: #29372e; overflow: auto; }
.crop-dialog::backdrop { background: #18261ed0; }
.crop-dialog-header { display: flex; justify-content: space-between; align-items: center; }
.crop-dialog-header h2 { font-size: 20px; margin: 0; }
.crop-close { border: 0; background: none; color: inherit; font-size: 28px; min-width: 44px; min-height: 44px; }
#crop-help { font-size: 12px; line-height: 1.6; margin: 8px 0 18px; }
.crop-options { display: flex; align-items: end; flex-wrap: wrap; gap: 12px 20px; margin-bottom: 18px; font-size: 12px; }
.crop-options label:first-child { display: grid; gap: 6px; }
.crop-options select { min-height: 44px; padding: 8px 12px; border: 1px solid #c4ceb9; border-radius: 5px; font: inherit; background: #fffefa; }
.crop-orientation { display: flex; align-items: center; min-height: 44px; gap: 8px; }
.crop-editor-stage { position: relative; height: clamp(240px, 52dvh, 540px); background: #202820; border-radius: 5px; overflow: hidden; }
.crop-editor-image { position: absolute; inset: 0; margin: auto; }
.crop-editor-image :deep(canvas) { width: 100%; height: 100%; max-width: none; max-height: none; }
.crop-selection { position: absolute; outline: 2px solid white; box-shadow: 0 0 0 9999px #0009; }
.crop-move { position: absolute; inset: 0; padding: 0; border: 0; background: transparent; cursor: move; touch-action: none; }
.crop-thirds { position: absolute; inset: 0; background: linear-gradient(to right, transparent 33.1%, #fff7 33.1%, #fff7 33.5%, transparent 33.5%, transparent 66.4%, #fff7 66.4%, #fff7 66.8%, transparent 66.8%), linear-gradient(to bottom, transparent 33.1%, #fff7 33.1%, #fff7 33.5%, transparent 33.5%, transparent 66.4%, #fff7 66.4%, #fff7 66.8%, transparent 66.8%); }
.crop-handle { position: absolute; width: 44px; height: 44px; padding: 0; border: 0; background: none; touch-action: none; transform: translate(-50%, -50%); }
.crop-handle span { display: block; width: 14px; height: 14px; margin: auto; background: white; border: 1px solid #29372e; border-radius: 3px; }
.handle-nw { left: 0; top: 0; cursor: nwse-resize; } .handle-n { left: 50%; top: 0; cursor: ns-resize; } .handle-ne { left: 100%; top: 0; cursor: nesw-resize; }
.handle-w { left: 0; top: 50%; cursor: ew-resize; } .handle-e { left: 100%; top: 50%; cursor: ew-resize; }
.handle-sw { left: 0; top: 100%; cursor: nesw-resize; } .handle-s { left: 50%; top: 100%; cursor: ns-resize; } .handle-se { left: 100%; top: 100%; cursor: nwse-resize; }
.crop-summary { font-size: 12px; color: #65765b; margin: 14px 0; }
.crop-dialog-footer { display: flex; justify-content: flex-end; gap: 12px; }
.crop-apply, .crop-secondary { min-height: 44px; padding: 9px 16px; border-radius: 5px; border: 1px solid #687c60; font: inherit; font-size: 13px; }
.crop-apply { background: #48653d; color: white; } .crop-secondary { background: #fffefa; color: #344331; }
@media (max-width: 600px) { .crop-dialog { width: 100vw; height: 100dvh; max-width: none; max-height: none; margin: 0; border-radius: 0; padding: 16px; } .crop-editor-stage { height: 48dvh; } }
</style>
