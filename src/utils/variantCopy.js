/**
 * Copy / labels según tipo de variante del producto.
 * @param {'sabor' | 'presentacion'} tipo
 * @param {number} maxChoices
 */
export function getVariantCopy(tipo = 'sabor', maxChoices = 1) {
  const isPresentacion = tipo === 'presentacion'
  const multi = maxChoices >= 2

  if (isPresentacion) {
    return {
      tipo: 'presentacion',
      singular: 'presentación',
      plural: 'presentaciones',
      article: 'esta',
      title: multi ? 'Elige tus presentaciones' : 'Elige tu presentación',
      subtitle: multi
        ? 'Puedes elegir más de una presentación'
        : 'Selecciona una presentación para continuar',
      missing: 'Elige una presentación antes de continuar',
      maxError: (n) => `Máximo ${n} presentaciones por producto.`,
      loadError: 'No se pudieron cargar las presentaciones. Revisa tu conexión e intenta de nuevo.',
      toastDetail: 'Elige la presentación en el detalle del producto',
      toastOrder: 'Elige la presentación antes de pedir',
      adminMaxLabel: 'Presentaciones permitidas',
      adminMaxHint: 'Define cuántas presentaciones puede elegir el cliente.',
      adminOption1: '1 presentación (elige una)',
      adminOption2: 'Hasta 2 presentaciones',
      adminImageHint:
        'Por defecto el cliente solo ve nombre y precio al elegir presentación.',
    }
  }

  return {
    tipo: 'sabor',
    singular: 'sabor',
    plural: 'sabores',
    article: 'este',
    title: multi ? 'Elige tus sabores' : 'Elige tu sabor',
    subtitle: multi
      ? 'Puedes elegir 1 o 2 sabores (ej. mango + maracuyá)'
      : 'Selecciona un sabor para continuar',
    missing: 'Elige al menos un sabor antes de añadir al carrito.',
    maxError: (n) => `Máximo ${n} sabores por producto.`,
    loadError: 'No se pudieron cargar los sabores. Revisa tu conexión e intenta de nuevo.',
    toastDetail: 'Elige los sabores en el detalle del producto',
    toastOrder: 'Elige los sabores antes de pedir',
    adminMaxLabel: 'Sabores permitidos',
    adminMaxHint: 'Define cuántos sabores puede elegir el cliente en este producto.',
    adminOption1: '1 sabor (elige uno)',
    adminOption2: 'Hasta 2 sabores (mezcla, ej. mango + maracuyá)',
    adminImageHint:
      'Por defecto el cliente solo ve nombre y precio al elegir sabor. Las imágenes de cada variante se muestran en la carta únicamente si activas esta opción.',
  }
}

export function normalizeTipoVariante(value) {
  return value === 'presentacion' ? 'presentacion' : 'sabor'
}

/** Etiqueta para pack promo: "1) Frutilla, 2) Mango, 3) Tradicional" */
export function formatPromoSlots(slots = []) {
  return slots
    .map((slot, index) => `${index + 1}) ${slot?.nombre_variante ?? '—'}`)
    .join(', ')
}
