export default function AdminPageHeader({ title, description, action }) {
  return (
    <header className="min-w-0 flex-1">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 text-sm" style={{ color: 'var(--admin-text-dim)' }}>
              {description}
            </p>
          )}
        </div>
        {action && <div className="w-full min-w-0 lg:max-w-xl lg:flex-1">{action}</div>}
      </div>
    </header>
  )
}
