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
  createDeliveryZona,
  deleteDeliveryZona,
  getDeliveryZonas,
  updateDeliveryZona,
} from '@/services/adminApi'
import { formatPrice } from '@/utils'
import { useAdminListControls } from '@/hooks/useAdminListControls'

const emptyForm = {
  comuna: '',
  costo: '',
  tiempo_estimado: '',
  activo: true,
}

function toPayload(form) {
  return {
    comuna: form.comuna.trim(),
    costo: Number(form.costo),
    tiempo_estimado: form.tiempo_estimado.trim() || null,
    activo: form.activo,
  }
}

function zonaToForm(zona) {
  return {
    comuna: zona.comuna ?? '',
    costo: zona.costo != null ? String(zona.costo) : '',
    tiempo_estimado: zona.tiempo_estimado ?? '',
    activo: Boolean(Number(zona.activo ?? 1)),
  }
}

export default function DeliveryZonasDashboard() {
  const [zonas, setZonas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const list = useAdminListControls(zonas, {
    searchKeys: [
      'comuna',
      'tiempo_estimado',
      (row) => String(row.costo ?? ''),
      (row) => String(row.id ?? ''),
    ],
  })

  const loadZonas = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getDeliveryZonas()
      setZonas(res.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadZonas()
  }, [loadZonas])

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }

  const openEdit = (row) => {
    setForm(zonaToForm(row))
    setModal({ mode: 'edit', id: row.id })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.comuna.trim()) {
      toast.error('La comuna es obligatoria')
      return
    }

    if (form.costo === '' || Number(form.costo) < 0) {
      toast.error('Ingresa un costo de delivery válido')
      return
    }

    setIsSaving(true)
    try {
      const payload = toPayload(form)
      if (modal.mode === 'create') {
        await createDeliveryZona(payload)
        toast.success('Zona de delivery creada')
      } else {
        await updateDeliveryZona(modal.id, payload)
        toast.success('Zona de delivery actualizada')
      }
      setModal(null)
      await loadZonas()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await deleteDeliveryZona(toDelete.id)
      toast.success('Zona eliminada')
      setToDelete(null)
      await loadZonas()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const columns = [
    { key: 'id', label: 'ID', render: (row) => row.id },
    { key: 'comuna', label: 'Comuna', render: (row) => row.comuna },
    {
      key: 'costo',
      label: 'Costo delivery',
      render: (row) => formatPrice(Number(row.costo)),
    },
    {
      key: 'tiempo',
      label: 'Tiempo estimado',
      render: (row) => row.tiempo_estimado || '—',
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (row) => (Number(row.activo) ? 'Activa' : 'Inactiva'),
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
        title="Zonas de delivery"
        description="Define comunas, costos y tiempos estimados de entrega."
        action={
          <AdminListToolbar
            searchValue={list.search}
            onSearchChange={list.setSearch}
            searchPlaceholder="Buscar comuna..."
            action={
              <button
                type="button"
                onClick={openCreate}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 sm:w-auto"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }}
              >
                <FiPlus size={16} />
                Nueva zona
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
            Cargando zonas de delivery...
          </p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-red-400">{error}</p>
        ) : (
          <>
            <AdminTable
              columns={columns}
              rows={list.paginated}
              emptyMessage={
                list.hasSearch
                  ? 'No se encontraron zonas con esa búsqueda.'
                  : 'No hay zonas de delivery registradas.'
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
          title={modal.mode === 'create' ? 'Nueva zona de delivery' : 'Editar zona de delivery'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminField label="Comuna *">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.comuna}
                onChange={(e) => setForm({ ...form, comuna: e.target.value })}
                placeholder="Ej: Centro"
              />
            </AdminField>

            <AdminField label="Costo delivery (CLP) *">
              <input
                type="number"
                min="0"
                step="1"
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.costo}
                onChange={(e) => setForm({ ...form, costo: e.target.value })}
                placeholder="Ej: 2000"
              />
            </AdminField>

            <AdminField label="Tiempo estimado">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.tiempo_estimado}
                onChange={(e) => setForm({ ...form, tiempo_estimado: e.target.value })}
                placeholder="Ej: 20-35 min"
              />
            </AdminField>

            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text)' }}>
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
              Zona activa (visible en el checkout)
            </label>

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
          title="Eliminar zona"
          message={`¿Eliminar la zona "${toDelete.comuna}"?`}
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  )
}
