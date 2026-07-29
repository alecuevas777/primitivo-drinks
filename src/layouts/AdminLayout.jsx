import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { adminTheme } from '@/data/adminConfig'

export default function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  return (
    <div
      className="min-h-dvh font-sans"
      style={{
        '--admin-bg': adminTheme.bg,
        '--admin-surface': adminTheme.surface,
        '--admin-border': adminTheme.border,
        '--admin-text': adminTheme.text,
        '--admin-text-dim': adminTheme.textDim,
        '--admin-accent': adminTheme.accent,
        '--admin-on-accent': '#0a0a0a',
        backgroundColor: 'var(--admin-bg)',
        color: 'var(--admin-text)',
      }}
    >
      <AdminHeader
        isMenuOpen={isMenuOpen}
        onOpenMenu={() => setIsMenuOpen(true)}
        onCloseMenu={() => setIsMenuOpen(false)}
      />

      <div className="flex">
        <aside
          className="sticky top-0 hidden h-[calc(100dvh-73px)] w-60 shrink-0 overflow-y-auto border-r px-3 py-6 lg:block"
          style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}
        >
          <AdminSidebar />
        </aside>

        {isMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsMenuOpen(false)}
            />
            <aside
              className="relative z-10 flex h-full w-[min(280px,85vw)] flex-col overflow-y-auto border-r px-3 py-6 shadow-2xl"
              style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
            >
              <AdminSidebar
                onNavigate={() => setIsMenuOpen(false)}
                onClose={() => setIsMenuOpen(false)}
              />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
