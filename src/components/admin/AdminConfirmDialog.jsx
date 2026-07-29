import AdminModal, { AdminFormActions } from '@/components/admin/AdminModal'

export default function AdminConfirmDialog({ title, message, confirmLabel = 'Eliminar', onConfirm, onClose }) {
  return (
    <AdminModal title={title} onClose={onClose}>
      <p className="text-sm" style={{ color: 'var(--admin-text-dim)' }}>
        {message}
      </p>
      <AdminFormActions>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/5 sm:w-auto sm:py-2"
          style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-dim)' }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 sm:w-auto sm:py-2"
        >
          {confirmLabel}
        </button>
      </AdminFormActions>
    </AdminModal>
  )
}
