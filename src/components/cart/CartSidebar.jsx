import { FiMinus, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useCartStore } from '@/store/cartStore'
import { useUiStore } from '@/store/uiStore'
import { formatPrice } from '@/utils'
import styles from './CartSidebar.module.css'

function productLabel(count) {
  return count === 1 ? '1 producto' : `${count} productos`
}

export default function CartSidebar() {
  const isCartOpen = useUiStore((state) => state.isCartOpen)
  const closeCart = useUiStore((state) => state.closeCart)
  const openOrderModal = useUiStore((state) => state.openOrderModal)
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)
  const itemCount = useCartStore((state) =>
    state.items.reduce((count, item) => count + item.quantity, 0),
  )
  const total = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  const handleCheckout = () => {
    if (items.length === 0) return

    openOrderModal(
      items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        variantIds: item.variantIds ?? [],
        variantName: item.variantName,
        variants: item.variants ?? [],
        usa_variantes: Boolean(item.usa_variantes),
        es_promo_sabores: Boolean(item.es_promo_sabores),
        promo_cantidad: item.promo_cantidad ?? null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        image: item.image,
      })),
      'cart',
    )
    closeCart()
  }

  if (!isCartOpen) return null

  return (
    <>
      <div className={styles.overlay} onClick={closeCart} aria-hidden="true" />

      <aside className={styles.cart} aria-label="Mi carrito">
        <header className={styles.header}>
          <div>
            <h2>Mi carrito</h2>
            <p className={styles.subtitle}>{productLabel(itemCount)}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={closeCart} aria-label="Cerrar">
            <FiX />
          </button>
        </header>

        <div className={styles.body}>
          {items.length === 0 ? (
            <p className={styles.empty}>Tu carrito está vacío. Agrega productos del menú.</p>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.itemThumb}>
                    {item.image ? (
                      <img src={item.image} alt="" loading="lazy" />
                    ) : (
                      <span>🍹</span>
                    )}
                  </div>

                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    {item.variantName && (
                      <p className={styles.itemVariant}>{item.variantName}</p>
                    )}
                    <p className={styles.itemPrice}>{formatPrice(item.price)}</p>

                    <div className={styles.quantity}>
                      <span className={styles.quantityLabel}>Cant.</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Disminuir"
                      >
                        <FiMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Aumentar"
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.id)}
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <FiTrash2 />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <button type="button" className={styles.checkoutBtn} onClick={handleCheckout}>
              <FaWhatsapp aria-hidden="true" />
              Pedir por WhatsApp
            </button>

            <button type="button" className={styles.clearBtn} onClick={clearCart}>
              <FiTrash2 aria-hidden="true" />
              Vaciar carrito
            </button>
          </footer>
        )}
      </aside>
    </>
  )
}
