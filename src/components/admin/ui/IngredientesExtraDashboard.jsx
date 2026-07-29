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
  createIngredienteExtra,
  deleteIngredienteExtra,
  getIngredientesExtra,
  updateIngredienteExtra,
} from '@/services/adminApi'
import { formatPrice } from '@/utils'
import { useAdminListControls } from '@/hooks/useAdminListControls'

const emptyForm = {
  nom_ingrediente: '',
  precio_extra: '',
  activo: true,
}

function toPayload(form) {
  return {
    nom_ingrediente: form.nom_ingrediente.trim(),
    precio_extra: Number(form.precio_extra),
    activo: form.activo,
  }
}

function itemToForm(item) {
  return {
    nom_ingrediente: item.nom_ingrediente ?? '',
    precio_extra: item.precio_extra != null ? String(item.precio_extra) : '',
    activo: Boolean(Number(item.activo ?? 1)),
  }
}

export default function IngredientesExtraDashboard() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const list = useAdminListControls(items, {
    searchKeys: [
      'nom_ingrediente',
      (row) => String(row.precio_extra ?? ''),
      (row) => String(row.id_ingrediente_extra ?? ''),
    ],
  })

  const loadItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getIngredientesExtra()
      setItems(res.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }

  const openEdit = (row) => {
    setForm(itemToForm(row))
    setModal({ mode: 'edit', id: row.id_ingrediente_extra })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.nom_ingrediente.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    if (form.precio_extra === '' || Number(form.precio_extra) < 0) {
      toast.error('Ingresa un precio válido')
      return
    }

    setIsSaving(true)
    try {
      const payload = toPayload(form)
      if (modal.mode === 'create') {
        await createIngredienteExtra(payload)
        toast.success('Extra creado')
      } else {
        await updateIngredienteExtra(modal.id, payload)
        toast.success('Extra actualizado')
      }
      setModal(null)
      await loadItems()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await deleteIngredienteExtra(toDelete.id_ingrediente_extra)
      toast.success('Extra eliminado')
      setToDelete(null)
      await loadItems()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const columns = [
    { key: 'id', label: 'ID', render: (row) => row.id_ingrediente_extra },
    { key: 'nombre', label: 'Nombre', render: (row) => row.nom_ingrediente },
    {
      key: 'precio',
      label: 'Precio',
      render: (row) => formatPrice(Number(row.precio_extra)),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (row) => (Number(row.activo) ? 'Activo' : 'Inactivo'),
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
        title="Ingredientes extra"
        description="Productos adicionales que el cliente puede agregar al pedido (Red Bull, bolsas de hielo, etc.)."
        action={
          <AdminListToolbar
            searchValue={list.search}
            onSearchChange={list.setSearch}
            searchPlaceholder="Buscar extra..."
            action={
              <button
                type="button"
                onClick={openCreate}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 sm:w-auto"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }}
              >
                <FiPlus size={16} />
                Nuevo extra
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
            Cargando extras...
          </p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-red-400">{error}</p>
        ) : (
          <>
            <AdminTable
              columns={columns}
              rows={list.paginated.map((row) => ({
                ...row,
                id: row.id_ingrediente_extra,
              }))}
              emptyMessage={
                list.hasSearch
                  ? 'No se encontraron extras con esa búsqueda.'
                  : 'No hay ingredientes extra registrados.'
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
          title={modal.mode === 'create' ? 'Nuevo ingrediente extra' : 'Editar ingrediente extra'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminField label="Nombre *">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.nom_ingrediente}
                onChange={(e) => setForm({ ...form, nom_ingrediente: e.target.value })}
                placeholder="Ej: Red Bull"
              />
            </AdminField>

            <AdminField label="Precio (CLP) *">
              <input
                type="number"
                min="0"
                step="1"
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.precio_extra}
                onChange={(e) => setForm({ ...form, precio_extra: e.target.value })}
                placeholder="Ej: 1500"
              />
            </AdminField>

            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text)' }}>
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
              Activo (visible en el checkout)
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
          title="Eliminar extra"
          message={`¿Eliminar "${toDelete.nom_ingrediente}"?`}
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  )
}
