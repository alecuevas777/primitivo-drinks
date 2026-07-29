import { useMemo } from 'react'
import { useMenuStore } from '@/store/menuStore'

export function useFilteredMenuItems() {
  const items = useMenuStore((state) => state.items)
  const activeCategory = useMenuStore((state) => state.activeCategory)
  const searchQuery = useMenuStore((state) => state.searchQuery)

  return useMemo(() => {
    let filtered = items

    if (activeCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === activeCategory)
    }

    const query = searchQuery.trim().toLowerCase()
    if (query) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [items, activeCategory, searchQuery])
}
