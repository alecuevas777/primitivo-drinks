import { useEffect, useMemo, useState } from 'react'
import { FiCopy, FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { PHONE_PREFIX } from '@/data/orderConfig'
import {
  calculateOrderTotals,
  createOrderDraft,
  getSelectedDeliveryZona,
  isOrderDraftValid,
  submitOrderToWhatsApp,
  validateCouponForDraft,
} from '@/services/order'
import { useCartStore } from '@/store/cartStore'
import { useConfigStore } from '@/store/configStore'
import { useDeliveryStore } from '@/store/deliveryStore'
import { useExtrasStore } from '@/store/extrasStore'
import { useUiStore } from '@/store/uiStore'
import { formatPrice, cn } from '@/utils'
import styles from './OrderConfirmModal.module.css'

const TIPO_CUENTA_LABELS = {
  corriente: 'Cuenta Corriente',
  vista: 'Cuenta Vista',
  ahorro: 'Cuenta de Ahorro',
}

function buildBankFields(bank = {}) {
  const fields = []

  if (bank.nombre?.trim()) {
    fields.push({ label: 'Titular', value: bank.nombre.trim() })
  }
  if (bank.rut?.trim()) {
    fields.push({ label: 'RUT', value: bank.rut.trim() })
  }
  if (bank.email?.trim()) {
    fields.push({ label: 'Correo', value: bank.email.trim() })
  }
  if (bank.banco?.trim()) {
    fields.push({ label: 'Banco', value: bank.banco.trim() })
  }
  if (bank.tipoCuenta?.trim()) {
    fields.push({
      label: 'Tipo de cuenta',
      value: TIPO_CUENTA_LABELS[bank.tipoCuenta] || bank.tipoCuenta,
    })
  }
  if (bank.numeroCuenta?.trim()) {
    fields.push({ label: 'Número de cuenta', value: bank.numeroCuenta.trim() })
  }

  return fields
}

function BankDetailRow({ label, value, onCopy }) {
  return (
    <div className={styles.bankRow}>
      <div className={styles.bankRowText}>
        <span className={styles.bankRowLabel}>{label}</span>
        <strong className={styles.bankRowValue}>{value}</strong>
      </div>
      <button
        type="button"
        className={styles.bankCopyBtn}
        onClick={() => onCopy(value, label)}
        aria-label={`Copiar ${label}`}
      >
        <FiCopy aria-hidden="true" />
      </button>
    </div>
  )
}

export default function OrderConfirmModal() {
  const orderModal = useUiStore((state) => state.orderModal)
  const closeOrderModal = useUiStore((state) => state.closeOrderModal)
  const clearCart = useCartStore((state) => state.clearCart)
  const deliveryGratisDesde = useConfigStore((state) => state.site.deliveryGratisDesde)
  const bank = useConfigStore((state) => state.site.bank)
  const zones = useDeliveryStore((state) => state.zones)
  const fetchZones = useDeliveryStore((state) => state.fetchZones)
  const zonesLoading = useDeliveryStore((state) => state.isLoading)
  const zonesError = useDeliveryStore((state) => state.error)
  const extras = useExtrasStore((state) => state.items)
  const fetchExtras = useExtrasStore((state) => state.fetchExtras)
  const extrasLoading = useExtrasStore((state) => state.isLoading)
  const extrasError = useExtrasStore((state) => state.error)
  const [draft, setDraft] = useState(null)
  const [couponFeedback, setCouponFeedback] = useState('')
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState('')

  const bankFields = useMemo(() => buildBankFields(bank), [bank])
  const bankCopyText = useMemo(
    () => bankFields.map((field) => `${field.label}: ${field.value}`).join('\n'),
    [bankFields],
  )

  const orderOptions = useMemo(
    () => ({
      zones,
      deliveryGratisDesde,
      extras,
    }),
    [zones, deliveryGratisDesde, extras],
  )

  useEffect(() => {
    fetchZones()
    fetchExtras()
  }, [fetchZones, fetchExtras])

  useEffect(() => {
    if (orderModal?.lines) {
      setDraft(createOrderDraft(orderModal.lines))
      setCouponFeedback('')
    } else {
      setDraft(null)
    }
  }, [orderModal])

  useEffect(() => {
    if (!orderModal) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeOrderModal()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [orderModal, closeOrderModal])

  if (!orderModal || !draft) return null

  const selectedZona = getSelectedDeliveryZona(draft, zones)
  const isValid = isOrderDraftValid(draft, zones)
  const totals = calculateOrderTotals(draft, orderOptions)

  const updateDraft = (patch) => {
    setDraft((current) => ({ ...current, ...patch }))
  }

  const handleDeliveryZonaChange = (deliveryZonaId) => {
    setDraft((current) => ({
      ...current,
      deliveryZonaId,
      couponValidated: false,
      coupon: null,
    }))
    setCouponFeedback('')
  }

  const getExtraQuantity = (extraId) => draft.extraQuantities?.[extraId] ?? 0

  const setExtraQuantity = (extraId, quantity) => {
    setDraft((current) => {
      const nextQuantities = { ...current.extraQuantities }
      if (quantity <= 0) {
        delete nextQuantities[extraId]
      } else {
        nextQuantities[extraId] = quantity
      }
      return {
        ...current,
        extraQuantities: nextQuantities,
        couponValidated: false,
        coupon: null,
      }
    })
    setCouponFeedback('')
  }

  const handleExtraToggle = (extraId) => {
    const currentQty = getExtraQuantity(extraId)
    setExtraQuantity(extraId, currentQty > 0 ? 0 : 1)
  }

  const handleExtraQuantityDelta = (extraId, delta) => {
    const nextQty = Math.max(0, getExtraQuantity(extraId) + delta)
    setExtraQuantity(extraId, nextQty)
  }

  const handleCouponToggle = (hasCoupon) => {
    setDraft((current) => ({
      ...current,
      hasCoupon,
      couponCode: hasCoupon ? current.couponCode : '',
      couponValidated: false,
      coupon: null,
    }))
    setCouponFeedback('')
  }

  const handleValidateCoupon = async () => {
    if (!draft.couponCode.trim()) {
      setCouponFeedback('Ingresa un código de cupón.')
      return
    }

    if (!draft.deliveryZonaId) {
      setCouponFeedback('Selecciona tu comuna antes de validar el cupón.')
      return
    }

    setIsValidatingCoupon(true)
    setCouponFeedback('')

    try {
      const coupon = await validateCouponForDraft(draft, orderOptions)

      setDraft((current) => ({
        ...current,
        couponValidated: true,
        coupon,
      }))
      setCouponFeedback(
        coupon.description
          ? `Cupón "${coupon.code}" aplicado: ${coupon.description}`
          : `Cupón "${coupon.code}" aplicado.`,
      )
    } catch (error) {
      setDraft((current) => ({
        ...current,
        couponValidated: false,
        coupon: null,
      }))
      setCouponFeedback(error.message || 'Cupón no válido. Intenta con otro código.')
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    updateDraft({ customerPhone: digits })
  }

  const handleCopyText = async (text, label) => {
    if (!text?.trim()) return

    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback(`${label} copiado`)
    } catch {
      setCopyFeedback('No se pudo copiar. Intenta de nuevo.')
    }

    window.setTimeout(() => setCopyFeedback(''), 2200)
  }

  const handleCopyAllBankDetails = () => {
    if (!bankCopyText) return
    handleCopyText(bankCopyText, 'Datos bancarios')
  }

  const handleSubmit = () => {
    if (!submitOrderToWhatsApp(draft, orderOptions)) return

    if (orderModal.source === 'cart') {
      clearCart()
    }

    closeOrderModal()
  }

  const deliveryLabel = (() => {
    if (totals.deliveryDiscount > 0) {
      if (totals.deliveryFreeReason === 'threshold') return 'Gratis'
      if (totals.deliveryFreeReason === 'coupon') return 'Gratis (cupón)'
      return 'Gratis'
    }
    return selectedZona ? `+${formatPrice(totals.deliveryFee)}` : 'Selecciona comuna'
  })()

  return (
    <div className={styles.root} role="presentation">
      <div className={styles.overlay} onClick={closeOrderModal} aria-hidden="true" />

      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        <header className={styles.header}>
          <div>
            <h2 id="order-modal-title" className={styles.title}>
              Confirmar pedido
            </h2>
            <ul className={styles.summary}>
              {draft.lines.map((line) => (
                <li key={line.id}>
                  {line.quantity} x {line.name}
                  {line.variantName ? ` · ${line.variantName}` : ''} · {formatPrice(line.price)} c/u
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeOrderModal}
            aria-label="Cerrar"
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>¿Tienes un cupón?</h3>

            <div className={styles.couponToggle}>
              <button
                type="button"
                className={cn(
                  styles.couponBtn,
                  !draft.hasCoupon && styles.couponBtnActive,
                )}
                onClick={() => handleCouponToggle(false)}
              >
                No
              </button>
              <button
                type="button"
                className={cn(
                  styles.couponBtn,
                  draft.hasCoupon && styles.couponBtnActive,
                )}
                onClick={() => handleCouponToggle(true)}
              >
                Sí, tengo cupón
              </button>
            </div>

            {draft.hasCoupon && (
              <>
                <div className={styles.couponRow}>
                  <input
                    type="text"
                    className={styles.couponInput}
                    placeholder="EJ: ENVIO30"
                    value={draft.couponCode}
                    onChange={(event) => {
                      updateDraft({
                        couponCode: event.target.value.toUpperCase(),
                        couponValidated: false,
                        coupon: null,
                      })
                      setCouponFeedback('')
                    }}
                  />
                  <button
                    type="button"
                    className={styles.validateBtn}
                    onClick={handleValidateCoupon}
                    disabled={isValidatingCoupon}
                  >
                    {isValidatingCoupon ? 'Validando...' : 'Validar'}
                  </button>
                </div>
                {couponFeedback && (
                  <p
                    className={cn(
                      styles.feedback,
                      draft.couponValidated ? styles.feedbackSuccess : styles.feedbackError,
                    )}
                  >
                    {couponFeedback}
                  </p>
                )}
              </>
            )}
          </section>

          {extras.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>¿Deseas agregar extras?</h3>
              <p className={styles.sectionHint}>
                Opcional. Puedes sumar productos adicionales a tu pedido.
              </p>

              {extrasLoading ? (
                <p className={styles.sectionHint}>Cargando extras...</p>
              ) : extrasError ? (
                <p className={cn(styles.feedback, styles.feedbackError)}>{extrasError}</p>
              ) : (
                <div className={styles.extrasGrid}>
                  {extras.map((extra) => {
                    const extraId = extra.id_ingrediente_extra
                    const quantity = getExtraQuantity(extraId)
                    const isActive = quantity > 0

                    return (
                      <button
                        key={extraId}
                        type="button"
                        className={cn(styles.extraBtn, isActive && styles.extraBtnActive)}
                        onClick={() => handleExtraToggle(extraId)}
                      >
                        <span>{extra.nom_ingrediente}</span>
                        {isActive ? (
                          <span
                            className={styles.extraQtyControls}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              aria-label={`Disminuir ${extra.nom_ingrediente}`}
                              onClick={() => handleExtraQuantityDelta(extraId, -1)}
                            >
                              −
                            </button>
                            <span className={styles.extraQtyValue}>{quantity}</span>
                            <button
                              type="button"
                              aria-label={`Aumentar ${extra.nom_ingrediente}`}
                              onClick={() => handleExtraQuantityDelta(extraId, 1)}
                            >
                              +
                            </button>
                          </span>
                        ) : (
                          <strong>{formatPrice(Number(extra.precio_extra))}</strong>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Tus datos</h3>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Nombre</span>
              <input
                type="text"
                className={styles.fieldInput}
                placeholder="Tu nombre completo"
                value={draft.customerName}
                onChange={(event) => updateDraft({ customerName: event.target.value })}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Número de celular</span>
              <div className={styles.phoneRow}>
                <span className={styles.phonePrefix}>{PHONE_PREFIX}</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  className={styles.phoneInput}
                  placeholder="87073838"
                  value={draft.customerPhone}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                />
              </div>
              <p className={styles.fieldHint}>
                Solo los 8 dígitos después del +56 9 (ej. 12 34 56 78 → escribes 12345678)
              </p>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Correo electrónico (opcional)</span>
              <input
                type="email"
                className={styles.fieldInput}
                placeholder="correo@ejemplo.com"
                value={draft.customerEmail}
                onChange={(event) => updateDraft({ customerEmail: event.target.value })}
              />
              <p className={styles.fieldHint}>
                No es necesario completarlo para confirmar tu pedido.
              </p>
            </label>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Dirección de entrega</h3>
            <p className={styles.sectionHint}>
              Solo realizamos delivery. Selecciona tu comuna y luego indica tu dirección.
            </p>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Comuna</span>
              <select
                className={styles.fieldSelect}
                value={draft.deliveryZonaId}
                onChange={(event) => handleDeliveryZonaChange(event.target.value)}
                disabled={zonesLoading || zones.length === 0}
              >
                <option value="">
                  {zonesLoading ? 'Cargando comunas...' : 'Selecciona tu comuna'}
                </option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.comuna} · {formatPrice(Number(zone.costo))}
                  </option>
                ))}
              </select>
              {zonesError && <p className={styles.fieldHint}>{zonesError}</p>}
              {selectedZona?.tiempo_estimado && (
                <p className={styles.fieldHint}>
                  Tiempo estimado de entrega: {selectedZona.tiempo_estimado}
                </p>
              )}
              {deliveryGratisDesde != null && (
                <p className={styles.fieldHint}>
                  Envío gratis en pedidos desde {formatPrice(deliveryGratisDesde)}.
                </p>
              )}
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Dirección</span>
              <input
                type="text"
                className={styles.fieldInput}
                placeholder="Calle, número, depto/casa"
                value={draft.deliveryAddress}
                onChange={(event) => updateDraft({ deliveryAddress: event.target.value })}
              />
            </label>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Método de pago</h3>
            <p className={styles.sectionHint}>Elige cómo quieres pagar tu pedido.</p>

            <div className={styles.couponToggle} role="group" aria-label="Método de pago">
              <button
                type="button"
                className={cn(
                  styles.couponBtn,
                  draft.paymentMethod === 'efectivo' && styles.couponBtnActive,
                )}
                onClick={() => updateDraft({ paymentMethod: 'efectivo' })}
              >
                Efectivo
              </button>
              <button
                type="button"
                className={cn(
                  styles.couponBtn,
                  draft.paymentMethod === 'transferencia' && styles.couponBtnActive,
                )}
                onClick={() => updateDraft({ paymentMethod: 'transferencia' })}
              >
                Transferencia
              </button>
            </div>

            {draft.paymentMethod === 'efectivo' ? (
              <p className={cn(styles.sectionHint, styles.paymentHint)}>
                Pagas en efectivo al recibir tu pedido.
              </p>
            ) : (
              <>
                <p className={cn(styles.sectionHint, styles.paymentHint)}>
                  Usa estos datos y envía el comprobante por WhatsApp.
                </p>

                {bankFields.length > 0 ? (
                  <div className={styles.bankBox}>
                    {bankFields.map((field) => (
                      <BankDetailRow
                        key={field.label}
                        label={field.label}
                        value={field.value}
                        onCopy={handleCopyText}
                      />
                    ))}

                    <button
                      type="button"
                      className={styles.bankCopyAllBtn}
                      onClick={handleCopyAllBankDetails}
                    >
                      <FiCopy aria-hidden="true" />
                      Copiar todos los datos
                    </button>

                    {copyFeedback && (
                      <p className={cn(styles.feedback, styles.feedbackSuccess)}>
                        {copyFeedback}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className={styles.sectionHint}>
                    Los datos bancarios aún no están configurados. Te los enviaremos por WhatsApp
                    al confirmar tu pedido.
                  </p>
                )}
              </>
            )}
          </section>

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <strong>{formatPrice(totals.subtotal)}</strong>
            </div>
            {totals.extrasSubtotal > 0 && (
              <div className={styles.totalRow}>
                <span>Incluye extras</span>
                <strong>+{formatPrice(totals.extrasSubtotal)}</strong>
              </div>
            )}
            {totals.subtotalDiscount > 0 && (
              <div className={styles.totalRow}>
                <span>Descuento</span>
                <strong>-{formatPrice(totals.subtotalDiscount)}</strong>
              </div>
            )}
            <div className={styles.totalRow}>
              <span>Delivery</span>
              <strong>{deliveryLabel}</strong>
            </div>
            <div className={cn(styles.totalRow, styles.totalRowFinal)}>
              <span>Total estimado</span>
              <strong>{formatPrice(totals.total)}</strong>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={cn(styles.submitBtn, !isValid && styles.submitBtnDisabled)}
            onClick={handleSubmit}
            disabled={!isValid}
          >
            <FaWhatsapp aria-hidden="true" />
            Continuar a WhatsApp
          </button>
        </footer>
      </div>
    </div>
  )
}
