import { useRef, useState } from 'react'
import { FiImage, FiLink, FiUpload } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { AdminField, adminInputClass, adminInputStyle } from '@/components/admin/AdminModal'
import { uploadProductoImage } from '@/services/adminApi'
import { resolveProductImage } from '@/utils'

const ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp,image/gif'

export default function ProductImageInput({ value, onChange, label = 'Imagen del producto' }) {
  const inputRef = useRef(null)
  const [mode, setMode] = useState('url')
  const [isUploading, setIsUploading] = useState(false)

  const preview = value ? resolveProductImage(value) : null

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona un archivo de imagen')
      return
    }

    setIsUploading(true)
    try {
      const res = await uploadProductoImage(file)
      onChange(res.data?.path ?? res.data?.url ?? '')
      toast.success('Imagen subida')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <AdminField label={label}>
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode('url')}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          style={
            mode === 'url'
              ? { backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }
              : { color: 'var(--admin-text-dim)', border: '1px solid var(--admin-border)' }
          }
        >
          <FiLink size={13} />
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode('file')}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          style={
            mode === 'file'
              ? { backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }
              : { color: 'var(--admin-text-dim)', border: '1px solid var(--admin-border)' }
          }
        >
          <FiUpload size={13} />
          Subir archivo
        </button>
      </div>

      {mode === 'url' ? (
        <input
          className={adminInputClass}
          style={adminInputStyle()}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      ) : (
        <div
          className="rounded-lg border border-dashed p-4 text-center"
          style={{ borderColor: 'var(--admin-border)' }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={handleFile}
          />
          <FiImage size={24} className="mx-auto mb-2" style={{ color: 'var(--admin-text-dim)' }} />
          <p className="mb-3 text-xs" style={{ color: 'var(--admin-text-dim)' }}>
            JPG, PNG, WEBP o GIF · máx. 5 MB
          </p>
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-60"
            style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }}
          >
            {isUploading ? 'Subiendo...' : 'Elegir imagen'}
          </button>
        </div>
      )}

      {preview && (
        <div className="mt-3 overflow-hidden rounded-lg border" style={{ borderColor: 'var(--admin-border)' }}>
          <img src={preview} alt="Vista previa" className="h-36 w-full object-cover" />
        </div>
      )}
    </AdminField>
  )
}
