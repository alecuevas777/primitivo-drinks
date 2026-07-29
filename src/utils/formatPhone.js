export function formatPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (!digits) return ''

  let normalized = digits

  if (normalized.length === 8) {
    normalized = `569${normalized}`
  } else if (normalized.length === 9 && normalized.startsWith('9')) {
    normalized = `56${normalized}`
  }

  if (normalized.startsWith('569') && normalized.length === 11) {
    const local = normalized.slice(3)
    return `+56 9 ${local.slice(0, 4)} ${local.slice(4)}`
  }

  if (normalized.startsWith('56') && normalized.length > 2) {
    const rest = normalized.slice(2)
    if (rest.length >= 9) {
      return `+56 ${rest.slice(0, 1)} ${rest.slice(1, 5)} ${rest.slice(5)}`
    }
    return `+56 ${rest}`
  }

  return `+${digits}`
}
