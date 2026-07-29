export function formatPrice(value) {
  return `$${Number(value).toLocaleString('es-CL')}`
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
