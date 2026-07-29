import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function ProtectedAdminRoute() {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const checkSession = useAuthStore((state) => state.checkSession)

  useEffect(() => {
    if (status === 'idle') {
      checkSession()
    }
  }, [status, checkSession])

  if (status === 'idle' || status === 'loading') {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm"
        style={{ backgroundColor: '#0B0B0C', color: '#8C8C90' }}
      >
        Verificando sesión...
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
