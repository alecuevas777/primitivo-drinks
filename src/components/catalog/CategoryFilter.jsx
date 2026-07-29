import { useEffect, useRef, useState } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { useMenuStore } from '@/store/menuStore'
import { cn } from '@/utils'
import styles from './CategoryFilter.module.css'

export default function CategoryFilter() {
  const categories = useMenuStore((state) => state.categories)
  const activeCategory = useMenuStore((state) => state.activeCategory)
  const setActiveCategory = useMenuStore((state) => state.setActiveCategory)

  const scrollRef = useRef(null)
  const [canScroll, setCanScroll] = useState(false)
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return undefined

    const update = () => {
      const overflow = el.scrollWidth > el.clientWidth + 2
      setCanScroll(overflow)
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [categories])

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <p className={styles.label}>Categorías</p>
        {canScroll && (
          <p className={styles.scrollHint} aria-hidden>
            <span>Desliza</span>
            <FiChevronRight size={12} className={styles.scrollHintIcon} />
          </p>
        )}
      </div>

      <div className={styles.scrollWrap}>
        <div
          ref={scrollRef}
          className={styles.scroll}
          role="tablist"
          aria-label="Filtrar por categoría"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id

            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn(styles.pill, isActive && styles.pillActive)}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </button>
            )
          })}
        </div>

        {canScroll && !atEnd && <div className={styles.fadeEdge} aria-hidden />}
      </div>
    </div>
  )
}
