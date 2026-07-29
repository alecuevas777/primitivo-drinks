import { Link, NavLink } from 'react-router-dom'
import { FiArrowLeft, FiX } from 'react-icons/fi'
import { adminMenuItems } from '@/data/adminConfig'

export default function AdminSidebar({ onNavigate, onClose }) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between px-3">
        <p
          className="text-[10px] font-bold tracking-[0.18em]"
          style={{ color: 'var(--admin-text-dim)' }}
        >
          MENÚ
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-1 lg:hidden"
            style={{ color: 'var(--admin-text)' }}
          >
            <FiX size={22} />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {adminMenuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.id === 'dashboard'}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors sm:py-2.5 ${
                  isActive ? '' : 'hover:text-[var(--admin-text)]'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: 'var(--admin-accent)', color: '#0a0a0a' }
                  : { color: 'var(--admin-text-dim)' }
              }
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          )
        })}

        <Link
          to="/"
          onClick={onNavigate}
          className="mt-1 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors hover:text-[var(--admin-text)] sm:py-2.5 lg:hidden"
          style={{ color: 'var(--admin-text-dim)' }}
        >
          <FiArrowLeft size={16} />
          Volver al sitio
        </Link>
      </nav>
    </>
  )
}
