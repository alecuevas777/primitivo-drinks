import { Navigate } from 'react-router-dom'

import AdminLayout from '@/layouts/AdminLayout'

import ProtectedAdminRoute from '@/components/admin/ProtectedAdminRoute'

import AdminLogin from '@/pages/AdminLogin'

import Dashboard from '@/components/admin/ui/Dashboard'

import UsuariosDashboard from '@/components/admin/ui/UsuariosDashboard'

import CategoriasDashboard from '@/components/admin/ui/CategoriasDashboard'

import ProductosDashboard from '@/components/admin/ui/ProductosDashboard'

import CuponesDashboard from '@/components/admin/ui/CuponesDashboard'

import ConfiguracionDashboard from '@/components/admin/ui/ConfiguracionDashboard'

import DeliveryZonasDashboard from '@/components/admin/ui/DeliveryZonasDashboard'

import IngredientesExtraDashboard from '@/components/admin/ui/IngredientesExtraDashboard'



export { AdminLayout }



export const adminRoutes = [

  {

    path: '/admin/login',

    element: <AdminLogin />,

  },

  {

    path: '/admin',

    element: <ProtectedAdminRoute />,

    children: [

      {

        element: <AdminLayout />,

        children: [

          { index: true, element: <Navigate to="dashboard" replace /> },

          { path: 'dashboard', element: <Dashboard /> },

          { path: 'usuarios', element: <UsuariosDashboard /> },

          { path: 'categorias', element: <CategoriasDashboard /> },

          { path: 'productos', element: <ProductosDashboard /> },

          { path: 'cupones', element: <CuponesDashboard /> },

          { path: 'delivery-zonas', element: <DeliveryZonasDashboard /> },

          { path: 'ingredientes-extra', element: <IngredientesExtraDashboard /> },

          { path: 'configuracion', element: <ConfiguracionDashboard /> },

        ],

      },

    ],

  },

]

