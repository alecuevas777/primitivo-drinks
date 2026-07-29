import { memo, useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cartStore'
import { useUiStore } from '@/store/uiStore'
import { useProductPricing } from '@/hooks/useProductPricing'
import { formatPrice, cn } from '@/utils'
import { getVariantCopy } from '@/utils/variantCopy'
import styles from './ProductCard.module.css'

function ProductCard({ product, priority = false }) {
  const addItem = useCartStore((state) => state.addItem)
  const openProductDetail = useUiStore((state) => state.openProductDetail)
  const openOrderModal = useUiStore((state) => state.openOrderModal)

  const [imageLoaded, setImageLoaded] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const pricing = useProductPricing(product)

  const handleOpenDetail = (event) => {
    event?.stopPropagation?.()
    openProductDetail(product)
  }

  const changeQuantity = (delta, event) => {
    event.stopPropagation()
    setQuantity((current) => Math.max(1, current + delta))
  }

  const needsFlavorPick = Boolean(
    product.usa_variantes || product.es_promo_sabores || product.usa_grupos_opcion,
  )

  const handleAdd = (event) => {
    event.stopPropagation()

    if (needsFlavorPick) {
      openProductDetail(product)
      toast(
        product.es_promo_sabores
          ? `Elige el sabor de cada mojito (${product.promo_cantidad})`
          : product.usa_grupos_opcion
            ? 'Elige las opciones del producto'
            : getVariantCopy(product.tipo_variante).toastDetail,
        { icon: '🍹' },
      )
      return
    }

    addItem({ ...product, price: pricing.displayPrice }, quantity)
    toast.success(`${quantity}x ${product.name} agregado al carrito`)
  }

  const handleOrder = (event) => {
    event.stopPropagation()

    if (needsFlavorPick) {
      openProductDetail(product)
      toast(
        product.es_promo_sabores
          ? `Elige el sabor de cada mojito (${product.promo_cantidad})`
          : product.usa_grupos_opcion
            ? 'Elige las opciones antes de pedir'
            : getVariantCopy(product.tipo_variante).toastOrder,
        { icon: '🍹' },
      )
      return
    }

    openOrderModal(
      [
        {
          id: product.id,
          productId: product.id,
          variantId: null,
          variantIds: [],
          variantName: null,
          variants: [],
          usa_variantes: false,
          name: product.name,
          price: pricing.displayPrice,
          quantity,
          category: product.category,
          image: product.image,
        },
      ],
      'product',
    )
  }

  return (
    <article className={styles.card} id={`product-${product.id}`}>
      <button
        type="button"
        className={cn(styles.media, !imageLoaded && styles.imageLoading)}
        onClick={handleOpenDetail}
        aria-label={`Ver detalle de ${product.name}`}
      >
        {!imageLoaded ? <span className={styles.imageSkeleton} aria-hidden /> : null}
        <img
          src={product.image}
          alt=""
          className={styles.image}
          width={640}
          height={480}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setImageLoaded(true)}
        />
      </button>

      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>

        {pricing.hasDiscount && pricing.discountLabel ? (
          <span className={styles.discount}>{pricing.discountLabel}</span>
        ) : null}

        <div className={styles.priceRow}>
          <div className={styles.prices}>
            <span className={styles.price}>
              {pricing.showFromPrice ? 'Desde ' : ''}
              {formatPrice(pricing.displayPrice)}
            </span>
            {pricing.hasDiscount ? (
              <span className={styles.oldPrice}>{formatPrice(pricing.basePrice)}</span>
            ) : null}
          </div>
          <button type="button" className={styles.moreBtn} onClick={handleOpenDetail}>
            Ver más
          </button>
        </div>

        <div className={styles.actions}>
          <div className={styles.qty} onClick={(event) => event.stopPropagation()}>
            <span className={styles.qtyLabel}>Cant.</span>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={(event) => changeQuantity(-1, event)}
              aria-label="Disminuir cantidad"
            >
              <FiMinus />
            </button>
            <span className={styles.qtyValue}>{quantity}</span>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={(event) => changeQuantity(1, event)}
              aria-label="Aumentar cantidad"
            >
              <FiPlus />
            </button>
          </div>

          <button type="button" className={styles.addBtn} onClick={handleAdd}>
            <FiShoppingCart aria-hidden />
            Añadir
          </button>
        </div>

        <button type="button" className={styles.orderBtn} onClick={handleOrder}>
          <FaWhatsapp aria-hidden />
          Pedir ahora
        </button>
      </div>
    </article>
  )
}

export default memo(ProductCard)
