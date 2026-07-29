import { createBrowserRouter } from 'react-router-dom'
import Catalog from '@/pages/Catalog'
import { adminRoutes } from '@/pages/Admin'
import '@/store/authStore'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Catalog />,
  },
  ...adminRoutes,
  {
    path: '*',
    element: <Catalog />,
  },
])
