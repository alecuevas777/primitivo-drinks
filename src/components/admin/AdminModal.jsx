import { FiX } from 'react-icons/fi'

export default function AdminModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[92dvh] w-full flex-col rounded-t-2xl border shadow-xl sm:max-h-[85vh] sm:max-w-lg sm:rounded-xl"
        style={{
          backgroundColor: 'var(--admin-surface)',
          borderColor: 'var(--admin-border)',
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4 sm:border-b-0 sm:px-6 sm:pt-6 sm:pb-0"
          style={{ borderColor: 'var(--admin-border)' }}
        >
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
            style={{ color: 'var(--admin-text-dim)' }}
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:pb-6">{children}</div>
      </div>
    </div>
  )
}

export function AdminField({ label, children }) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block text-xs font-semibold tracking-wide"
        style={{ color: 'var(--admin-text-dim)' }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

export const adminInputClass =
  'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--admin-accent)]'

export function adminInputStyle() {
  return {
    backgroundColor: 'var(--admin-bg)',
    borderColor: 'var(--admin-border)',
    color: 'var(--admin-text)',
  }
}

export function AdminFormActions({ children }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
      {children}
    </div>
  )
}
