import {
  FiBarChart2,
  FiUsers,
  FiTag,
  FiBox,
  FiCreditCard,
  FiMapPin,
  FiPlusCircle,
  FiSettings,
} from 'react-icons/fi'

export const adminMenuItems = [
  { id: 'dashboard', path: '/admin/dashboard', label: 'Dashboard', icon: FiBarChart2 },
  { id: 'usuarios', path: '/admin/usuarios', label: 'Usuarios', icon: FiUsers },
  { id: 'categorias', path: '/admin/categorias', label: 'Categorías', icon: FiTag },
  { id: 'productos', path: '/admin/productos', label: 'Productos', icon: FiBox },
  { id: 'cupones', path: '/admin/cupones', label: 'Cupones', icon: FiCreditCard },
  { id: 'delivery-zonas', path: '/admin/delivery-zonas', label: 'Delivery', icon: FiMapPin },
  { id: 'ingredientes-extra', path: '/admin/ingredientes-extra', label: 'Extras', icon: FiPlusCircle },
  { id: 'configuracion', path: '/admin/configuracion', label: 'Configuración', icon: FiSettings },
]

export const adminTheme = {
  bg: '#f7f3eb',
  surface: '#ffffff',
  border: '#e4ddd0',
  text: '#0a0a0a',
  textDim: '#5a5a5a',
  accent: '#ffd400',
}
