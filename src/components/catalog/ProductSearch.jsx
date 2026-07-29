import { FiSearch } from 'react-icons/fi'
import { useMenuStore } from '@/store/menuStore'
import styles from './ProductSearch.module.css'

export default function ProductSearch() {
  const searchQuery = useMenuStore((state) => state.searchQuery)
  const setSearchQuery = useMenuStore((state) => state.setSearchQuery)

  return (
    <label className={styles.field}>
      <span className="sr-only">Buscar productos</span>
      <span className={styles.icon} aria-hidden>
        <FiSearch />
      </span>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar"
        className={styles.input}
      />
    </label>
  )
}

/** @deprecated use default ProductSearch */
export function ProductSearchDesktop() {
  return <ProductSearch />
}

/** @deprecated use default ProductSearch */
export function ProductSearchMobile() {
  return <ProductSearch />
}
