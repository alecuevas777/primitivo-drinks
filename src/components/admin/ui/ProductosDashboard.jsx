import { useCallback, useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminTable from '@/components/admin/AdminTable'
import AdminListToolbar from '@/components/admin/AdminListToolbar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminRowActions from '@/components/admin/AdminRowActions'
import AdminModal, { AdminField, AdminFormActions, adminInputClass, adminInputStyle } from '@/components/admin/AdminModal'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog'
import ProductImageInput from '@/components/admin/ProductImageInput'
import ProductoVariantesEditor from '@/components/admin/ProductoVariantesEditor'
import ProductoGruposOpcionEditor from '@/components/admin/ProductoGruposOpcionEditor'
import {
  createProducto,
  deleteProducto,
  getAdminCategorias,
  getAdminProductos,
  updateProducto,
} from '@/services/adminApi'
import { formatPrice } from '@/utils'
import { getVariantCopy, normalizeTipoVariante } from '@/utils/variantCopy'
import { useAdminListControls } from '@/hooks/useAdminListControls'

const emptyForm = {
  nom_producto: '',
  precio_producto: '',
  categoria_id: '',
  descripcion_producto: '',
  img_prod: '',
  descuento_porcentaje: '',
  stock_disponible: '',
  aviso_stock_desde: '',
  caracteristicas: '{}',
  usa_variantes: false,
  usa_grupos_opcion: false,
  tipo_variante: 'sabor',
  mostrar_imagen_variantes: false,
  max_sabores: '1',
  promo_cantidad: '',
  promo_origen_id: '',
}

function toPayload(form) {
  const tipo = normalizeTipoVariante(form.tipo_variante)
  const promoCantidad = form.promo_cantidad !== '' ? Number(form.promo_cantidad) : null
  const promoOrigenId = form.promo_origen_id !== '' ? Number(form.promo_origen_id) : null
  const usaGrupos = Boolean(form.usa_grupos_opcion) && !form.usa_variantes
  const usaVariantes = Boolean(form.usa_variantes) && !usaGrupos
  return {
    nom_producto: form.nom_producto.trim(),
    precio_producto: usaVariantes ? null : Number(form.precio_producto),
    categoria_id: Number(form.categoria_id),
    descripcion_producto: form.descripcion_producto.trim(),
    img_prod: form.img_prod.trim(),
    descuento_porcentaje: form.descuento_porcentaje !== '' ? Number(form.descuento_porcentaje) : null,
    stock_disponible: form.stock_disponible !== '' ? Number(form.stock_disponible) : null,
    aviso_stock_desde: form.aviso_stock_desde !== '' ? Number(form.aviso_stock_desde) : null,
    presentacion: '',
    detalles: '',
    caracteristicas: form.caracteristicas || '{}',
    usa_variantes: usaVariantes,
    usa_grupos_opcion: usaGrupos,
    tipo_variante: usaVariantes ? tipo : 'sabor',
    mostrar_imagen_variantes: usaVariantes ? form.mostrar_imagen_variantes : false,
    max_sabores: usaVariantes
      ? tipo === 'presentacion'
        ? 1
        : Number(form.max_sabores) || 1
      : 1,
    promo_cantidad: !usaVariantes && !usaGrupos && promoCantidad >= 2 ? promoCantidad : null,
    promo_origen_id: !usaVariantes && !usaGrupos && promoCantidad >= 2 ? promoOrigenId : null,
  }
}

export default function ProductosDashboard() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [variantes, setVariantes] = useState([])
  const [gruposOpcion, setGruposOpcion] = useState([])

  const list = useAdminListControls(productos, {
    searchKeys: [
      'nom_producto',
      'nom_categoria',
      'descripcion_producto',
      (row) => String(row.id_producto ?? ''),
    ],
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        getAdminProductos(),
        getAdminCategorias(),
      ])
      setProductos(productosRes.data ?? [])
      setCategorias(categoriasRes.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openCreate = () => {
    setForm({
      ...emptyForm,
      categoria_id: categorias[0]?.id_categoria?.toString() ?? '',
    })
    setVariantes([])
    setGruposOpcion([])
    setModal({ mode: 'create' })
  }

  const openEdit = (row) => {
    setVariantes(row.variantes ?? [])
    setGruposOpcion(row.grupos_opcion ?? [])
    setForm({
      nom_producto: row.nom_producto ?? '',
      precio_producto: row.precio_producto ?? '',
      categoria_id: String(row.categoria_id ?? ''),
      descripcion_producto: row.descripcion_producto ?? '',
      img_prod: row.img_prod ?? '',
      descuento_porcentaje: row.descuento_porcentaje ?? '',
      stock_disponible: row.stock_disponible ?? '',
      aviso_stock_desde: row.aviso_stock_desde ?? '',
      caracteristicas: row.caracteristicas ?? '{}',
      usa_variantes: Boolean(Number(row.usa_variantes)),
      usa_grupos_opcion: Boolean(Number(row.usa_grupos_opcion)),
      tipo_variante: normalizeTipoVariante(row.tipo_variante),
      mostrar_imagen_variantes: Boolean(Number(row.mostrar_imagen_variantes)),
      max_sabores: String(Math.min(2, Math.max(1, Number(row.max_sabores) || 1))),
      promo_cantidad: row.promo_cantidad != null ? String(row.promo_cantidad) : '',
      promo_origen_id: row.promo_origen_id != null ? String(row.promo_origen_id) : '',
    })
    setModal({ mode: 'edit', id: row.id_producto })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nom_producto.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    if (!form.categoria_id) {
      toast.error('Selecciona una categoría')
      return
    }
    if (!form.usa_variantes && form.precio_producto === '') {
      toast.error('El precio es obligatorio')
      return
    }
    if (form.usa_grupos_opcion && form.usa_variantes) {
      toast.error('No puedes combinar variantes simples con grupos de opciones')
      return
    }
    if (form.promo_cantidad !== '' && Number(form.promo_cantidad) >= 2 && !form.promo_origen_id) {
      toast.error('Selecciona el producto origen de sabores para la promo')
      return
    }

    setIsSaving(true)
    try {
      const payload = toPayload(form)
      if (modal.mode === 'create') {
        const res = await createProducto(payload)
        await loadData()
        if (form.usa_variantes || form.usa_grupos_opcion) {
          setModal({ mode: 'edit', id: res.data.id_producto })
          setVariantes(res.data.variantes ?? [])
          setGruposOpcion(res.data.grupos_opcion ?? [])
          toast.success(
            form.usa_grupos_opcion
              ? 'Producto creado. Agrega los grupos de opciones abajo.'
              : 'Producto creado. Agrega las variantes abajo.',
          )
          return
        }
        toast.success('Producto creado')
      } else {
        await updateProducto(modal.id, payload)
        toast.success('Producto actualizado')
      }
      setModal(null)
      await loadData()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await deleteProducto(toDelete.id_producto)
      toast.success('Producto eliminado')
      setToDelete(null)
      await loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const columns = [
    { key: 'id', label: 'ID', render: (row) => row.id_producto },
    { key: 'nombre', label: 'Producto', render: (row) => row.nom_producto },
    { key: 'categoria', label: 'Categoría', render: (row) => row.nom_categoria || '—' },
    {
      key: 'precio',
      label: 'Precio',
      render: (row) => {
        if (Number(row.usa_variantes)) {
          return row.precio_desde != null
            ? `Desde ${formatPrice(Number(row.precio_desde))}`
            : 'Variantes'
        }
        return row.precio_producto != null ? formatPrice(Number(row.precio_producto)) : '—'
      },
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (row) => (row.stock_disponible != null ? row.stock_disponible : '—'),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <AdminRowActions onEdit={() => openEdit(row)} onDelete={() => setToDelete(row)} />
      ),
    },
  ]

  return (
    <>
      <AdminPageHeader
        title="Productos"
        description="Listado y gestión de productos del menú."
        action={
          <AdminListToolbar
            searchValue={list.search}
            onSearchChange={list.setSearch}
            searchPlaceholder="Buscar producto..."
            action={
              <button
                type="button"
                onClick={openCreate}
                disabled={!categorias.length}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }}
              >
                <FiPlus size={16} />
                Nuevo producto
              </button>
            }
          />
        }
      />

      <div
        className="mt-6 overflow-hidden rounded-xl border sm:mt-8"
        style={{
          backgroundColor: 'var(--admin-surface)',
          borderColor: 'var(--admin-border)',
        }}
      >
        {isLoading ? (
          <p className="py-12 text-center text-sm" style={{ color: 'var(--admin-text-dim)' }}>
            Cargando productos...
          </p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-red-400">{error}</p>
        ) : (
          <>
            <AdminTable
              columns={columns}
              rows={list.paginated.map((p) => ({ ...p, id: p.id_producto }))}
              emptyMessage={
                list.hasSearch
                  ? 'No se encontraron productos con esa búsqueda.'
                  : 'No hay productos registrados.'
              }
            />
            <AdminPagination
              page={list.page}
              totalPages={list.totalPages}
              totalItems={list.totalItems}
              pageSize={list.pageSize}
              onPageChange={list.setPage}
            />
          </>
        )}
      </div>

      {modal && (
        <AdminModal
          title={modal.mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminField label="Nombre *">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.nom_producto}
                onChange={(e) => setForm({ ...form, nom_producto: e.target.value })}
                required
              />
            </AdminField>

            <AdminField label="Categoría *">
              <select
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.categoria_id}
                onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                required
              >
                <option value="">Seleccionar...</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nom_categoria}
                  </option>
                ))}
              </select>
            </AdminField>

            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text-dim)' }}>
              <input
                type="checkbox"
                checked={form.usa_variantes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    usa_variantes: e.target.checked,
                    usa_grupos_opcion: e.target.checked ? false : form.usa_grupos_opcion,
                    mostrar_imagen_variantes: e.target.checked
                      ? form.mostrar_imagen_variantes
                      : false,
                    max_sabores: e.target.checked ? form.max_sabores : '1',
                    promo_cantidad: e.target.checked ? '' : form.promo_cantidad,
                    promo_origen_id: e.target.checked ? '' : form.promo_origen_id,
                  })
                }
              />
              Usa variantes (sin precio fijo)
            </label>

            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text-dim)' }}>
              <input
                type="checkbox"
                checked={form.usa_grupos_opcion}
                onChange={(e) =>
                  setForm({
                    ...form,
                    usa_grupos_opcion: e.target.checked,
                    usa_variantes: e.target.checked ? false : form.usa_variantes,
                    promo_cantidad: e.target.checked ? '' : form.promo_cantidad,
                    promo_origen_id: e.target.checked ? '' : form.promo_origen_id,
                  })
                }
              />
              Usa grupos de opciones (ej. Tipo de Jack + Sabor)
            </label>
            {form.usa_grupos_opcion ? (
              <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
                Precio fijo del producto + pasos obligatorios en el modal (varios grupos).
              </p>
            ) : null}

            {!form.usa_variantes && (
              <AdminField label="Precio *">
                <input
                  type="number"
                  min="0"
                  className={adminInputClass}
                  style={adminInputStyle()}
                  value={form.precio_producto}
                  onChange={(e) => setForm({ ...form, precio_producto: e.target.value })}
                />
              </AdminField>
            )}

            {!form.usa_variantes && !form.usa_grupos_opcion && (
              <>
                <AdminField label="Promo: cantidad de mojitos (opcional)">
                  <select
                    className={adminInputClass}
                    style={adminInputStyle()}
                    value={form.promo_cantidad}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        promo_cantidad: e.target.value,
                        promo_origen_id: e.target.value ? form.promo_origen_id : '',
                      })
                    }
                  >
                    <option value="">Sin promo pack</option>
                    <option value="2">2 unidades</option>
                    <option value="3">3 unidades</option>
                    <option value="4">4 unidades</option>
                  </select>
                </AdminField>
                {form.promo_cantidad !== '' && (
                  <>
                    <AdminField label="Producto origen de sabores *">
                      <select
                        className={adminInputClass}
                        style={adminInputStyle()}
                        value={form.promo_origen_id}
                        onChange={(e) => setForm({ ...form, promo_origen_id: e.target.value })}
                        required
                      >
                        <option value="">Seleccionar...</option>
                        {productos
                          .filter(
                            (p) =>
                              Number(p.usa_variantes) === 1 &&
                              String(p.id_producto) !== String(modal?.id ?? ''),
                          )
                          .map((p) => (
                            <option key={p.id_producto} value={p.id_producto}>
                              {p.nom_producto}
                            </option>
                          ))}
                      </select>
                    </AdminField>
                    <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
                      El cliente elegirá un sabor por cada unidad del pack (ej. 3 mojitos = 3
                      sabores).
                    </p>
                  </>
                )}
              </>
            )}

            {form.usa_variantes && (
              <>
                <AdminField label="Tipo de variante">
                  <select
                    className={adminInputClass}
                    style={adminInputStyle()}
                    value={form.tipo_variante}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tipo_variante: e.target.value,
                        max_sabores: e.target.value === 'presentacion' ? '1' : form.max_sabores,
                      })
                    }
                  >
                    <option value="sabor">Sabor (mojitos / bebestibles)</option>
                    <option value="presentacion">Presentación (ceviches / porciones)</option>
                  </select>
                </AdminField>
                <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
                  Define cómo se muestra al cliente: &quot;Elige tu sabor&quot; o &quot;Elige tu
                  presentación&quot;.
                </p>

                {form.tipo_variante !== 'presentacion' && (
                  <>
                    <AdminField label={getVariantCopy(form.tipo_variante).adminMaxLabel}>
                      <select
                        className={adminInputClass}
                        style={adminInputStyle()}
                        value={form.max_sabores}
                        onChange={(e) => setForm({ ...form, max_sabores: e.target.value })}
                      >
                        <option value="1">{getVariantCopy(form.tipo_variante).adminOption1}</option>
                        <option value="2">{getVariantCopy(form.tipo_variante).adminOption2}</option>
                      </select>
                    </AdminField>
                    <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
                      {getVariantCopy(form.tipo_variante).adminMaxHint}
                    </p>
                  </>
                )}

                <label
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--admin-text)' }}
                >
                  <input
                    type="checkbox"
                    checked={form.mostrar_imagen_variantes}
                    onChange={(e) =>
                      setForm({ ...form, mostrar_imagen_variantes: e.target.checked })
                    }
                  />
                  Mostrar imágenes de variantes en el sitio
                </label>
                <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
                  {getVariantCopy(form.tipo_variante).adminImageHint}
                </p>

                <ProductoVariantesEditor
                  productoId={modal.mode === 'edit' ? modal.id : null}
                  variantes={variantes}
                  onChange={setVariantes}
                  mostrarImagenVariantes={form.mostrar_imagen_variantes}
                  tipoVariante={form.tipo_variante}
                />
              </>
            )}

            {form.usa_grupos_opcion && (
              <ProductoGruposOpcionEditor
                productoId={modal.mode === 'edit' ? modal.id : null}
                grupos={gruposOpcion}
                onChange={setGruposOpcion}
              />
            )}

            <AdminField label="Descripción">
              <textarea
                className={`${adminInputClass} min-h-16 resize-y`}
                style={adminInputStyle()}
                value={form.descripcion_producto}
                onChange={(e) => setForm({ ...form, descripcion_producto: e.target.value })}
              />
            </AdminField>

            <ProductImageInput
              value={form.img_prod}
              onChange={(img_prod) => setForm({ ...form, img_prod })}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminField label="Descuento %">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={adminInputClass}
                  style={adminInputStyle()}
                  value={form.descuento_porcentaje}
                  onChange={(e) => setForm({ ...form, descuento_porcentaje: e.target.value })}
                />
              </AdminField>
              <AdminField label="Stock">
                <input
                  type="number"
                  min="0"
                  className={adminInputClass}
                  style={adminInputStyle()}
                  value={form.stock_disponible}
                  onChange={(e) => setForm({ ...form, stock_disponible: e.target.value })}
                />
              </AdminField>
            </div>

            <AdminFormActions>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-full rounded-lg border px-4 py-2.5 text-sm font-semibold sm:w-auto sm:py-2"
                style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-dim)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-60 sm:w-auto sm:py-2"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }}
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </AdminFormActions>
          </form>
        </AdminModal>
      )}

      {toDelete && (
        <AdminConfirmDialog
          title="Eliminar producto"
          message={`¿Eliminar "${toDelete.nom_producto}"? Esta acción no se puede deshacer.`}
          onClose={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
