import { formatPrice } from '@/utils'
import { buildWhatsAppUrl } from '@/services/whatsapp'
import { validateCupon } from '@/services/api'

export function createOrderDraft(lines) {
  return {
    lines: lines.map((line) => ({
      id: line.id,
      productId: line.productId ?? null,
      variantId: line.variantId ?? null,
      variantIds: line.variantIds ?? [],
      variantName: line.variantName ?? null,
      variants: line.variants ?? [],
      name: line.name,
      price: line.price,
      quantity: line.quantity,
      category: line.category ?? null,
      usa_variantes: Boolean(line.usa_variantes),
      usa_grupos_opcion: Boolean(line.usa_grupos_opcion),
      es_promo_sabores: Boolean(line.es_promo_sabores),
      promo_cantidad: line.promo_cantidad ?? null,
    })),
    hasCoupon: false,
    couponCode: '',
    couponValidated: false,
    coupon: null,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    deliveryZonaId: '',
    extraQuantities: {},
    paymentMethod: 'transferencia',
  }
}

function isValidEmail(email) {
  if (!email.trim()) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function isValidPhone(phone) {
  return /^\d{8}$/.test(phone.replace(/\s/g, ''))
}

export function getSelectedDeliveryZona(draft, zones = []) {
  if (!draft?.deliveryZonaId) return null
  return zones.find((zone) => String(zone.id) === String(draft.deliveryZonaId)) ?? null
}

export function getSelectedExtras(draft, extrasCatalog = []) {
  const quantities = draft.extraQuantities ?? {}

  return extrasCatalog
    .filter((item) => (quantities[item.id_ingrediente_extra] ?? 0) > 0)
    .map((item) => ({
      id: item.id_ingrediente_extra,
      name: item.nom_ingrediente,
      price: Number(item.precio_extra),
      quantity: quantities[item.id_ingrediente_extra],
    }))
}

export function getProductsSubtotal(draft) {
  return draft.lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
}

export function getExtrasSubtotal(draft, extrasCatalog = []) {
  return getSelectedExtras(draft, extrasCatalog).reduce(
    (sum, extra) => sum + extra.price * extra.quantity,
    0,
  )
}

export function getOrderSubtotal(draft, options = {}) {
  const { extras = [] } = options
  return getProductsSubtotal(draft) + getExtrasSubtotal(draft, extras)
}

export function getZoneDeliveryCost(draft, zones = []) {
  const zona = getSelectedDeliveryZona(draft, zones)
  return zona ? Number(zona.costo) : 0
}

function resolveDeliveryBeforeCoupon(draft, options = {}) {
  const { zones = [], deliveryGratisDesde = null, extras = [] } = options
  const subtotal = getOrderSubtotal(draft, { extras })
  const zoneCost = getZoneDeliveryCost(draft, zones)
  const qualifiesForFreeDelivery =
    deliveryGratisDesde != null && subtotal >= Number(deliveryGratisDesde)

  if (qualifiesForFreeDelivery) {
    return {
      deliveryFee: 0,
      deliveryDiscount: zoneCost,
      deliveryFreeReason: 'threshold',
    }
  }

  return {
    deliveryFee: zoneCost,
    deliveryDiscount: 0,
    deliveryFreeReason: null,
  }
}

function buildValidationPayload(draft, options = {}) {
  const { extras = [] } = options
  const subtotal = getOrderSubtotal(draft, { extras })
  const { deliveryFee } = resolveDeliveryBeforeCoupon(draft, options)

  return {
    codigo: draft.couponCode.trim(),
    subtotal,
    delivery_fee: deliveryFee,
    lineas: draft.lines.map((line) => ({
      product_id: line.productId,
      categoria_id: line.category != null ? Number(line.category) : null,
      precio: line.price,
      cantidad: line.quantity,
    })),
  }
}

export async function validateCouponForDraft(draft, options = {}) {
  const result = await validateCupon(buildValidationPayload(draft, options))

  return {
    ...result,
    code: result.cupon?.codigo ?? draft.couponCode.trim().toUpperCase(),
    description: result.cupon?.descripcion ?? '',
  }
}

export function isOrderDraftValid(draft, zones = []) {
  if (!draft?.lines?.length) return false

  const itemsValid = draft.lines.every((line) => {
    if (line.es_promo_sabores) {
      const expected = Number(line.promo_cantidad) || 0
      return (
        Boolean(line.variantName) &&
        Array.isArray(line.variantIds) &&
        line.variantIds.length === expected
      )
    }
    if (line.usa_grupos_opcion) {
      return Boolean(line.variantName) && Array.isArray(line.variantIds) && line.variantIds.length > 0
    }
    if (!line.usa_variantes) return true
    const hasMix =
      Array.isArray(line.variantIds) && line.variantIds.length > 0
    return Boolean(line.variantName) && (line.variantId != null || hasMix)
  })

  const customerValid =
    draft.customerName.trim().length >= 2 &&
    isValidPhone(draft.customerPhone) &&
    isValidEmail(draft.customerEmail)

  const couponValid =
    !draft.hasCoupon ||
    (draft.couponCode.trim().length > 0 && draft.couponValidated)

  const deliveryValid =
    Boolean(draft.deliveryZonaId) &&
    draft.deliveryAddress.trim().length >= 5 &&
    zones.some((zone) => String(zone.id) === String(draft.deliveryZonaId))

  return itemsValid && customerValid && couponValid && deliveryValid
}

export function calculateOrderTotals(draft, options = {}) {
  const { zones = [], deliveryGratisDesde = null, extras = [] } = options
  const productsSubtotal = getProductsSubtotal(draft)
  const extrasSubtotal = getExtrasSubtotal(draft, extras)
  const subtotal = productsSubtotal + extrasSubtotal
  const zona = getSelectedDeliveryZona(draft, zones)
  const zoneCost = zona ? Number(zona.costo) : 0
  const selectedExtras = getSelectedExtras(draft, extras)

  let subtotalDiscount = 0
  let deliveryFee = zoneCost
  let deliveryDiscount = 0
  let deliveryFreeReason = null

  const thresholdDelivery = resolveDeliveryBeforeCoupon(draft, options)
  deliveryFee = thresholdDelivery.deliveryFee
  deliveryDiscount = thresholdDelivery.deliveryDiscount
  deliveryFreeReason = thresholdDelivery.deliveryFreeReason

  if (draft.hasCoupon && draft.couponValidated && draft.coupon) {
    subtotalDiscount = Number(draft.coupon.subtotalDiscount ?? 0)
    const couponDeliveryDiscount = Number(draft.coupon.deliveryDiscount ?? 0)

    if (couponDeliveryDiscount > 0) {
      deliveryDiscount = Math.max(deliveryDiscount, couponDeliveryDiscount)
      deliveryFee = Number(draft.coupon.deliveryFee ?? 0)
      deliveryFreeReason = deliveryFreeReason ?? 'coupon'
    }
  }

  const total = Math.max(0, subtotal - subtotalDiscount + deliveryFee)

  return {
    subtotal,
    productsSubtotal,
    extrasSubtotal,
    selectedExtras,
    subtotalDiscount,
    deliveryDiscount,
    deliveryFee,
    deliveryFreeReason,
    zoneCost,
    zona,
    total,
  }
}

function formatDeliveryLine(totals) {
  if (totals.deliveryDiscount > 0) {
    if (totals.deliveryFreeReason === 'threshold') {
      return '*Delivery:* Gratis (pedido alcanza envío gratis)'
    }
    if (totals.deliveryFreeReason === 'coupon') {
      return '*Delivery:* Gratis (cupón aplicado)'
    }
    return '*Delivery:* Gratis'
  }

  return `*Delivery:* +${formatPrice(totals.deliveryFee)}`
}

export function buildConfirmOrderMessage(draft, options = {}) {
  const lines = ['Hola, me gustaría pedir:', '']

  draft.lines.forEach((line) => {
    const variantLabel = line.variantName ? ` - ${line.variantName}` : ''
    const itemLine = `${line.quantity} x ${line.name}${variantLabel} (${formatPrice(line.price)} c/u)`
    lines.push(itemLine)
  })

  const totals = calculateOrderTotals(draft, options)
  const selectedExtras = totals.selectedExtras

  if (selectedExtras.length > 0) {
    lines.push('')
    lines.push('*Extras:*')
    selectedExtras.forEach((extra) => {
      lines.push(`${extra.quantity} x ${extra.name} (${formatPrice(extra.price)} c/u)`)
    })
  }

  lines.push('')
  lines.push(`*Nombre:* ${draft.customerName.trim()}`)
  lines.push(`*Número de celular:* +56 9 ${draft.customerPhone.replace(/\s/g, '')}`)

  if (draft.customerEmail.trim()) {
    lines.push(`*Correo:* ${draft.customerEmail.trim()}`)
  }

  lines.push(
    '',
    `*Método de pago:* ${
      draft.paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia'
    }`,
  )

  const zona = totals.zona

  lines.push(`*Subtotal:* ${formatPrice(totals.subtotal)}`)

  if (totals.subtotalDiscount > 0) {
    lines.push(`*Descuento:* -${formatPrice(totals.subtotalDiscount)}`)
  }

  lines.push(formatDeliveryLine(totals))

  if (zona) {
    lines.push(`*Comuna:* ${zona.comuna}`)
    if (zona.tiempo_estimado) {
      lines.push(`*Tiempo estimado:* ${zona.tiempo_estimado}`)
    }
  }

  lines.push(`*Dirección:* ${draft.deliveryAddress.trim()}`)

  if (draft.hasCoupon && draft.couponValidated) {
    lines.push(`*Cupón:* ${draft.couponCode.trim().toUpperCase()}`)
  } else {
    lines.push('*Cupón:* No')
  }

  lines.push('', `*Total estimado:* ${formatPrice(totals.total)}`)

  return lines.join('\n')
}

export function submitOrderToWhatsApp(draft, options = {}) {
  if (!isOrderDraftValid(draft, options.zones ?? [])) return false

  const message = buildConfirmOrderMessage(draft, options)
  const url = buildWhatsAppUrl(message)

  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}
