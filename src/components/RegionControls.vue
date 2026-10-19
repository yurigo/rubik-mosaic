<script setup lang="ts">
import type { PaletteColor } from '../core/mosaic'
import type { RegionRule } from '../core/regions'

defineProps<{ selecting: boolean; tolerance: number; colorId: string; palette: readonly PaletteColor[]; rules: readonly RegionRule[]; hasSelection: boolean; cellCount: number }>()
const emit = defineEmits<{ 'update:selecting': [value: boolean]; 'update:tolerance': [value: number]; 'update:colorId': [value: string]; apply: []; cancel: []; remove: [id: number]; preview: [id: number] }>()
</script>

<template>
  <section class="region-controls" aria-label="Correcciones por zonas">
    <h2>Dirige los colores</h2>
    <p class="control-hint">Selecciona una zona conectada en la imagen original y asígnale un color de tus piezas.</p>
    <button class="region-action" type="button" :aria-pressed="selecting" @click="emit('update:selecting', !selecting)">{{ selecting ? 'Volver a encuadrar' : 'Seleccionar una zona' }}</button>
    <p v-if="selecting" class="control-hint" role="status">Toca la imagen original. Con teclado: enfoca la imagen, mueve la cruz con las flechas y pulsa Intro. La marca turquesa muestra la selección.</p>
    <div v-if="hasSelection" class="region-draft">
      <label class="range-label" for="region-tolerance">Tolerancia <output>{{ tolerance }} %</output><input id="region-tolerance" type="range" min="0" max="100" :value="tolerance" @input="emit('update:tolerance', Number(($event.target as HTMLInputElement).value))" /></label>
      <label class="material-label">Transformar en<select :value="colorId" @change="emit('update:colorId', ($event.target as HTMLSelectElement).value)"><option v-for="color in palette" :key="color.id" :value="color.id">{{ color.name }}</option></select></label>
      <p class="control-hint" role="status">{{ cellCount }} casillas cubiertas al menos a la mitad.<template v-if="!cellCount"> La zona es demasiado pequeña para esta resolución; amplía el encuadre o aumenta las piezas.</template></p>
      <div class="region-actions"><button class="region-action" type="button" :disabled="!palette.length || rules.length >= 12" @click="emit('apply')">Aplicar regla</button><button class="text-button" type="button" @click="emit('cancel')">Cancelar selección</button></div>
    </div>
    <p v-if="rules.length >= 12" class="control-hint">Máximo de 12 reglas. Elimina alguna para añadir otra.</p>
    <ol v-if="rules.length" class="region-list">
      <li v-for="(rule, index) in rules" :key="rule.id">
        <div><strong>Zona {{ index + 1 }} → {{ palette.find(color => color.id === rule.colorId)?.name ?? rule.colorId }}</strong><span v-if="!palette.some(color => color.id === rule.colorId)" class="region-inactive">Inactiva: color no disponible en la paleta actual.</span></div>
        <div class="region-actions"><button type="button" class="text-button" :aria-label="`Ver zona ${index + 1}`" @click="emit('preview', rule.id)">Ver zona</button><button type="button" class="text-button" :aria-label="`Eliminar regla de zona ${index + 1}`" @click="emit('remove', rule.id)">Eliminar</button></div>
      </li>
    </ol>
    <p v-if="rules.length" class="control-hint">La última regla tiene prioridad donde coinciden. Se conservan al cambiar el encuadre; cargar otra imagen las elimina.</p>
  </section>
</template>

<style scoped>
.region-controls { border: 1px solid #d9ddd2; background: #fafbf5; padding: 18px; border-radius: 8px; margin: 16px 0; }
h2 { margin-bottom: 8px; }
.region-action { min-height: 44px; padding: 9px 15px; border: 1px solid #687c60; color: #2e4b31; background: #edf2e5; border-radius: 5px; font-size: 13px; }
.region-action[aria-pressed="true"] { background: #dfeacb; }
.region-action:disabled { opacity: .5; }
.region-draft { margin-top: 18px; max-width: 460px; }
.region-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 18px; }
.region-actions .text-button { min-height: 44px; margin: 0; }
.region-list { margin: 16px 0 0; padding: 0; list-style: none; }
.region-list li { padding: 10px 0; border-top: 1px solid #d9ddd2; font-size: 12px; }
.region-list strong { font-weight: 600; }
.region-inactive { display: block; color: #8a4525; padding-top: 4px; }
</style>
