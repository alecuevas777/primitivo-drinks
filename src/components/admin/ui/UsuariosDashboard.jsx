import { useCallback, useEffect, useState } from 'react'
import { FiEye, FiEyeOff, FiPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminTable from '@/components/admin/AdminTable'
import AdminListToolbar from '@/components/admin/AdminListToolbar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminRowActions from '@/components/admin/AdminRowActions'
import AdminModal, { AdminField, AdminFormActions, adminInputClass, adminInputStyle } from '@/components/admin/AdminModal'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog'
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  updateUsuario,
} from '@/services/adminApi'
import { useAuthStore } from '@/store/authStore'
import { useAdminListControls } from '@/hooks/useAdminListControls'
import { formatPhone } from '@/utils'

const emptyForm = {
  nom_usuario: '',
  telefono_usuario: '',
  correo_usuario: '',
  contrasena: '',
}

function toPayload(form, includePassword) {
  const payload = {
    nom_usuario: form.nom_usuario.trim(),
    telefono_usuario: form.telefono_usuario.trim(),
    correo_usuario: form.correo_usuario.trim(),
  }

  if (includePassword && form.contrasena) {
    payload.contrasena = form.contrasena
  } else if (form.contrasena) {
    payload.contrasena = form.contrasena
  }

  return payload
}

export default function UsuariosDashboard() {
  const currentUser = useAuthStore((state) => state.user)
  const [usuarios, setUsuarios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const list = useAdminListControls(usuarios, {
    searchKeys: [
      'nom_usuario',
      'correo_usuario',
      'telefono_usuario',
      (row) => String(row.id_usuario ?? ''),
    ],
  })

  const loadUsuarios = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getUsuarios()
      setUsuarios(res.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsuarios()
  }, [loadUsuarios])

  const openCreate = () => {
    setForm(emptyForm)
    setShowPassword(false)
    setModal({ mode: 'create' })
  }

  const openEdit = (row) => {
    setForm({
      nom_usuario: row.nom_usuario ?? '',
      telefono_usuario: row.telefono_usuario ?? '',
      correo_usuario: row.correo_usuario ?? '',
      contrasena: '',
    })
    setShowPassword(false)
    setModal({ mode: 'edit', id: row.id_usuario })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.nom_usuario.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    if (!form.correo_usuario.trim()) {
      toast.error('El correo es obligatorio')
      return
    }

    if (modal.mode === 'create' && form.contrasena.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (modal.mode === 'edit' && form.contrasena && form.contrasena.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsSaving(true)

    try {
      const payload = toPayload(form, modal.mode === 'create')

      if (modal.mode === 'create') {
        await createUsuario(payload)
        toast.success('Usuario creado')
      } else {
        await updateUsuario(modal.id, payload)
        toast.success('Usuario actualizado')
      }

      setModal(null)
      await loadUsuarios()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return

    try {
      await deleteUsuario(toDelete.id_usuario)
      toast.success('Usuario eliminado')
      setToDelete(null)
      await loadUsuarios()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const columns = [
    { key: 'id', label: 'ID', render: (row) => row.id_usuario },
    { key: 'nombre', label: 'Nombre', render: (row) => row.nom_usuario },
    { key: 'correo', label: 'Correo', render: (row) => row.correo_usuario },
    { key: 'telefono', label: 'Teléfono', render: (row) => formatPhone(row.telefono_usuario) },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <AdminRowActions
          onEdit={() => openEdit(row)}
          onDelete={
            row.id_usuario === currentUser?.id_usuario
              ? undefined
              : () => setToDelete(row)
          }
        />
      ),
    },
  ]

  return (
    <>
      <AdminPageHeader
        title="Usuarios"
        description="Administra las cuentas con acceso al panel."
        action={
          <AdminListToolbar
            searchValue={list.search}
            onSearchChange={list.setSearch}
            searchPlaceholder="Buscar usuario..."
            action={
              <button
                type="button"
                onClick={openCreate}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 sm:w-auto"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }}
              >
                <FiPlus size={16} />
                Nuevo usuario
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
            Cargando usuarios...
          </p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-red-400">{error}</p>
        ) : (
          <>
            <AdminTable
              columns={columns}
              rows={list.paginated.map((u) => ({ ...u, id: u.id_usuario }))}
              emptyMessage={
                list.hasSearch
                  ? 'No se encontraron usuarios con esa búsqueda.'
                  : 'No hay usuarios registrados.'
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
          title={modal.mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
          onClose={() => {
            setModal(null)
            setShowPassword(false)
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminField label="Nombre *">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.nom_usuario}
                onChange={(e) => setForm({ ...form, nom_usuario: e.target.value })}
                required
              />
            </AdminField>

            <AdminField label="Correo *">
              <input
                type="email"
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.correo_usuario}
                onChange={(e) => setForm({ ...form, correo_usuario: e.target.value })}
                required
              />
            </AdminField>

            <AdminField label="Teléfono *">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.telefono_usuario}
                onChange={(e) => setForm({ ...form, telefono_usuario: e.target.value })}
                required
              />
            </AdminField>

            <AdminField
              label={modal.mode === 'create' ? 'Contraseña *' : 'Nueva contraseña (opcional)'}
            >
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${adminInputClass} pr-11`}
                  style={adminInputStyle()}
                  value={form.contrasena}
                  onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                  required={modal.mode === 'create'}
                  minLength={modal.mode === 'create' ? 8 : undefined}
                  placeholder={modal.mode === 'edit' ? 'Dejar vacío para no cambiar' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--admin-text-dim)' }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </AdminField>

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
          title="Eliminar usuario"
          message={`¿Eliminar "${toDelete.nom_usuario}"? Esta acción no se puede deshacer.`}
          onClose={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
