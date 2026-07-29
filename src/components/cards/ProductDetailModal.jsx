import { useEffect, useState } from 'react'
import { FiEye, FiMinus, FiPlus, FiShoppingCart, FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'
import ProductTags from '@/components/cards/ProductTags'
import { useMenuStore, mapVariante, mapGrupoOpcion } from '@/store/menuStore'
import { useCartStore } from '@/store/cartStore'
import { useUiStore } from '@/store/uiStore'
import { getProductById } from '@/services/api'
import { useProductPricing, useSelectedVariantsPricing } from '@/hooks/useProductPricing'
import {
  formatPrice,
  formatVariantNames,
  getVariantPricing,
  PLACEHOLDER,
  resolveVariantImage,
  formatGrupoSelections,
  getSelectedGruposPricing,
  isGrupoSelectionComplete,
  collectSelectedOpcionIds,
} from '@/utils'
import { formatPromoSlots, getVariantCopy } from '@/utils/variantCopy'
import styles from './ProductDetailModal.module.css'

export default function ProductDetailModal() {
  const categories = useMenuStore((state) => state.categories)
  const product = useUiStore((state) => state.productDetail)
  const closeProductDetail = useUiStore((state) => state.closeProductDetail)
  const openOrderModal = useUiStore((state) => state.openOrderModal)
  const addItem = useCartStore((state) => state.addItem)
  const [quantity, setQuantity] = useState(1)
  const [variants, setVariants] = useState([])
  const [selectedVariants, setSelectedVariants] = useState([])
  const [promoSlots, setPromoSlots] = useState([])
  const [gruposOpcion, setGruposOpcion] = useState([])
  const [selectedByGrupo, setSelectedByGrupo] = useState({})
  const [isLoadingVariants, setIsLoadingVariants] = useState(false)
  const [variantsError, setVariantsError] = useState('')
  const [imageError, setImageError] = useState(false)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const pricing = useProductPricing(product)
  const selectedPricing = useSelectedVariantsPricing(product, selectedVariants)
  const gruposPricing = getSelectedGruposPricing(pricing, selectedByGrupo)

  const isPromoPack = Boolean(product?.es_promo_sabores)
  const promoCount = isPromoPack ? Number(product.promo_cantidad) || 0 : 0
  const usesGrupos = Boolean(product?.usa_grupos_opcion)
  const needsVariantLoad = Boolean(product?.usa_variantes || isPromoPack)
  const needsGrupoLoad = usesGrupos

  useEffect(() => {
    if (product) {
      setQuantity(1)
      setSelectedVariants([])
      setSelectedByGrupo({})
      setPromoSlots(
        isPromoPack && promoCount > 0 ? Array.from({ length: promoCount }, () => null) : [],
      )
      setVariants([])
      setGruposOpcion([])
      setVariantsError('')
      setIsImagePreviewOpen(false)
    }
  }, [product, isPromoPack, promoCount])

  useEffect(() => {
    if (!product) return undefined

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (isImagePreviewOpen) {
        setIsImagePreviewOpen(false)
        return
      }
      closeProductDetail()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [product, closeProductDetail, isImagePreviewOpen])

  useEffect(() => {
    if (!needsVariantLoad) return undefined

    let cancelled = false

    const applyVariants = (loaded) => {
      setVariants(loaded)
      if (!isPromoPack) {
        setSelectedVariants(loaded[0] ? [loaded[0]] : [])
      }
      setVariantsError('')
    }

    const cached = (product.variantes ?? []).map(mapVariante)
    if (cached.length) {
      applyVariants(cached)
      setIsLoadingVariants(false)
      return undefined
    }

    async function loadVariants() {
      setIsLoadingVariants(true)
      setVariantsError('')

      try {
        const detail = await getProductById(product.id, { timeout: 8000, retries: 1 })
        if (cancelled) return
        const loaded = (detail.variantes ?? []).map(mapVariante)
        applyVariants(loaded)
      } catch {
        if (cancelled) return
        setVariantsError(getVariantCopy(product.tipo_variante || 'sabor').loadError)
      } finally {
        if (!cancelled) setIsLoadingVariants(false)
      }
    }

    loadVariants()

    return () => {
      cancelled = true
    }
  }, [product, needsVariantLoad, isPromoPack])

  useEffect(() => {
    if (!needsGrupoLoad || !product) return undefined

    const cached = (product.grupos_opcion ?? []).map(mapGrupoOpcion)
    if (cached.length) {
      setGruposOpcion(cached)
      const initial = {}
      cached.forEach((grupo) => {
        if (grupo.opciones?.[0] && Number(grupo.min_seleccion) > 0) {
          initial[grupo.id] = [grupo.opciones[0]]
        } else {
          initial[grupo.id] = []
        }
      })
      setSelectedByGrupo(initial)
      return undefined
    }

    let cancelled = false

    async function loadGrupos() {
      setIsLoadingVariants(true)
      try {
        const detail = await getProductById(product.id, { timeout: 8000, retries: 1 })
        if (cancelled) return
        const loaded = (detail.grupos_opcion ?? []).map(mapGrupoOpcion)
        setGruposOpcion(loaded)
        const initial = {}
        loaded.forEach((grupo) => {
          if (grupo.opciones?.[0] && Number(grupo.min_seleccion) > 0) {
            initial[grupo.id] = [grupo.opciones[0]]
          } else {
            initial[grupo.id] = []
          }
        })
        setSelectedByGrupo(initial)
        setVariantsError('')
      } catch {
        if (cancelled) return
        setVariantsError('No se pudieron cargar las opciones. Revisa tu conexión e intenta de nuevo.')
      } finally {
        if (!cancelled) setIsLoadingVariants(false)
      }
    }

    loadGrupos()
    return () => {
      cancelled = true
    }
  }, [product, needsGrupoLoad])

  const primarySelected = isPromoPack
    ? promoSlots.find(Boolean) ?? null
    : (selectedVariants[0] ?? null)
  const displayImage = product
    ? product.usa_variantes && product.mostrar_imagen_variantes
      ? resolveVariantImage(primarySelected, product.image)
      : product.image
    : PLACEHOLDER

  useEffect(() => {
    setImageError(false)
  }, [displayImage])

  if (!product) return null

  const categoryName =
    categories.find((cat) => cat.id === product.category)?.name ?? null

  const currentPrice = usesGrupos
    ? gruposPricing.displayPrice
    : isPromoPack
      ? pricing.displayPrice
      : selectedVariants.length
        ? selectedPricing.displayPrice
        : pricing.displayPrice
  const showFromPrice =
    pricing.showFromPrice && !isPromoPack && !usesGrupos && selectedVariants.length === 0
  const displayProduct = { ...product, discountLabel: pricing.discountLabel }
  const imageSrc = imageError ? PLACEHOLDER : displayImage
  const variantNamesLabel = usesGrupos
    ? formatGrupoSelections(gruposOpcion, selectedByGrupo)
    : isPromoPack
      ? formatPromoSlots(promoSlots.filter(Boolean))
      : formatVariantNames(selectedVariants)
  const imageAlt = variantNamesLabel
    ? `${product.name} - ${variantNamesLabel}`
    : product.name

  const hasVariants = needsVariantLoad && variants.length > 0
  const hasGrupos = usesGrupos && gruposOpcion.length > 0
  const maxSabores = Math.min(2, Math.max(1, Number(product.max_sabores) || 1))
  const variantCopy = getVariantCopy(product.tipo_variante || 'sabor', maxSabores)
  const isPromoIncomplete =
    isPromoPack && (promoSlots.length !== promoCount || promoSlots.some((slot) => !slot))
  const isGrupoIncomplete = usesGrupos && !isGrupoSelectionComplete(gruposOpcion, selectedByGrupo)
  const isVariantSelectionMissing = isPromoPack
    ? isPromoIncomplete
    : usesGrupos
      ? isGrupoIncomplete || gruposOpcion.length === 0
      : product.usa_variantes && variants.length > 0 && selectedVariants.length === 0
  const variantTitle = isPromoPack
    ? `Elige ${promoCount} sabores`
    : variantCopy.title
  const variantSubtitle = isPromoPack
    ? `Un sabor por cada mojito del pack (${promoCount}). Pueden repetirse.`
    : variantCopy.subtitle

  const setPromoSlot = (index, variantId) => {
    const variant = variants.find((item) => String(item.id) === String(variantId)) || null
    setPromoSlots((current) => current.map((slot, i) => (i === index ? variant : slot)))
  }

  const toggleGrupoOpcion = (grupo, opcion) => {
    setSelectedByGrupo((current) => {
      const selected = current[grupo.id] ?? []
      const exists = selected.some((item) => item.id === opcion.id)
      const max = Math.max(1, Number(grupo.max_seleccion) || 1)

      if (max === 1) {
        return { ...current, [grupo.id]: exists ? selected : [opcion] }
      }

      if (exists) {
        if (selected.length <= Math.max(0, Number(grupo.min_seleccion) || 0)) {
          return current
        }
        return {
          ...current,
          [grupo.id]: selected.filter((item) => item.id !== opcion.id),
        }
      }

      if (selected.length >= max) {
        toast.error(`Máximo ${max} opciones en "${grupo.nombre}".`)
        return current
      }

      return { ...current, [grupo.id]: [...selected, opcion] }
    })
  }

  const toggleVariant = (variant) => {
    setSelectedVariants((current) => {
      const exists = current.some((item) => item.id === variant.id)

      if (maxSabores === 1) {
        return exists ? current : [variant]
      }

      if (exists) {
        if (current.length === 1) return current
        return current.filter((item) => item.id !== variant.id)
      }

      if (current.length >= maxSabores) {
        toast.error(variantCopy.maxError(maxSabores))
        return current
      }

      return [...current, variant]
    })
  }

  const buildCartVariant = () => {
    if (usesGrupos) {
      const ids = collectSelectedOpcionIds(selectedByGrupo)
      return {
        id: ids.map(String).join('-'),
        ids,
        nombre_variante: formatGrupoSelections(gruposOpcion, selectedByGrupo),
        precio: gruposPricing.displayPrice,
        image: product.image,
        isGrupoOpciones: true,
      }
    }

    if (isPromoPack) {
      const ids = promoSlots.map((slot) => slot.id)
      return {
        id: ids.join('-'),
        ids,
        nombre_variante: formatPromoSlots(promoSlots),
        precio: pricing.displayPrice,
        image: product.image,
        isPromoPack: true,
      }
    }

    const ids = selectedVariants.map((variant) => variant.id)
    return {
      id: ids.length === 1 ? ids[0] : ids.map(String).sort().join('-'),
      ids,
      nombre_variante: formatVariantNames(selectedVariants),
      precio: selectedPricing.displayPrice,
      image: resolveVariantImage(primarySelected, product.image),
    }
  }

  const handleAdd = () => {
    if (usesGrupos) {
      if (isGrupoIncomplete) {
        toast.error('Completa todas las opciones del producto')
        return
      }
      const cartVariant = buildCartVariant()
      addItem({ ...product, price: gruposPricing.displayPrice }, quantity, cartVariant)
      toast.success(
        `${quantity}x ${product.name} (${cartVariant.nombre_variante}) agregado al carrito`,
      )
      return
    }

    if (isPromoPack) {
      if (isPromoIncomplete) {
        toast.error('Elige el sabor de cada mojito de la promo')
        return
      }
      const cartVariant = buildCartVariant()
      addItem({ ...product, price: pricing.displayPrice }, quantity, cartVariant)
      toast.success(`${quantity}x ${product.name} agregado al carrito`)
      return
    }

    if (product.usa_variantes && hasVariants) {
      if (!selectedVariants.length) {
        toast.error(variantCopy.missing)
        return
      }

      const cartVariant = buildCartVariant()
      addItem({ ...product, price: selectedPricing.displayPrice }, quantity, cartVariant)
      toast.success(
        `${quantity}x ${product.name} (${cartVariant.nombre_variante}) agregado al carrito`,
      )
      return
    }

    addItem({ ...product, price: pricing.displayPrice }, quantity)
    toast.success(`${quantity}x ${product.name} agregado al carrito`)
  }

  const handleOrder = () => {
    if (usesGrupos && isGrupoIncomplete) {
      toast.error('Completa todas las opciones del producto')
      return
    }

    if (isPromoPack && isPromoIncomplete) {
      toast.error('Elige el sabor de cada mojito de la promo')
      return
    }

    if (!isPromoPack && !usesGrupos && product.usa_variantes && hasVariants && !selectedVariants.length) {
      toast.error(variantCopy.missing)
      return
    }

    const cartVariant = hasVariants || isPromoPack || hasGrupos ? buildCartVariant() : null
    closeProductDetail()
    openOrderModal(
      [
        {
          id: product.id,
          productId: product.id,
          variantId: cartVariant?.id ?? null,
          variantIds: cartVariant?.ids ?? [],
          variantName: cartVariant?.nombre_variante ?? null,
          variants,
          usa_variantes: Boolean(product.usa_variantes || isPromoPack || usesGrupos),
          usa_grupos_opcion: usesGrupos,
          es_promo_sabores: isPromoPack,
          promo_cantidad: promoCount || null,
          name: product.name,
          price: currentPrice,
          quantity,
          category: product.category,
          image: displayImage,
        },
      ],
      'product',
    )
  }

  const reloadVariants = () => {
    setVariants([])
    setVariantsError('')
    setIsLoadingVariants(true)
    getProductById(product.id, { timeout: 8000, retries: 1 })
      .then((detail) => {
        const loaded = (detail.variantes ?? []).map(mapVariante)
        setVariants(loaded)
        if (!isPromoPack) {
          setSelectedVariants(loaded[0] ? [loaded[0]] : [])
        }
        setVariantsError('')
      })
      .catch(() => {
        setVariantsError(variantCopy.loadError)
      })
      .finally(() => setIsLoadingVariants(false))
  }

  return (
    <div className={styles.root} role="presentation">
      <div className={styles.overlay} onClick={closeProductDetail} aria-hidden="true" />

      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={closeProductDetail}
          aria-label="Cerrar"
        >
          <FiX aria-hidden="true" />
        </button>

        <div className={styles.imageWrap}>
          <img
            key={displayImage}
            src={imageSrc}
            alt={imageAlt}
            loading="lazy"
            onError={() => setImageError(true)}
          />
          <ProductTags product={displayProduct} layout="overlay" />
          <button
            type="button"
            className={styles.imagePreviewBtn}
            onClick={() => setIsImagePreviewOpen(true)}
            aria-label="Ver imagen ampliada"
            title="Ver imagen ampliada"
          >
            <FiEye aria-hidden="true" />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.scrollBody}>
            {categoryName && <p className={styles.category}>{categoryName}</p>}
            <h2 id="product-detail-title" className={styles.name}>
              {product.name}
            </h2>
            {product.description ? (
              <p className={styles.description}>{product.description}</p>
            ) : null}
            <p className={styles.price}>
              {showFromPrice ? 'Desde ' : ''}
              {formatPrice(currentPrice)}
            </p>

            {needsVariantLoad && (
              <section className={styles.variantSection}>
                <div className={styles.variantHeader}>
                  <p className={styles.variantTitle}>{variantTitle}</p>
                  <p className={styles.variantSubtitle}>{variantSubtitle}</p>
                </div>
                {isLoadingVariants ? (
                  <p className={styles.variantHint}>Cargando opciones...</p>
                ) : variantsError ? (
                  <div className={styles.variantErrorWrap}>
                    <p className={styles.variantError}>{variantsError}</p>
                    <button
                      type="button"
                      className={styles.variantRetryBtn}
                      onClick={reloadVariants}
                    >
                      Reintentar
                    </button>
                  </div>
                ) : variants.length === 0 ? (
                  <p className={styles.variantHint}>
                    No hay sabores disponibles en este momento.
                  </p>
                ) : isPromoPack ? (
                  <div className={styles.promoSlots} role="group" aria-label="Sabores del pack">
                    {promoSlots.map((slot, index) => (
                      <label key={`promo-slot-${index}`} className={styles.promoSlot}>
                        <span className={styles.promoSlotLabel}>Mojito {index + 1}</span>
                        <select
                          className={styles.promoSelect}
                          value={slot?.id ?? ''}
                          onChange={(event) => setPromoSlot(index, event.target.value)}
                        >
                          <option value="">Elige un sabor...</option>
                          {variants.map((variant) => (
                            <option key={variant.id} value={variant.id}>
                              {variant.nombre_variante}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div
                    className={styles.variantOptions}
                    role="group"
                    aria-label="Opciones disponibles"
                  >
                    {variants.map((variant) => {
                      const isSelected = selectedVariants.some((item) => item.id === variant.id)

                      return (
                        <button
                          key={variant.id}
                          type="button"
                          aria-pressed={isSelected}
                          className={isSelected ? styles.variantOptionActive : styles.variantOption}
                          onClick={() => toggleVariant(variant)}
                        >
                          <span className={styles.variantOptionName}>{variant.nombre_variante}</span>
                          <strong className={styles.variantOptionPrice}>
                            {formatPrice(getVariantPricing(variant, pricing).displayPrice)}
                          </strong>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {usesGrupos && (
              <section className={styles.variantSection}>
                {isLoadingVariants && !gruposOpcion.length ? (
                  <p className={styles.variantHint}>Cargando opciones...</p>
                ) : variantsError && !gruposOpcion.length ? (
                  <p className={styles.variantError}>{variantsError}</p>
                ) : gruposOpcion.length === 0 ? (
                  <p className={styles.variantHint}>Este producto aún no tiene opciones configuradas.</p>
                ) : (
                  gruposOpcion.map((grupo) => {
                    const selected = selectedByGrupo[grupo.id] ?? []
                    return (
                      <div key={grupo.id} className={styles.variantHeader} style={{ marginTop: '0.85rem' }}>
                        <p className={styles.variantTitle}>{grupo.nombre}</p>
                        <p className={styles.variantSubtitle}>
                          {Number(grupo.max_seleccion) > 1
                            ? `Elige hasta ${grupo.max_seleccion}`
                            : 'Elige una opción'}
                        </p>
                        <div
                          className={styles.variantOptions}
                          role="group"
                          aria-label={grupo.nombre}
                        >
                          {(grupo.opciones ?? []).map((opcion) => {
                            const isSelected = selected.some((item) => item.id === opcion.id)
                            return (
                              <button
                                key={opcion.id}
                                type="button"
                                aria-pressed={isSelected}
                                className={
                                  isSelected ? styles.variantOptionActive : styles.variantOption
                                }
                                onClick={() => toggleGrupoOpcion(grupo, opcion)}
                              >
                                <span className={styles.variantOptionName}>
                                  {opcion.nombre_opcion}
                                </span>
                                {Number(opcion.precio_extra) > 0 ? (
                                  <strong className={styles.variantOptionPrice}>
                                    +{formatPrice(opcion.precio_extra)}
                                  </strong>
                                ) : null}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </section>
            )}
          </div>

          <div className={styles.footerActions}>
            <div className={styles.actionsRow}>
              <div className={styles.quantity}>
                <span className={styles.quantityLabel}>Cant.</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Disminuir cantidad"
                >
                  <FiMinus aria-hidden="true" />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                  aria-label="Aumentar cantidad"
                >
                  <FiPlus aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                className={styles.addBtn}
                onClick={handleAdd}
                disabled={isVariantSelectionMissing}
              >
                <FiShoppingCart aria-hidden="true" />
                Añadir
              </button>
            </div>

            <button
              type="button"
              className={styles.orderBtn}
              onClick={handleOrder}
              disabled={isVariantSelectionMissing}
            >
              <FaWhatsapp aria-hidden="true" />
              Pedir ahora
            </button>
          </div>
        </div>
      </div>

      {isImagePreviewOpen && (
        <div
          className={styles.imageLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada del producto"
        >
          <button
            type="button"
            className={styles.imageLightboxBackdrop}
            onClick={() => setIsImagePreviewOpen(false)}
            aria-label="Cerrar imagen ampliada"
          />
          <div className={styles.imageLightboxContent}>
            <button
              type="button"
              className={styles.imageLightboxClose}
              onClick={() => setIsImagePreviewOpen(false)}
              aria-label="Cerrar"
            >
              <FiX aria-hidden="true" />
            </button>
            <img src={imageSrc} alt={imageAlt} />
          </div>
        </div>
      )}
    </div>
  )
}
