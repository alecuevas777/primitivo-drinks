import { FiCopy } from 'react-icons/fi'
import { AdminField, adminInputClass, adminInputStyle } from '@/components/admin/AdminModal'
import { DAY_LABELS, normalizeHorarios } from '@/store/configStore'

function DayToggle({ active, onChange }) {
  return (
    <div className="flex rounded-lg border p-0.5" style={{ borderColor: 'var(--admin-border)' }}>
      <button
        type="button"
        onClick={() => onChange(true)}
        className="rounded-md px-3 py-1.5 text-xs font-bold transition-colors"
        style={
          active
            ? { backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }
            : { color: 'var(--admin-text-dim)' }
        }
      >
        Abierto
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className="rounded-md px-3 py-1.5 text-xs font-bold transition-colors"
        style={
          !active
            ? { backgroundColor: '#ef4444', color: '#fff' }
            : { color: 'var(--admin-text-dim)' }
        }
      >
        Cerrado
      </button>
    </div>
  )
}

export default function HorarioAtencionEditor({ horarios, onChange }) {
  const rows = normalizeHorarios(horarios)

  const updateDay = (dia, patch) => {
    onChange(
      rows.map((row) =>
        Number(row.dia_semana) === dia ? { ...row, ...patch, dia_semana: dia } : row,
      ),
    )
  }

  const applyMondayToAll = () => {
    const monday = rows.find((row) => Number(row.dia_semana) === 1)
    if (!monday) return

    onChange(
      rows.map((row) => ({
        ...row,
        hora_apertura: monday.hora_apertura,
        hora_cierre: monday.hora_cierre,
        abierto: monday.abierto,
      })),
    )
  }

  const setAllOpen = (abierto) => {
    onChange(rows.map((row) => ({ ...row, abierto: abierto ? 1 : 0 })))
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-lg border px-4 py-3 text-xs leading-relaxed"
        style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-dim)' }}
      >
        <strong style={{ color: 'var(--admin-text)' }}>Cómo funciona:</strong> por cada día
        eliges si hay atención (<em>Abierto</em>) o no (<em>Cerrado</em>). Si el día está
        abierto, el badge del sitio mostrará <strong>Abierto</strong> solo dentro del rango de
        horas configurado.
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={applyMondayToAll}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold"
          style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
        >
          <FiCopy size={13} />
          Copiar horario del lunes a todos
        </button>
        <button
          type="button"
          onClick={() => setAllOpen(true)}
          className="rounded-lg border px-3 py-2 text-xs font-semibold"
          style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-accent)' }}
        >
          Todos abiertos
        </button>
        <button
          type="button"
          onClick={() => setAllOpen(false)}
          className="rounded-lg border px-3 py-2 text-xs font-semibold"
          style={{ borderColor: 'var(--admin-border)', color: '#ef4444' }}
        >
          Todos cerrados
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((row) => {
          const dia = Number(row.dia_semana)
          const isOpen = Boolean(Number(row.abierto))

          return (
            <div
              key={`dia-${dia}`}
              className="rounded-xl border p-4 transition-opacity"
              style={{
                borderColor: isOpen ? 'var(--admin-border)' : '#ef444433',
                backgroundColor: isOpen ? 'transparent' : 'rgba(239,68,68,0.04)',
                opacity: isOpen ? 1 : 0.85,
              }}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold">{DAY_LABELS[dia]}</p>
                <DayToggle
                  active={isOpen}
                  onChange={(abierto) => updateDay(dia, { abierto: abierto ? 1 : 0 })}
                />
              </div>

              {isOpen ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AdminField label="Apertura">
                    <input
                      type="time"
                      className={adminInputClass}
                      style={adminInputStyle()}
                      value={row.hora_apertura}
                      onChange={(e) => updateDay(dia, { hora_apertura: e.target.value })}
                    />
                  </AdminField>
                  <AdminField label="Cierre">
                    <input
                      type="time"
                      className={adminInputClass}
                      style={adminInputStyle()}
                      value={row.hora_cierre}
                      onChange={(e) => updateDay(dia, { hora_cierre: e.target.value })}
                    />
                  </AdminField>
                </div>
              ) : (
                <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
                  Sin atención este día. El sitio mostrará <strong>Cerrado</strong>.
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
