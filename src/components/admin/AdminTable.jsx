export default function AdminTable({ columns, rows, emptyMessage = 'Sin registros.' }) {
  if (!rows?.length) {
    return (
      <p className="py-12 text-center text-sm" style={{ color: 'var(--admin-text-dim)' }}>
        {emptyMessage}
      </p>
    )
  }

  const dataColumns = columns.filter((col) => col.key !== 'actions')
  const actionsColumn = columns.find((col) => col.key === 'actions')

  return (
    <>
      {/* Vista tarjetas — móvil */}
      <div className="divide-y sm:hidden" style={{ borderColor: 'var(--admin-border)' }}>
        {rows.map((row) => (
          <article key={row.id} className="space-y-3 p-4">
            {dataColumns.map((col) => (
              <div key={col.key} className="flex items-start justify-between gap-3 text-sm">
                <span
                  className="shrink-0 text-[11px] font-bold tracking-[0.1em] uppercase"
                  style={{ color: 'var(--admin-text-dim)' }}
                >
                  {col.label}
                </span>
                <span className="min-w-0 text-right font-medium">
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
            {actionsColumn && (
              <div
                className="flex items-center justify-end gap-2 border-t pt-3"
                style={{ borderColor: 'var(--admin-border)' }}
              >
                {actionsColumn.render(row)}
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Vista tabla — tablet/desktop */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-[11px] font-bold tracking-[0.12em] uppercase"
                  style={{ color: 'var(--admin-text-dim)' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: '1px solid var(--admin-border)' }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
