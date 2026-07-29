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
import {
  createCategoria,
  deleteCategoria,
  getAdminCategorias,
  updateCategoria,
} from '@/services/adminApi'
import { useAdminListControls } from '@/hooks/useAdminListControls'

const emptyForm = {
  nom_categoria: '',
  descripcion: '',
  descuento_porcentaje: '',
  aviso_stock_desde: '',
}

function toPayload(form) {
  return {
    nom_categoria: form.nom_categoria.trim(),
    descripcion: form.descripcion.trim() || null,
    descuento_porcentaje: form.descuento_porcentaje !== '' ? Number(form.descuento_porcentaje) : null,
    aviso_stock_desde: form.aviso_stock_desde !== '' ? Number(form.aviso_stock_desde) : null,
  }
}

export default function CategoriasDashboard() {
  const [categorias, setCategorias] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const list = useAdminListControls(categorias, {
    searchKeys: ['nom_categoria', 'descripcion', (row) => String(row.id_categoria ?? '')],
  })

  const loadCategorias = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getAdminCategorias()
      setCategorias(res.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategorias()
  }, [loadCategorias])

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }

  const openEdit = (row) => {
    setForm({
      nom_categoria: row.nom_categoria ?? '',
      descripcion: row.descripcion ?? '',
      descuento_porcentaje: row.descuento_porcentaje ?? '',
      aviso_stock_desde: row.aviso_stock_desde ?? '',
    })
    setModal({ mode: 'edit', id: row.id_categoria })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nom_categoria.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    setIsSaving(true)
    try {
      const payload = toPayload(form)
      if (modal.mode === 'create') {
        await createCategoria(payload)
        toast.success('Categoría creada')
      } else {
        await updateCategoria(modal.id, payload)
        toast.success('Categoría actualizada')
      }
      setModal(null)
      await loadCategorias()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await deleteCategoria(toDelete.id_categoria)
      toast.success('Categoría eliminada')
      setToDelete(null)
      await loadCategorias()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const columns = [
    { key: 'id', label: 'ID', render: (row) => row.id_categoria },
    { key: 'nombre', label: 'Nombre', render: (row) => row.nom_categoria },
    { key: 'descripcion', label: 'Descripción', render: (row) => row.descripcion || '—' },
    {
      key: 'descuento',
      label: 'Descuento',
      render: (row) =>
        Number(row.descuento_porcentaje) > 0 ? `${row.descuento_porcentaje}%` : '—',
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
        title="Categorías"
        description="Gestiona las categorías del catálogo."
        action={
          <AdminListToolbar
            searchValue={list.search}
            onSearchChange={list.setSearch}
            searchPlaceholder="Buscar categoría..."
            action={
              <button
                type="button"
                onClick={openCreate}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 sm:w-auto"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }}
              >
                <FiPlus size={16} />
                Nueva categoría
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
            Cargando categorías...
          </p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-red-400">{error}</p>
        ) : (
          <>
            <AdminTable
              columns={columns}
              rows={list.paginated.map((c) => ({ ...c, id: c.id_categoria }))}
              emptyMessage={
                list.hasSearch
                  ? 'No se encontraron categorías con esa búsqueda.'
                  : 'No hay categorías registradas.'
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
          title={modal.mode === 'create' ? 'Nueva categoría' : 'Editar categoría'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminField label="Nombre *">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.nom_categoria}
                onChange={(e) => setForm({ ...form, nom_categoria: e.target.value })}
                required
              />
            </AdminField>
            <AdminField label="Descripción">
              <textarea
                className={`${adminInputClass} min-h-20 resize-y`}
                style={adminInputStyle()}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </AdminField>
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
              <AdminField label="Aviso stock desde">
                <input
                  type="number"
                  min="0"
                  className={adminInputClass}
                  style={adminInputStyle()}
                  value={form.aviso_stock_desde}
                  onChange={(e) => setForm({ ...form, aviso_stock_desde: e.target.value })}
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
          title="Eliminar categoría"
          message={`¿Eliminar "${toDelete.nom_categoria}"? Esta acción no se puede deshacer.`}
          onClose={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
