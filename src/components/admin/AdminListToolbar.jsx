import { FiSearch, FiX } from 'react-icons/fi'
import { adminInputClass, adminInputStyle } from '@/components/admin/AdminModal'

export default function AdminListToolbar({
  action,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
}) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-end">
      {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}

      <div className="relative w-full sm:w-52 md:w-60 lg:w-72">
        <FiSearch
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          style={{ color: 'var(--admin-text-dim)' }}
          aria-hidden="true"
        />
        <input
          type="text"
          role="searchbox"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className={`${adminInputClass} w-full py-2.5 pr-9 pl-9 text-sm`}
          style={adminInputStyle()}
          aria-label={searchPlaceholder}
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute top-1/2 right-2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md transition-colors hover:bg-white/5"
            style={{ color: 'var(--admin-text-dim)' }}
            aria-label="Limpiar búsqueda"
          >
            <FiX size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
