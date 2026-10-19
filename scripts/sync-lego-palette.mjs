// Offline generator: explicit BrickLink ↔ LDraw crosswalk, never a CSS swatch or name-only join.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const root = new URL('../', import.meta.url)
const csv = readFileSync(new URL('data/lego-color-reference.csv', root), 'utf8').trim().split(/\r?\n/)
if (csv.shift() !== 'bricklink_id,bricklink_name,ldraw_code,ldraw_name,rgb,previous_css_rgb') throw new Error('Cabecera de referencia desconocida.')
const rows = csv.map((line) => {
  const fields = line.split(',') // This reviewed subset contains no commas or quoted fields.
  if (fields.length !== 6) throw new Error('Fila de referencia no válida.')
  const [id, name, code, ldrawName, rgb] = fields
  if (!/^\d+$/.test(id) || !/^\d+$/.test(code) || !/^[0-9A-F]{6}$/.test(rgb) || !name || !ldrawName) throw new Error('Referencia RGB no válida.')
  return { id: `BL-${id}`, bricklinkId: Number(id), name, hex: `#${rgb}`, ldrawCode: Number(code), ldrawName }
})
if (rows.length !== 55 || new Set(rows.map((r) => r.id)).size !== 55 || new Set(rows.map((r) => r.ldrawCode)).size !== 55) throw new Error('El catálogo requiere 55 referencias únicas.')
const path = new URL('src/core/lego.ts', root)
const current = readFileSync(path, 'utf8')
const start = current.indexOf('[\n'), end = current.indexOf(' satisfies')
if (start < 0 || end < start) throw new Error('No se encuentra la paleta generada.')
const generated = current.slice(0, start) + JSON.stringify(rows, null, 2) + current.slice(end)
if (process.argv.includes('--check')) {
  if (generated !== current) throw new Error('La paleta no coincide con su referencia. Ejecuta node scripts/sync-lego-palette.mjs y revisa el diff.')
  console.log('55 referencias RGB LEGO verificadas.')
} else {
  writeFileSync(path, generated)
  console.log(`Paleta generada: ${fileURLToPath(path)}`)
}
