import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { siteConfig } from '@/data/siteConfig'
import { useAuthStore } from '@/store/authStore'
import { useConfigStore } from '@/store/configStore'

export default function AdminHeader({ onOpenMenu, onCloseMenu, isMenuOpen }) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const logoSrc = useConfigStore((state) => state.site.logo) || siteConfig.logo
  const siteName = useConfigStore((state) => state.site.name) || siteConfig.name

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <>
      <div
        className="truncate border-b px-4 py-2 text-center text-[10px] font-semibold tracking-wide sm:text-[11px]"
        style={{
          backgroundColor: '#0a0a0a',
          borderColor: 'var(--admin-border)',
          color: 'var(--admin-accent)',
        }}
      >
        Panel administrativo · {user?.nom_usuario ?? 'Administrador'}
      </div>

      <header
        className="grid grid-cols-[1fr_auto] items-center gap-2 border-b px-3 py-2.5 sm:grid-cols-[1fr_auto_1fr] sm:gap-3 sm:px-4"
        style={{
          borderColor: 'var(--admin-border)',
          backgroundColor: 'var(--admin-surface)',
        }}
      >
        <div className="flex min-w-0 items-center gap-2 justify-self-start sm:gap-3">
          <button
            type="button"
            onClick={isMenuOpen ? onCloseMenu : onOpenMenu}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="shrink-0 p-1 lg:hidden"
            style={{ color: 'var(--admin-text)' }}
          >
            {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <img
            src={logoSrc}
            alt={siteName}
            className="block shrink-0 rounded-full border-[3px] border-black bg-white object-cover"
            style={{ width: '96px', height: '96px' }}
          />
        </div>

        <p
          className="hidden justify-self-center text-[11px] font-bold tracking-[0.18em] sm:block"
          style={{ color: 'var(--admin-text-dim)' }}
        >
          PANEL ADMINISTRATIVO
        </p>

        <div
          className="flex shrink-0 items-center gap-3 text-xs font-semibold tracking-wide justify-self-end sm:gap-5"
          style={{ color: 'var(--admin-text-dim)' }}
        >
          <Link
            to="/"
            className="hidden items-center gap-1.5 transition-colors hover:text-[var(--admin-text)] sm:flex"
          >
            <FiArrowLeft size={14} />
            Volver al sitio
          </Link>
          <span className="hidden sm:inline" style={{ color: 'var(--admin-border)' }}>
            |
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 p-1 text-red-600 transition-colors hover:text-red-500"
          >
            <FiLogOut size={14} />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>
    </>
  )
}
