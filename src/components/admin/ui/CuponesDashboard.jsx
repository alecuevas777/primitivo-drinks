import { useCallback, useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminTable from '@/components/admin/AdminTable'
import AdminListToolbar from '@/components/admin/AdminListToolbar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminRowActions from '@/components/admin/AdminRowActions'
import AdminModal, {
  AdminField,
  AdminFormActions,
  adminInputClass,
  adminInputStyle,
} from '@/components/admin/AdminModal'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog'
import {
  createCupon,
  deleteCupon,
  getAdminCategorias,
  getAdminProductos,
  getCupones,
  updateCupon,
} from '@/services/adminApi'
import { formatPrice } from '@/utils'
import { useAdminListControls } from '@/hooks/useAdminListControls'

const TIPO_OPTIONS = [
  { value: 'porcentaje_pedido', label: '% sobre el pedido completo' },
  { value: 'porcentaje_categoria', label: '% en categorías seleccionadas' },
  { value: 'porcentaje_producto', label: '% en productos seleccionados' },
  { value: 'envio_gratis', label: 'Envío gratis' },
]

const TIPO_LABELS = Object.fromEntries(TIPO_OPTIONS.map((o) => [o.value, o.label]))

const emptyForm = {
  codigo: '',
  descripcion: '',
  tipo: 'porcentaje_pedido',
  valor: '',
  pedido_minimo: '',
  solo_delivery: true,
  activo: true,
  fecha_inicio: '',
  fecha_fin: '',
  producto_ids: [],
  categoria_ids: [],
}

function toPayload(form) {
  return {
    codigo: form.codigo.trim().toUpperCase(),
    descripcion: form.descripcion.trim() || null,
    tipo: form.tipo,
    valor: form.tipo === 'envio_gratis' ? 0 : Number(form.valor || 0),
    pedido_minimo: form.pedido_minimo !== '' ? Number(form.pedido_minimo) : null,
    solo_delivery: form.solo_delivery,
    activo: form.activo,
    fecha_inicio: form.fecha_inicio || null,
    fecha_fin: form.fecha_fin || null,
    producto_ids: form.producto_ids.map(Number),
    categoria_ids: form.categoria_ids.map(Number),
  }
}

function cuponToForm(cupon) {
  return {
    codigo: cupon.codigo ?? '',
    descripcion: cupon.descripcion ?? '',
    tipo: cupon.tipo ?? 'porcentaje_pedido',
    valor: cupon.tipo === 'envio_gratis' ? '' : String(cupon.valor ?? ''),
    pedido_minimo: cupon.pedido_minimo != null ? String(cupon.pedido_minimo) : '',
    solo_delivery: Boolean(Number(cupon.solo_delivery)),
    activo: Boolean(Number(cupon.activo ?? 1)),
    fecha_inicio: cupon.fecha_inicio ?? '',
    fecha_fin: cupon.fecha_fin ?? '',
    producto_ids: (cupon.producto_ids ?? []).map(String),
    categoria_ids: (cupon.categoria_ids ?? []).map(String),
  }
}

function toggleId(list, id) {
  const value = String(id)
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export default function CuponesDashboard() {
  const [cupones, setCupones] = useState([])
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const list = useAdminListControls(cupones, {
    searchKeys: [
      'codigo',
      'descripcion',
      (row) => TIPO_LABELS[row.tipo] ?? row.tipo,
      (row) => String(row.id_cupon ?? ''),
    ],
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [cuponesRes, productosRes, categoriasRes] = await Promise.all([
        getCupones(),
        getAdminProductos(),
        getAdminCategorias(),
      ])
      setCupones(cuponesRes.data ?? [])
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
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }

  const openEdit = (row) => {
    setForm(cuponToForm(row))
    setModal({ mode: 'edit', id: row.id_cupon })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.codigo.trim()) {
      toast.error('El código es obligatorio')
      return
    }

    if (form.tipo !== 'envio_gratis' && (form.valor === '' || Number(form.valor) < 0)) {
      toast.error('El valor del descuento es obligatorio')
      return
    }

    if (form.tipo === 'porcentaje_producto' && form.producto_ids.length === 0) {
      toast.error('Selecciona al menos un producto')
      return
    }

    if (form.tipo === 'porcentaje_categoria' && form.categoria_ids.length === 0) {
      toast.error('Selecciona al menos una categoría')
      return
    }

    setIsSaving(true)
    try {
      const payload = toPayload(form)
      if (modal.mode === 'create') {
        await createCupon(payload)
        toast.success('Cupón creado')
      } else {
        await updateCupon(modal.id, payload)
        toast.success('Cupón actualizado')
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
      await deleteCupon(toDelete.id_cupon)
      toast.success('Cupón eliminado')
      setToDelete(null)
      await loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const showProductos =
    form.tipo === 'porcentaje_producto' ||
    form.tipo === 'porcentaje_pedido' ||
    form.producto_ids.length > 0
  const showCategorias =
    form.tipo === 'porcentaje_categoria' ||
    form.tipo === 'porcentaje_pedido' ||
    form.categoria_ids.length > 0

  const columns = [
    { key: 'id', label: 'ID', render: (row) => row.id_cupon },
    {
      key: 'codigo',
      label: 'Código',
      render: (row) => (
        <span className="font-mono font-semibold">{row.codigo}</span>
      ),
    },
    { key: 'descripcion', label: 'Descripción', render: (row) => row.descripcion || '—' },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (row) => TIPO_LABELS[row.tipo] ?? row.tipo,
    },
    {
      key: 'valor',
      label: 'Valor',
      render: (row) =>
        row.tipo === 'envio_gratis' ? 'Envío gratis' : `${Number(row.valor)}%`,
    },
    {
      key: 'minimo',
      label: 'Mínimo',
      render: (row) =>
        row.pedido_minimo != null ? formatPrice(Number(row.pedido_minimo)) : '—',
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (row) => (
        <span style={{ color: Number(row.activo) ? 'var(--admin-accent)' : 'var(--admin-text-dim)' }}>
          {Number(row.activo) ? 'Activo' : 'Inactivo'}
        </span>
      ),
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
        title="Cupones"
        description="Promociones y códigos de descuento."
        action={
          <AdminListToolbar
            searchValue={list.search}
            onSearchChange={list.setSearch}
            searchPlaceholder="Buscar cupón..."
            action={
              <button
                type="button"
                onClick={openCreate}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 sm:w-auto"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }}
              >
                <FiPlus size={16} />
                Nuevo cupón
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
            Cargando cupones...
          </p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-red-400">{error}</p>
        ) : (
          <>
            <AdminTable
              columns={columns}
              rows={list.paginated.map((c) => ({ ...c, id: c.id_cupon }))}
              emptyMessage={
                list.hasSearch
                  ? 'No se encontraron cupones con esa búsqueda.'
                  : 'No hay cupones registrados.'
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
          title={modal.mode === 'create' ? 'Nuevo cupón' : 'Editar cupón'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminField label="Código *">
                <input
                  className={`${adminInputClass} font-mono uppercase`}
                  style={adminInputStyle()}
                  value={form.codigo}
                  onChange={(e) =>
                    setForm({ ...form, codigo: e.target.value.toUpperCase() })
                  }
                  placeholder="PROMO10"
                  required
                />
              </AdminField>
              <AdminField label="Tipo *">
                <select
                  className={adminInputClass}
                  style={adminInputStyle()}
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                  {TIPO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>

            <AdminField label="Descripción">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Ej: 10% de descuento en tu pedido"
              />
            </AdminField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {form.tipo !== 'envio_gratis' && (
                <AdminField label="Valor (%) *">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={adminInputClass}
                    style={adminInputStyle()}
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  />
                </AdminField>
              )}
              <AdminField label="Pedido mínimo">
                <input
                  type="number"
                  min="0"
                  className={adminInputClass}
                  style={adminInputStyle()}
                  value={form.pedido_minimo}
                  onChange={(e) => setForm({ ...form, pedido_minimo: e.target.value })}
                  placeholder="Opcional"
                />
              </AdminField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminField label="Vigencia desde">
                <input
                  type="date"
                  className={adminInputClass}
                  style={adminInputStyle()}
                  value={form.fecha_inicio}
                  onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                />
              </AdminField>
              <AdminField label="Vigencia hasta">
                <input
                  type="date"
                  className={adminInputClass}
                  style={adminInputStyle()}
                  value={form.fecha_fin}
                  onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                />
              </AdminField>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                />
                Activo
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.solo_delivery}
                  onChange={(e) => setForm({ ...form, solo_delivery: e.target.checked })}
                />
                Solo delivery
              </label>
            </div>

            {(showProductos || form.tipo === 'porcentaje_producto') && (
              <AdminField label="Productos aplicables">
                <div
                  className="max-h-40 space-y-2 overflow-y-auto rounded-lg border p-3"
                  style={{ borderColor: 'var(--admin-border)' }}
                >
                  {productos.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
                      No hay productos disponibles.
                    </p>
                  ) : (
                    productos.map((producto) => (
                      <label key={producto.id_producto} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.producto_ids.includes(String(producto.id_producto))}
                          onChange={() =>
                            setForm({
                              ...form,
                              producto_ids: toggleId(form.producto_ids, producto.id_producto),
                            })
                          }
                        />
                        {producto.nom_producto}
                      </label>
                    ))
                  )}
                </div>
              </AdminField>
            )}

            {(showCategorias || form.tipo === 'porcentaje_categoria') && (
              <AdminField label="Categorías aplicables">
                <div
                  className="max-h-40 space-y-2 overflow-y-auto rounded-lg border p-3"
                  style={{ borderColor: 'var(--admin-border)' }}
                >
                  {categorias.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
                      No hay categorías disponibles.
                    </p>
                  ) : (
                    categorias.map((categoria) => (
                      <label
                        key={categoria.id_categoria}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={form.categoria_ids.includes(String(categoria.id_categoria))}
                          onChange={() =>
                            setForm({
                              ...form,
                              categoria_ids: toggleId(form.categoria_ids, categoria.id_categoria),
                            })
                          }
                        />
                        {categoria.nom_categoria}
                      </label>
                    ))
                  )}
                </div>
              </AdminField>
            )}

            {form.tipo === 'porcentaje_pedido' && (
              <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
                Opcional: restringe el cupón marcando productos o categorías que deben estar en el
                pedido.
              </p>
            )}

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
          title="Eliminar cupón"
          message={`¿Eliminar el cupón "${toDelete.codigo}"? Esta acción no se puede deshacer.`}
          onClose={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
