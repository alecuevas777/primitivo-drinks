export default function StatCard({ icon: Icon, value, label }) {
  return (
    <div
      className="relative rounded-xl border p-4 sm:p-5"
      style={{
        backgroundColor: 'var(--admin-surface)',
        borderColor: 'var(--admin-border)',
      }}
    >
      <div
        className="absolute -top-px left-4 right-4 border-t border-dashed"
        style={{ borderColor: 'var(--admin-border)' }}
      />

      <Icon size={18} style={{ color: 'var(--admin-accent)' }} />

      <p className="mt-3 font-mono text-2xl font-bold tabular-nums sm:mt-4 sm:text-3xl">
        {String(value ?? 0).padStart(2, '0')}
      </p>

      <p
        className="mt-1 text-xs font-semibold tracking-wide"
        style={{ color: 'var(--admin-text-dim)' }}
      >
        {label}
      </p>
    </div>
  )
}
