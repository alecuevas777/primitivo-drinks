/** Convierte placeholders JSON vacíos en texto vacío para inputs. */
export function normalizeTextField(value) {
  if (value == null) return ''

  const text = String(value).trim()

  if (!text || text === '{}' || text === '[]' || text === 'null') {
    return ''
  }

  return text
}
