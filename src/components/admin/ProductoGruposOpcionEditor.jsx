import { useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { AdminField, adminInputClass, adminInputStyle } from '@/components/admin/AdminModal'
import {
  createOpcion,
  createOpcionGrupo,
  deleteOpcion,
  deleteOpcionGrupo,
  updateOpcion,
  updateOpcionGrupo,
} from '@/services/adminApi'

const emptyGrupo = {
  nombre: '',
  min_seleccion: '1',
  max_seleccion: '1',
  orden: '0',
}

const emptyOpcion = {
  nombre_opcion: '',
  precio_extra: '0',
  stock: '',
  orden: '0',
}

export default function ProductoGruposOpcionEditor({ productoId, grupos, onChange }) {
  const [grupoDraft, setGrupoDraft] = useState(emptyGrupo)
  const [opcionDrafts, setOpcionDrafts] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const refreshGrupo = (grupoId, nextGrupo) => {
    onChange(grupos.map((g) => (Number(g.id) === Number(grupoId) ? nextGrupo : g)))
  }

  const handleAddGrupo = async () => {
    if (!productoId) {
      toast.error('Guarda el producto primero para añadir grupos')
      return
    }
    if (!grupoDraft.nombre.trim()) {
      toast.error('El nombre del grupo es obligatorio')
      return
    }

    setIsSaving(true)
    try {
      const res = await createOpcionGrupo(productoId, {
        nombre: grupoDraft.nombre.trim(),
        min_seleccion: Number(grupoDraft.min_seleccion) || 1,
        max_seleccion: Number(grupoDraft.max_seleccion) || 1,
        orden: Number(grupoDraft.orden) || 0,
      })
      onChange([...(grupos ?? []), res.data])
      setGrupoDraft(emptyGrupo)
      toast.success('Grupo agregado')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateGrupo = async (grupo) => {
    setIsSaving(true)
    try {
      const res = await updateOpcionGrupo(grupo.id, {
        nombre: grupo.nombre,
        min_seleccion: Number(grupo.min_seleccion) || 1,
        max_seleccion: Number(grupo.max_seleccion) || 1,
        orden: Number(grupo.orden) || 0,
      })
      refreshGrupo(grupo.id, { ...res.data, opciones: grupo.opciones ?? [] })
      toast.success('Grupo actualizado')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteGrupo = async (grupoId) => {
    if (!window.confirm('¿Eliminar este grupo y todas sus opciones?')) return
    setIsSaving(true)
    try {
      await deleteOpcionGrupo(grupoId)
      onChange(grupos.filter((g) => Number(g.id) !== Number(grupoId)))
      toast.success('Grupo eliminado')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddOpcion = async (grupoId) => {
    const draft = opcionDrafts[grupoId] ?? emptyOpcion
    if (!draft.nombre_opcion.trim()) {
      toast.error('El nombre de la opción es obligatorio')
      return
    }

    setIsSaving(true)
    try {
      const res = await createOpcion(grupoId, {
        nombre_opcion: draft.nombre_opcion.trim(),
        precio_extra: Number(draft.precio_extra) || 0,
        stock: draft.stock !== '' ? Number(draft.stock) : null,
        orden: Number(draft.orden) || 0,
      })
      const grupo = grupos.find((g) => Number(g.id) === Number(grupoId))
      refreshGrupo(grupoId, {
        ...grupo,
        opciones: [...(grupo?.opciones ?? []), res.data],
      })
      setOpcionDrafts((current) => ({ ...current, [grupoId]: emptyOpcion }))
      toast.success('Opción agregada')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteOpcion = async (grupoId, opcionId) => {
    setIsSaving(true)
    try {
      await deleteOpcion(opcionId)
      const grupo = grupos.find((g) => Number(g.id) === Number(grupoId))
      refreshGrupo(grupoId, {
        ...grupo,
        opciones: (grupo?.opciones ?? []).filter((o) => Number(o.id) !== Number(opcionId)),
      })
      toast.success('Opción eliminada')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateOpcion = async (grupoId, opcion) => {
    setIsSaving(true)
    try {
      const res = await updateOpcion(opcion.id, {
        nombre_opcion: opcion.nombre_opcion,
        precio_extra: Number(opcion.precio_extra) || 0,
        stock: opcion.stock !== '' && opcion.stock != null ? Number(opcion.stock) : null,
        orden: Number(opcion.orden) || 0,
      })
      const grupo = grupos.find((g) => Number(g.id) === Number(grupoId))
      refreshGrupo(grupoId, {
        ...grupo,
        opciones: (grupo?.opciones ?? []).map((o) =>
          Number(o.id) === Number(opcion.id) ? res.data : o,
        ),
      })
      toast.success('Opción actualizada')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-3" style={{ borderColor: 'var(--admin-border)' }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
          Grupos de opciones (pasos del cliente)
        </p>
        <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
          Ej: 1) Tipo de Jack · 2) Sabor. El cliente debe completar cada grupo antes de pedir.
        </p>
      </div>

      {(grupos ?? []).map((grupo) => {
        const draft = opcionDrafts[grupo.id] ?? emptyOpcion

        return (
          <div
            key={grupo.id}
            className="space-y-3 rounded-md border p-3"
            style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-surface-2, transparent)' }}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <AdminField label="Nombre del grupo">
                <input
                  className={adminInputClass}
                  style={adminInputStyle()}
                  value={grupo.nombre}
                  onChange={(e) =>
                    onChange(
                      grupos.map((g) =>
                        Number(g.id) === Number(grupo.id)
                          ? { ...g, nombre: e.target.value }
                          : g,
                      ),
                    )
                  }
                />
              </AdminField>
              <AdminField label="Mín.">
                <input
                  type="number"
                  min="0"
                  max="5"
                  className={adminInputClass}
                  style={adminInputStyle()}
                  value={grupo.min_seleccion}
                  onChange={(e) =>
                    onChange(
                      grupos.map((g) =>
                        Number(g.id) === Number(grupo.id)
                          ? { ...g, min_seleccion: e.target.value }
                          : g,
                      ),
                    )
                  }
                />
              </AdminField>
              <AdminField label="Máx.">
                <input
                  type="number"
                  min="1"
                  max="5"
                  className={adminInputClass}
                  style={adminInputStyle()}
                  value={grupo.max_seleccion}
                  onChange={(e) =>
                    onChange(
                      grupos.map((g) =>
                        Number(g.id) === Number(grupo.id)
                          ? { ...g, max_seleccion: e.target.value }
                          : g,
                      ),
                    )
                  }
                />
              </AdminField>
              <AdminField label="Orden">
                <input
                  type="number"
                  className={adminInputClass}
                  style={adminInputStyle()}
                  value={grupo.orden}
                  onChange={(e) =>
                    onChange(
                      grupos.map((g) =>
                        Number(g.id) === Number(grupo.id) ? { ...g, orden: e.target.value } : g,
                      ),
                    )
                  }
                />
              </AdminField>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-xs font-semibold"
                style={{ background: 'var(--admin-accent)', color: '#0a0a0a' }}
                disabled={isSaving}
                onClick={() => handleUpdateGrupo(grupo)}
              >
                Guardar grupo
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-red-400"
                disabled={isSaving}
                onClick={() => handleDeleteGrupo(grupo.id)}
              >
                <FiTrash2 /> Eliminar grupo
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--admin-text-dim)' }}>
                Opciones
              </p>
              {(grupo.opciones ?? []).map((opcion) => (
                <div key={opcion.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_90px_80px_auto]">
                  <input
                    className={adminInputClass}
                    style={adminInputStyle()}
                    value={opcion.nombre_opcion}
                    onChange={(e) =>
                      refreshGrupo(grupo.id, {
                        ...grupo,
                        opciones: grupo.opciones.map((o) =>
                          Number(o.id) === Number(opcion.id)
                            ? { ...o, nombre_opcion: e.target.value }
                            : o,
                        ),
                      })
                    }
                  />
                  <input
                    type="number"
                    className={adminInputClass}
                    style={adminInputStyle()}
                    value={opcion.precio_extra}
                    title="Precio extra"
                    onChange={(e) =>
                      refreshGrupo(grupo.id, {
                        ...grupo,
                        opciones: grupo.opciones.map((o) =>
                          Number(o.id) === Number(opcion.id)
                            ? { ...o, precio_extra: e.target.value }
                            : o,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs font-semibold"
                    style={{ background: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                    disabled={isSaving}
                    onClick={() => handleUpdateOpcion(grupo.id, opcion)}
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center text-red-400"
                    disabled={isSaving}
                    onClick={() => handleDeleteOpcion(grupo.id, opcion.id)}
                    aria-label="Eliminar opción"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_90px_auto]">
                <input
                  className={adminInputClass}
                  style={adminInputStyle()}
                  placeholder="Nueva opción (ej. Jack Fire)"
                  value={draft.nombre_opcion}
                  onChange={(e) =>
                    setOpcionDrafts((current) => ({
                      ...current,
                      [grupo.id]: { ...draft, nombre_opcion: e.target.value },
                    }))
                  }
                />
                <input
                  type="number"
                  className={adminInputClass}
                  style={adminInputStyle()}
                  placeholder="Extra $"
                  value={draft.precio_extra}
                  onChange={(e) =>
                    setOpcionDrafts((current) => ({
                      ...current,
                      [grupo.id]: { ...draft, precio_extra: e.target.value },
                    }))
                  }
                />
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-semibold"
                  style={{ background: 'var(--admin-accent)', color: '#0a0a0a' }}
                  disabled={isSaving}
                  onClick={() => handleAddOpcion(grupo.id)}
                >
                  <FiPlus /> Agregar
                </button>
              </div>
            </div>
          </div>
        )
      })}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_70px_70px_auto]">
        <input
          className={adminInputClass}
          style={adminInputStyle()}
          placeholder="Nuevo grupo (ej. Tipo de Jack)"
          value={grupoDraft.nombre}
          onChange={(e) => setGrupoDraft({ ...grupoDraft, nombre: e.target.value })}
        />
        <input
          type="number"
          className={adminInputClass}
          style={adminInputStyle()}
          title="Máximo"
          value={grupoDraft.max_seleccion}
          onChange={(e) => setGrupoDraft({ ...grupoDraft, max_seleccion: e.target.value })}
        />
        <input
          type="number"
          className={adminInputClass}
          style={adminInputStyle()}
          title="Orden"
          value={grupoDraft.orden}
          onChange={(e) => setGrupoDraft({ ...grupoDraft, orden: e.target.value })}
        />
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-semibold"
          style={{ background: 'var(--admin-accent)', color: '#0a0a0a' }}
          disabled={isSaving}
          onClick={handleAddGrupo}
        >
          <FiPlus /> Grupo
        </button>
      </div>
    </div>
  )
}
