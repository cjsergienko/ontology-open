/**
 * Client-side image compression for the upload flow.
 *
 * Phone-camera screenshots commonly weigh 5-15 MB and blow past per-request
 * size limits even before staging. We re-encode any image >= 1.5 MB as JPEG
 * with longest-dimension <= 2000px and quality 0.85.
 *
 * Returns the original File unchanged if:
 *  - it isn't an image, or
 *  - it's already small (< 1.5 MB), or
 *  - it's a small JPEG (< 4 MB) — already compressed.
 *
 * Falls back to the original File on any decode/encode error.
 */

const SMALL_IMAGE_BYTES = 1_500_000 // 1.5 MB
const SMALL_JPEG_BYTES = 4_000_000  // 4 MB
const MAX_DIMENSION = 2000
const JPEG_QUALITY = 0.85

function isJpeg(file: File): boolean {
  return file.type === 'image/jpeg' || file.type === 'image/jpg'
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to decode image'))
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Canvas toBlob returned null'))),
      type,
      quality
    )
  })
}

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (file.size < SMALL_IMAGE_BYTES) return file
  if (isJpeg(file) && file.size < SMALL_JPEG_BYTES) return file

  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const { width, height } = img
    const longest = Math.max(width, height)
    const scale = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1
    const targetW = Math.round(width * scale)
    const targetH = Math.round(height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(img, 0, 0, targetW, targetH)
    const blob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY)

    // If we somehow made the image larger, keep the original.
    if (blob.size >= file.size) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return file
  } finally {
    URL.revokeObjectURL(url)
  }
}
