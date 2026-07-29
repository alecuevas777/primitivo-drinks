import api from '@/services/api'

export async function login(credentials) {
  const { data } = await api.post('/auth/login', credentials)
  return data
}

export async function logout() {
  const { data } = await api.post('/auth/logout')
  return data
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function getUsuarios() {
  const { data } = await api.get('/usuarios')
  return data
}

export async function createUsuario(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}

export async function updateUsuario(id, payload) {
  const { data } = await api.put(`/usuarios/${id}`, payload)
  return data
}

export async function deleteUsuario(id) {
  const { data } = await api.delete(`/usuarios/${id}`)
  return data
}

export async function getAdminStats() {
  const { data } = await api.get('/admin/stats')
  return data
}

export async function getAdminCategorias() {
  const { data } = await api.get('/categorias')
  return data
}

export async function getAdminProductos() {
  const { data } = await api.get('/productos')
  return data
}

export async function createCategoria(payload) {
  const { data } = await api.post('/categorias', payload)
  return data
}

export async function updateCategoria(id, payload) {
  const { data } = await api.put(`/categorias/${id}`, payload)
  return data
}

export async function deleteCategoria(id) {
  const { data } = await api.delete(`/categorias/${id}`)
  return data
}

export async function createProducto(payload) {
  const { data } = await api.post('/productos', payload)
  return data
}

export async function updateProducto(id, payload) {
  const { data } = await api.put(`/productos/${id}`, payload)
  return data
}

export async function deleteProducto(id) {
  const { data } = await api.delete(`/productos/${id}`)
  return data
}

export async function getProductoVariantes(productoId) {
  const { data } = await api.get(`/productos/${productoId}/variantes`)
  return data
}

export async function createVariante(productoId, payload) {
  const { data } = await api.post(`/productos/${productoId}/variantes`, payload)
  return data
}

export async function updateVariante(id, payload) {
  const { data } = await api.put(`/variantes/${id}`, payload)
  return data
}

export async function deleteVariante(id) {
  const { data } = await api.delete(`/variantes/${id}`)
  return data
}

export async function getOpcionGrupos(productoId) {
  const { data } = await api.get(`/productos/${productoId}/opcion-grupos`)
  return data
}

export async function createOpcionGrupo(productoId, payload) {
  const { data } = await api.post(`/productos/${productoId}/opcion-grupos`, payload)
  return data
}

export async function updateOpcionGrupo(id, payload) {
  const { data } = await api.put(`/opcion-grupos/${id}`, payload)
  return data
}

export async function deleteOpcionGrupo(id) {
  const { data } = await api.delete(`/opcion-grupos/${id}`)
  return data
}

export async function createOpcion(grupoId, payload) {
  const { data } = await api.post(`/opcion-grupos/${grupoId}/opciones`, payload)
  return data
}

export async function updateOpcion(id, payload) {
  const { data } = await api.put(`/opciones/${id}`, payload)
  return data
}

export async function deleteOpcion(id) {
  const { data } = await api.delete(`/opciones/${id}`)
  return data
}

export async function uploadProductoImage(file) {
  const formData = new FormData()
  formData.append('imagen', file)

  const { data } = await api.post('/upload/producto-imagen', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })

  return data
}

export async function getCupones() {
  const { data } = await api.get('/cupones')
  return data
}

export async function getCupon(id) {
  const { data } = await api.get(`/cupones/${id}`)
  return data
}

export async function createCupon(payload) {
  const { data } = await api.post('/cupones', payload)
  return data
}

export async function updateCupon(id, payload) {
  const { data } = await api.put(`/cupones/${id}`, payload)
  return data
}

export async function deleteCupon(id) {
  const { data } = await api.delete(`/cupones/${id}`)
  return data
}

export async function getAdminConfiguracion() {
  const { data } = await api.get('/configuracion')
  if (!data?.success || !data?.data) {
    throw new Error(data?.message || 'No se pudo cargar la configuración')
  }
  return data
}

export async function updateConfiguracion(payload) {
  const { data } = await api.put('/configuracion', payload)
  if (!data?.success || !data?.data) {
    throw new Error(data?.message || 'No se pudo guardar la configuración')
  }
  return data
}

export async function getDeliveryZonas() {
  const { data } = await api.get('/delivery-zonas')
  return data
}

export async function createDeliveryZona(payload) {
  const { data } = await api.post('/delivery-zonas', payload)
  return data
}

export async function updateDeliveryZona(id, payload) {
  const { data } = await api.put(`/delivery-zonas/${id}`, payload)
  return data
}

export async function deleteDeliveryZona(id) {
  const { data } = await api.delete(`/delivery-zonas/${id}`)
  return data
}

export async function getIngredientesExtra() {
  const { data } = await api.get('/ingredientes-extra')
  return data
}

export async function createIngredienteExtra(payload) {
  const { data } = await api.post('/ingredientes-extra', payload)
  return data
}

export async function updateIngredienteExtra(id, payload) {
  const { data } = await api.put(`/ingredientes-extra/${id}`, payload)
  return data
}

export async function deleteIngredienteExtra(id) {
  const { data } = await api.delete(`/ingredientes-extra/${id}`)
  return data
}
