import { FiShoppingCart } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useCartStore } from '@/store/cartStore'
import { useConfigStore } from '@/store/configStore'
import { useUiStore } from '@/store/uiStore'
import { buildWhatsAppUrl } from '@/services/whatsapp'
import styles from './FloatingActions.module.css'

export default function FloatingActions() {
  const openCart = useUiStore((state) => state.openCart)
  const itemCount = useCartStore((state) =>
    state.items.reduce((count, item) => count + item.quantity, 0),
  )
  const phone = useConfigStore((state) => state.site.phone)
  const siteName = useConfigStore((state) => state.site.name)

  const whatsappUrl = buildWhatsAppUrl(
    `¡Hola! Quiero hacer un pedido en ${siteName || 'Primitivos Drinks'}.`,
  )

  return (
    <div className={styles.fabGroup} aria-label="Acciones rápidas">
      <button
        type="button"
        className={styles.cartFab}
        onClick={openCart}
        aria-label={`Mi carrito, ${itemCount} productos`}
      >
        <FiShoppingCart aria-hidden="true" />
        {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
      </button>

      <a
        key={String(phone || 'whatsapp')}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappFab}
        aria-label="Contactar por WhatsApp"
      >
        <FaWhatsapp aria-hidden="true" />
      </a>
    </div>
  )
}
