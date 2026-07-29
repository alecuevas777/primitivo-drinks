import { useEffect, useMemo, useState } from 'react'

const DEFAULT_PAGE_SIZE = 10

export function useAdminListControls(items = [], options = {}) {
  const { searchKeys = [], pageSize = DEFAULT_PAGE_SIZE } = options
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items

    return items.filter((item) =>
      searchKeys.some((key) => {
        const value = typeof key === 'function' ? key(item) : item[key]
        return String(value ?? '')
          .toLowerCase()
          .includes(query)
      }),
    )
  }, [items, search, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  useEffect(() => {
    setPage(1)
  }, [search, items.length])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  return {
    search,
    setSearch,
    page: currentPage,
    setPage,
    filtered,
    paginated,
    totalPages,
    totalItems: filtered.length,
    pageSize,
    hasSearch: Boolean(search.trim()),
  }
}
