import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function AdminPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  if (totalItems <= pageSize) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div
      className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <p className="text-center text-xs sm:text-left" style={{ color: 'var(--admin-text-dim)' }}>
        Mostrando {start}–{end} de {totalItems}
      </p>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
          aria-label="Página anterior"
        >
          <FiChevronLeft size={14} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <span
          className="min-w-[4.5rem] text-center text-xs font-semibold"
          style={{ color: 'var(--admin-text-dim)' }}
        >
          {page} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <FiChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
