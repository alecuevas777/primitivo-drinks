import { useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { AdminField, adminInputClass, adminInputStyle } from '@/components/admin/AdminModal'
import ProductImageInput from '@/components/admin/ProductImageInput'
import {
  createVariante,
  deleteVariante,
  updateVariante,
} from '@/services/adminApi'
import { getVariantCopy } from '@/utils/variantCopy'

const emptyVariant = { nombre_variante: '', precio: '', stock: '', img_variante: '' }

export default function ProductoVariantesEditor({
  productoId,
  variantes,
  onChange,
  mostrarImagenVariantes = false,
  tipoVariante = 'sabor',
}) {
  const [draft, setDraft] = useState(emptyVariant)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(emptyVariant)
  const [isSaving, setIsSaving] = useState(false)
  const copy = getVariantCopy(tipoVariante)

  const handleAdd = async () => {
    if (!productoId) {
      toast.error('Guarda el producto primero para añadir variantes')
      return
    }
    if (!draft.nombre_variante.trim() || draft.precio === '') {
      toast.error('Nombre y precio son obligatorios')
      return
    }

    setIsSaving(true)
    try {
      const res = await createVariante(productoId, {
        nombre_variante: draft.nombre_variante.trim(),
        precio: Number(draft.precio),
        stock: draft.stock !== '' ? Number(draft.stock) : null,
        img_variante: draft.img_variante.trim() || null,
      })
      onChange([...variantes, res.data])
      setDraft(emptyVariant)
      toast.success('Variante agregada')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const startEdit = (variante) => {
    setEditingId(variante.id)
    setEditForm({
      nombre_variante: variante.nombre_variante,
      precio: String(variante.precio),
      stock: variante.stock != null ? String(variante.stock) : '',
      img_variante: variante.img_variante ?? '',
    })
  }

  const handleUpdate = async (id) => {
    if (!editForm.nombre_variante.trim() || editForm.precio === '') {
      toast.error('Nombre y precio son obligatorios')
      return
    }

    setIsSaving(true)
    try {
      const res = await updateVariante(id, {
        nombre_variante: editForm.nombre_variante.trim(),
        precio: Number(editForm.precio),
        stock: editForm.stock !== '' ? Number(editForm.stock) : null,
        img_variante: editForm.img_variante.trim() || null,
      })
      onChange(variantes.map((v) => (v.id === id ? res.data : v)))
      setEditingId(null)
      toast.success('Variante actualizada')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setIsSaving(true)
    try {
      await deleteVariante(id)
      onChange(variantes.filter((v) => v.id !== id))
      if (editingId === id) setEditingId(null)
      toast.success('Variante eliminada')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="space-y-4 rounded-xl border p-4"
      style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}
    >
      <p className="text-sm font-bold">Variantes / {copy.plural}</p>

      {!productoId && (
        <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
          Guarda el producto para poder agregar variantes.
        </p>
      )}

      {variantes.length > 0 && (
        <ul className="space-y-2">
          {variantes.map((variante) => (
            <li
              key={variante.id}
              className="rounded-lg border p-3"
              style={{ borderColor: 'var(--admin-border)' }}
            >
              {editingId === variante.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      className={adminInputClass}
                      style={adminInputStyle()}
                      value={editForm.nombre_variante}
                      onChange={(e) =>
                        setEditForm({ ...editForm, nombre_variante: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      className={adminInputClass}
                      style={adminInputStyle()}
                      value={editForm.precio}
                      onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
                    />
                    <input
                      type="number"
                      min="0"
                      className={adminInputClass}
                      style={adminInputStyle()}
                      placeholder="Stock"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    />
                  </div>
                  <ProductImageInput
                    value={editForm.img_variante}
                    onChange={(img_variante) => setEditForm({ ...editForm, img_variante })}
                  />
                  <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
                    {mostrarImagenVariantes
                      ? `Esta imagen se mostrará al cliente al elegir ${copy.article} ${copy.singular}.`
                      : 'Imagen guardada en el sistema, pero oculta en el sitio hasta activar "Mostrar imágenes de variantes".'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleUpdate(variante.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold"
                      style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                      style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-dim)' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold">{variante.nombre_variante}</p>
                    <p style={{ color: 'var(--admin-text-dim)' }}>
                      ${Number(variante.precio).toLocaleString('es-CL')}
                      {variante.stock != null ? ` · Stock: ${variante.stock}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(variante)}
                      className="rounded-lg px-2 py-1 text-xs font-semibold"
                      style={{ color: 'var(--admin-accent)' }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(variante.id)}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                      aria-label="Eliminar variante"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {productoId && (
        <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--admin-border)' }}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <AdminField label="Nombre variante">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={draft.nombre_variante}
                onChange={(e) => setDraft({ ...draft, nombre_variante: e.target.value })}
                placeholder="Ej: Maracuyá"
              />
            </AdminField>
            <AdminField label="Precio">
              <input
                type="number"
                min="0"
                className={adminInputClass}
                style={adminInputStyle()}
                value={draft.precio}
                onChange={(e) => setDraft({ ...draft, precio: e.target.value })}
              />
            </AdminField>
            <AdminField label="Stock (opcional)">
              <input
                type="number"
                min="0"
                className={adminInputClass}
                style={adminInputStyle()}
                value={draft.stock}
                onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
              />
            </AdminField>
          </div>
          <ProductImageInput
            value={draft.img_variante}
            onChange={(img_variante) => setDraft({ ...draft, img_variante })}
          />
          <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
            {mostrarImagenVariantes
              ? `Esta imagen se mostrará al cliente al elegir ${copy.article} ${copy.singular}.`
              : 'Imagen guardada en el sistema, pero oculta en el sitio hasta activar "Mostrar imágenes de variantes".'}
          </p>
          <div>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleAdd}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-60"
              style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }}
            >
              <FiPlus size={14} />
              Agregar variante
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
