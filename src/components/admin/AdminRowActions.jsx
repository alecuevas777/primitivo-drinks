import { FiEdit2, FiTrash2 } from 'react-icons/fi'

export default function AdminRowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg p-2.5 transition-colors hover:bg-white/5 sm:p-2"
        style={{ color: 'var(--admin-accent)' }}
        aria-label="Editar"
      >
        <FiEdit2 size={15} />
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-2.5 text-red-400 transition-colors hover:bg-red-500/10 sm:p-2"
          aria-label="Eliminar"
        >
          <FiTrash2 size={15} />
        </button>
      )}
    </div>
  )
}
