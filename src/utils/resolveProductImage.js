const API_ORIGIN = (import.meta.env.VITE_API_URL || '/api').replace(
  /\/api\/?$/,
  '',
)

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1551538826-ba0e4b3e0f52?w=400&h=400&fit=crop&auto=format&q=75'

export function resolveProductImage(src) {
  if (!src?.trim()) return PLACEHOLDER

  const value = src.trim()

  if (/^https?:\/\//i.test(value)) return value

  if (value.startsWith('/uploads/')) return `${API_ORIGIN}${value}`

  if (value.startsWith('uploads/')) return `${API_ORIGIN}/${value}`

  return `${API_ORIGIN}/uploads/productos/${value.replace(/^\/+/, '')}`
}

/** Imagen de variante: prioriza img_variante y cae al producto o placeholder. */
export function resolveVariantImage(variant, productImage) {
  const raw = String(variant?.img_variante ?? '').trim()
  if (raw) return resolveProductImage(raw)

  if (variant?.image) return variant.image

  return productImage || PLACEHOLDER
}

export { API_ORIGIN, PLACEHOLDER }
