import type { Raster } from '../core/mosaic'

export async function readImage(file: File): Promise<Raster> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Elige una imagen JPG, PNG o WebP.')
  if (file.size > 20 * 1024 * 1024) throw new Error('La imagen debe ocupar menos de 20 MiB.')
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    if (image.naturalWidth * image.naturalHeight > 25_000_000) throw new Error('La imagen supera los 25 megapíxeles. Prueba una versión más pequeña.')
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('No se ha podido abrir la imagen en este navegador.')
    context.drawImage(image, 0, 0)
    return { width: canvas.width, height: canvas.height, data: context.getImageData(0, 0, canvas.width, canvas.height).data }
  } catch (error) {
    if (error instanceof DOMException) throw new Error('No se ha podido leer esa imagen. Comprueba que el archivo sea válido.')
    throw error
  } finally { URL.revokeObjectURL(url) }
}

/** Built-in illustration: no network request or user image required. */
export function createExample(): Raster {
  const canvas = document.createElement('canvas')
  canvas.width = 720
  canvas.height = 720
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#f5efdb'
  ctx.fillRect(0, 0, 720, 720)
  const sun = ctx.createRadialGradient(470, 210, 5, 470, 210, 135)
  sun.addColorStop(0, '#ffdb60')
  sun.addColorStop(1, '#ef7336')
  ctx.fillStyle = sun
  ctx.beginPath(); ctx.arc(470, 210, 135, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#167c7e'
  ctx.beginPath(); ctx.moveTo(0, 450); ctx.lineTo(240, 150); ctx.lineTo(560, 600); ctx.lineTo(0, 720); ctx.fill()
  ctx.fillStyle = '#11449a'
  ctx.beginPath(); ctx.moveTo(260, 720); ctx.lineTo(560, 330); ctx.lineTo(720, 490); ctx.lineTo(720, 720); ctx.fill()
  const hill = ctx.createLinearGradient(0, 440, 720, 720)
  hill.addColorStop(0, '#e49c44'); hill.addColorStop(1, '#b83e36')
  ctx.fillStyle = hill
  ctx.beginPath(); ctx.moveTo(0, 560); ctx.bezierCurveTo(300, 350, 330, 780, 720, 550); ctx.lineTo(720, 720); ctx.lineTo(0, 720); ctx.fill()
  return { width: 720, height: 720, data: ctx.getImageData(0, 0, 720, 720).data }
}
