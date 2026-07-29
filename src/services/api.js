import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''

    if (
      status === 401 &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/me')
    ) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    const message =
      error.response?.data?.message || error.message || 'Error de conexión'
    return Promise.reject(new Error(message))
  },
)

export async function getProductos() {
  const { data } = await api.get('/productos', { timeout: 5000 })
  return data
}

export async function getCategorias() {
  const { data } = await api.get('/categorias', { timeout: 2500 })
  return data
}

export async function getProductById(id, options = {}) {
  const { timeout = 8000, retries = 1 } = options
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const { data } = await api.get(`/productos/${id}`, { timeout })
      if (!data?.success) {
        throw new Error(data?.message || 'Producto no encontrado')
      }
      return data.data
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 400))
      }
    }
  }

  throw lastError ?? new Error('Producto no encontrado')
}

export async function getProductosByCategoria(categoriaId) {
  const { data } = await api.get(`/categorias/${categoriaId}/productos`, {
    timeout: 2500,
  })
  return data
}

export async function sendContactForm(payload) {
  const { data } = await api.post('/contact', payload)
  return data
}

export async function validateCupon(payload) {
  const { data } = await api.post('/cupones/validar', payload)
  if (!data?.success) {
    throw new Error(data?.message || 'Cupón no válido')
  }
  return data.data
}

export async function getConfiguracion() {
  const { data } = await api.get('/configuracion', { timeout: 2500 })
  if (!data?.success) {
    throw new Error(data?.message || 'No se pudo cargar la configuración')
  }
  return data.data
}

export async function getDeliveryZonas() {
  const { data } = await api.get('/delivery-zonas', { timeout: 2500 })
  if (!data?.success) {
    throw new Error(data?.message || 'No se pudieron cargar las zonas de delivery')
  }
  return data.data
}

export async function getIngredientesExtra() {
  const { data } = await api.get('/ingredientes-extra', { timeout: 2500 })
  if (!data?.success) {
    throw new Error(data?.message || 'No se pudieron cargar los extras')
  }
  return data.data
}

export default api