<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PaletteColor } from '../core/mosaic'
const props = defineProps<{ colors: (PaletteColor & { bricklinkId: number })[] }>()
const selected = defineModel<string[]>({ required: true })
const search = ref('')
const filtered = computed(() => props.colors.filter((color) => `${color.name} ${color.bricklinkId}`.toLowerCase().includes(search.value.toLowerCase().trim())))
</script>

<template>
  <fieldset class="lego-palette">
    <legend>{{ selected.length }} de {{ colors.length }} colores seleccionados</legend>
    <label class="color-search">Buscar nombre o ID BrickLink<input v-model="search" type="search" placeholder="Black, Blue, 11…" /></label>
    <div class="palette-actions"><button type="button" @click="selected = colors.map((color) => color.id)">Todos</button><button type="button" @click="selected = []">Ninguno</button></div>
    <div class="color-options">
      <label v-for="color in filtered" :key="color.id" class="color-option"><input v-model="selected" type="checkbox" :value="color.id" /><i :style="{ background: color.hex }" aria-hidden="true" /><span>{{ color.name }} <small>#{{ color.bricklinkId }}</small></span></label>
      <p v-if="!filtered.length" class="control-hint">No hay colores que coincidan.</p>
    </div>
  </fieldset>
</template>
