import { applyDiscountPrice } from '@/utils/productPricing'

/** Formatea selecciones de grupos: "Jack Fire · Frutilla" */
export function formatGrupoSelections(grupos = [], selectedByGrupo = {}) {
  return grupos
    .map((grupo) => {
      const selected = selectedByGrupo[grupo.id] ?? []
      if (!selected.length) return null
      const names = selected.map((opcion) => opcion.nombre_opcion).filter(Boolean)
      return names.length ? names.join(' + ') : null
    })
    .filter(Boolean)
    .join(' · ')
}

export function getSelectedGruposExtras(selectedByGrupo = {}) {
  return Object.values(selectedByGrupo)
    .flat()
    .reduce((sum, opcion) => sum + (Number(opcion?.precio_extra) || 0), 0)
}

export function getSelectedGruposPricing(productPricing, selectedByGrupo = {}) {
  const extras = getSelectedGruposExtras(selectedByGrupo)
  const basePrice = (Number(productPricing?.basePrice) || 0) + extras

  return {
    ...productPricing,
    basePrice,
    displayPrice: applyDiscountPrice(basePrice, productPricing?.discountPercent ?? 0),
    showFromPrice: false,
  }
}

export function isGrupoSelectionComplete(grupos = [], selectedByGrupo = {}) {
  return grupos.every((grupo) => {
    const selected = selectedByGrupo[grupo.id] ?? []
    const min = Math.max(0, Number(grupo.min_seleccion) || 1)
    return selected.length >= min
  })
}

export function collectSelectedOpcionIds(selectedByGrupo = {}) {
  return Object.values(selectedByGrupo)
    .flat()
    .map((opcion) => opcion.id)
    .filter((id) => id != null)
}
