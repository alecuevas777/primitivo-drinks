import { cn } from '@/utils'
import styles from './ProductTags.module.css'

export default function ProductTags({ product, className, layout = 'overlay' }) {
  // No mostrar si no hay label o si el descuento es 0
  if (
    !product?.discountLabel ||
    product.discountLabel === '0' ||
    product.discountLabel === 0
  ) {
    return null
  }

  return (
    <div className={cn(styles.tags, styles[layout], className)}>
      <span className={styles.discountTag}>{product.discountLabel}</span>
    </div>
  )
}