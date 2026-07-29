import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { AdminField, adminInputClass, adminInputStyle } from '@/components/admin/AdminModal'
import ProductImageInput from '@/components/admin/ProductImageInput'
import HorarioAtencionEditor from '@/components/admin/HorarioAtencionEditor'
import { getAdminConfiguracion, updateConfiguracion } from '@/services/adminApi'
import { useConfigStore, normalizeHorarios, WEEK_DAYS_ORDER } from '@/store/configStore'

const BANCOS = [
  'Banco de Chile',
  'BancoEstado',
  'Banco Santander',
  'BCI',
  'Scotiabank',
  'Itaú',
  'Banco BICE',
  'Banco Falabella',
  'Banco Security',
  'Banco Ripley',
  'Banco Consorcio',
  'Banco Internacional',
  'Banco BTG Pactual',
  'HSBC',
  'Tenpo',
  'Mach',
  'Mercado Pago',
  'Coopeuch',
  'Global66',
  'Prepago Los Héroes',
  'Tapp Los Andes',
  'Caja Los Andes',
  'Otro',
]

const TIPOS_CUENTA = [
  { value: 'corriente', label: 'Cuenta Corriente' },
  { value: 'vista', label: 'Cuenta Vista' },
  { value: 'ahorro', label: 'Cuenta de Ahorro' },
]

const DEFAULT_HORARIOS = WEEK_DAYS_ORDER.map((dia) => ({
  dia_semana: dia,
  hora_apertura: '18:00',
  hora_cierre: '23:00',
  abierto: 1,
}))

const emptyForm = {
  nombre_negocio: '',
  logo: '',
  titulo_hero: '',
  subtitulo_hero: '',
  imagen_hero: '',
  imagen_hero_mobile: '',
  texto_promo: '',
  delivery_gratis_desde: '',
  descuento_porcentaje: '',
  etiqueta_carta: '',
  titulo_carta: '',
  subtitulo_carta: '',
  whatsapp: '',
  telefono: '',
  email: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  cb_titular_nombre: '',
  cb_titular_rut: '',
  cb_titular_email: '',
  cb_tipo_cuenta: 'corriente',
  cb_numero_cuenta: '',
  cb_banco: 'Banco Falabella',
}

function configToForm(cfg, horarios) {
  return {
    nombre_negocio: cfg.nombre_negocio ?? '',
    logo: cfg.logo ?? '',
    titulo_hero: cfg.titulo_hero ?? '',
    subtitulo_hero: cfg.subtitulo_hero ?? '',
    imagen_hero: cfg.imagen_hero ?? '',
    imagen_hero_mobile: cfg.imagen_hero_mobile ?? '',
    texto_promo: cfg.texto_promo ?? '',
    delivery_gratis_desde:
      cfg.delivery_gratis_desde != null ? String(cfg.delivery_gratis_desde) : '',
    descuento_porcentaje:
      cfg.descuento_porcentaje != null ? String(cfg.descuento_porcentaje) : '',
    etiqueta_carta: cfg.etiqueta_carta ?? '',
    titulo_carta: cfg.titulo_carta ?? '',
    subtitulo_carta: cfg.subtitulo_carta ?? '',
    whatsapp: cfg.whatsapp ?? '',
    telefono: cfg.telefono ?? '',
    email: cfg.email ?? '',
    instagram: cfg.instagram ?? '',
    facebook: cfg.facebook ?? '',
    tiktok: cfg.tiktok ?? '',
    cb_titular_nombre: cfg.cb_titular_nombre ?? '',
    cb_titular_rut: cfg.cb_titular_rut ?? '',
    cb_titular_email: cfg.cb_titular_email ?? '',
    cb_tipo_cuenta: cfg.cb_tipo_cuenta ?? 'corriente',
    cb_numero_cuenta: cfg.cb_numero_cuenta ?? '',
    cb_banco: cfg.cb_banco ?? 'Banco Falabella',
    horarios: normalizeHorarios(horarios),
  }
}

function applyConfigResponse(res) {
  const payload = res?.data
  if (!payload?.configuracion) {
    throw new Error('Respuesta inválida del servidor')
  }
  return configToForm(payload.configuracion, payload.horarios)
}

function toPayload(form) {
  return {
    nombre_negocio: form.nombre_negocio.trim(),
    direccion: '',
    url_mapa: '',
    logo: form.logo.trim(),
    telefono: form.telefono.trim() || null,
    email: form.email.trim() || null,
    instagram: form.instagram.trim() || null,
    facebook: form.facebook.trim() || null,
    whatsapp: form.whatsapp.trim(),
    tiktok: form.tiktok.trim() || null,
    titulo_hero: form.titulo_hero.trim(),
    subtitulo_hero: form.subtitulo_hero.trim(),
    imagen_hero: form.imagen_hero.trim(),
    imagen_hero_mobile: form.imagen_hero_mobile.trim() || null,
    texto_promo: form.texto_promo.trim() || null,
    delivery_gratis_desde:
      form.delivery_gratis_desde !== '' ? Number(form.delivery_gratis_desde) : null,
    descuento_porcentaje:
      form.descuento_porcentaje !== '' ? Number(form.descuento_porcentaje) : null,
    etiqueta_carta: form.etiqueta_carta.trim(),
    titulo_carta: form.titulo_carta.trim(),
    subtitulo_carta: form.subtitulo_carta.trim(),
    cb_titular_nombre: form.cb_titular_nombre.trim() || null,
    cb_titular_rut: form.cb_titular_rut.trim() || null,
    cb_titular_email: form.cb_titular_email.trim() || null,
    cb_tipo_cuenta: form.cb_tipo_cuenta || null,
    cb_numero_cuenta: form.cb_numero_cuenta.trim() || null,
    cb_banco: form.cb_banco || null,
    horarios: normalizeHorarios(form.horarios),
  }
}

function AdminSection({ title, description, children }) {
  return (
    <section
      className="space-y-4 rounded-xl border p-5 sm:p-6"
      style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}
    >
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--admin-text-dim)' }}>
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs" style={{ color: 'var(--admin-text-dim)' }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

export default function ConfiguracionDashboard() {
  const setFromAdmin = useConfigStore((state) => state.setFromAdmin)
  const [form, setForm] = useState({ ...emptyForm, horarios: DEFAULT_HORARIOS })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getAdminConfiguracion()
      setForm(applyConfigResponse(res))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.nombre_negocio.trim()) {
      toast.error('El nombre del negocio es obligatorio')
      return
    }

    if (!form.whatsapp.trim()) {
      toast.error('El WhatsApp de pedidos es obligatorio')
      return
    }

    setIsSaving(true)
    try {
      const res = await updateConfiguracion(toPayload(form))
      setForm(applyConfigResponse(res))
      setFromAdmin(res.data)
      toast.success('Configuración guardada')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm" style={{ color: 'var(--admin-text-dim)' }}>
        Cargando configuración...
      </p>
    )
  }

  if (error) {
    return <p className="py-12 text-center text-sm text-red-400">{error}</p>
  }

  return (
    <>
      <AdminPageHeader
        title="Configuración del negocio"
        description="Logo, contacto, hero, horarios y datos que se muestran en el catálogo público."
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 sm:mt-8">
        <AdminSection title="Identidad">
          <AdminField label="Nombre del negocio *">
            <input
              className={adminInputClass}
              style={adminInputStyle()}
              value={form.nombre_negocio}
              onChange={(e) => setForm({ ...form, nombre_negocio: e.target.value })}
              required
            />
          </AdminField>
          <ProductImageInput
            label="Logo del negocio"
            value={form.logo}
            onChange={(logo) => setForm({ ...form, logo })}
          />
        </AdminSection>

        <AdminSection
          title="Hero (página principal)"
          description="Contenido visual de la portada. El estado Abierto/Cerrado usa el campo «Abierto» del día actual y sus horas."
        >
          <AdminField label="Título">
            <input
              className={adminInputClass}
              style={adminInputStyle()}
              value={form.titulo_hero}
              onChange={(e) => setForm({ ...form, titulo_hero: e.target.value })}
            />
          </AdminField>
          <AdminField label="Subtítulo">
            <textarea
              className={`${adminInputClass} min-h-24 resize-y`}
              style={adminInputStyle()}
              value={form.subtitulo_hero}
              onChange={(e) => setForm({ ...form, subtitulo_hero: e.target.value })}
            />
          </AdminField>
          <ProductImageInput
            label="Imagen hero (escritorio)"
            value={form.imagen_hero}
            onChange={(imagen_hero) => setForm({ ...form, imagen_hero })}
          />
          <ProductImageInput
            label="Imagen hero (móvil)"
            value={form.imagen_hero_mobile}
            onChange={(imagen_hero_mobile) => setForm({ ...form, imagen_hero_mobile })}
          />
          <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
            En pantallas menores a 1024px se usa la imagen móvil. Si la dejas vacía, se usará la de
            escritorio.
          </p>
        </AdminSection>

        <AdminSection title="Horario de atención">
          <HorarioAtencionEditor
            horarios={form.horarios}
            onChange={(horarios) => setForm({ ...form, horarios })}
          />
        </AdminSection>

        <AdminSection
          title="Banner promocional"
          description="Texto preparado para la barra superior del sitio (próximamente)."
        >
          <AdminField label="Mensaje promocional">
            <input
              className={adminInputClass}
              style={adminInputStyle()}
              value={form.texto_promo}
              onChange={(e) => setForm({ ...form, texto_promo: e.target.value })}
              placeholder="Ej: RECIBIENDO PEDIDOS DESDE LAS 18:00 A 23:00 HRS"
            />
          </AdminField>
        </AdminSection>

        <AdminSection
          title="Pedidos y delivery"
          description="El envío gratis automático se aplica según el subtotal y el costo de la comuna seleccionada por el cliente. Déjalo vacío para cobrar siempre el delivery de cada zona."
        >
          <AdminField label="Descuento global del catálogo (%)">
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              className={adminInputClass}
              style={adminInputStyle()}
              value={form.descuento_porcentaje}
              onChange={(e) => setForm({ ...form, descuento_porcentaje: e.target.value })}
              placeholder="Ej: 20"
            />
          </AdminField>
          <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
            Aplica a todos los productos del catálogo: actualiza la etiqueta (-20%) y el precio
            mostrado. Déjalo vacío para usar el descuento de cada producto o categoría.
          </p>
          <AdminField label="Delivery gratis desde (CLP)">
            <input
              type="number"
              min="0"
              className={adminInputClass}
              style={adminInputStyle()}
              value={form.delivery_gratis_desde}
              onChange={(e) => setForm({ ...form, delivery_gratis_desde: e.target.value })}
              placeholder="Ej: 30000"
            />
          </AdminField>
          <p className="text-xs" style={{ color: 'var(--admin-text-dim)' }}>
            Si el subtotal del pedido alcanza este monto, el delivery queda en $0 según la zona
            elegida. Los costos por comuna se administran en la sección Delivery.
          </p>
        </AdminSection>

        <AdminSection
          title="Sección carta (catálogo público)"
          description="Textos que aparecen sobre el listado de productos en la página principal."
        >
          <AdminField label="Etiqueta pequeña">
            <input
              className={adminInputClass}
              style={adminInputStyle()}
              value={form.etiqueta_carta}
              onChange={(e) => setForm({ ...form, etiqueta_carta: e.target.value })}
            />
          </AdminField>
          <AdminField label="Título principal">
            <input
              className={adminInputClass}
              style={adminInputStyle()}
              value={form.titulo_carta}
              onChange={(e) => setForm({ ...form, titulo_carta: e.target.value })}
            />
          </AdminField>
          <AdminField label="Descripción">
            <textarea
              className={`${adminInputClass} min-h-24 resize-y`}
              style={adminInputStyle()}
              value={form.subtitulo_carta}
              onChange={(e) => setForm({ ...form, subtitulo_carta: e.target.value })}
            />
          </AdminField>
        </AdminSection>

        <AdminSection title="Contacto y redes">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminField label="WhatsApp (pedidos) *">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="56987073838"
                required
              />
            </AdminField>
            <AdminField label="Teléfono de contacto">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </AdminField>
            <AdminField label="Correo">
              <input
                type="email"
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Opcional"
              />
            </AdminField>
            <AdminField label="Instagram (URL completa)">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </AdminField>
            <AdminField label="Facebook (URL completa)">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </AdminField>
            <AdminField label="TikTok (URL completa)">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@..."
              />
            </AdminField>
          </div>
        </AdminSection>

        <AdminSection
          title="Cuenta bancaria (transferencias)"
          description="Estos datos se mostrarán al cliente que elija pago por transferencia."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminField label="Nombre del titular">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.cb_titular_nombre}
                onChange={(e) => setForm({ ...form, cb_titular_nombre: e.target.value })}
              />
            </AdminField>
            <AdminField label="RUT del titular">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.cb_titular_rut}
                onChange={(e) => setForm({ ...form, cb_titular_rut: e.target.value })}
              />
            </AdminField>
            <AdminField label="Correo del titular">
              <input
                type="email"
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.cb_titular_email}
                onChange={(e) => setForm({ ...form, cb_titular_email: e.target.value })}
              />
            </AdminField>
            <AdminField label="Banco">
              <select
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.cb_banco}
                onChange={(e) => setForm({ ...form, cb_banco: e.target.value })}
              >
                {BANCOS.map((banco) => (
                  <option key={banco} value={banco}>
                    {banco}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Tipo de cuenta">
              <select
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.cb_tipo_cuenta}
                onChange={(e) => setForm({ ...form, cb_tipo_cuenta: e.target.value })}
              >
                {TIPOS_CUENTA.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Número de cuenta">
              <input
                className={adminInputClass}
                style={adminInputStyle()}
                value={form.cb_numero_cuenta}
                onChange={(e) => setForm({ ...form, cb_numero_cuenta: e.target.value })}
              />
            </AdminField>
          </div>
        </AdminSection>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-lg px-6 py-3 text-sm font-bold disabled:opacity-60 sm:w-auto"
            style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-on-accent)' }}
          >
            {isSaving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      </form>
    </>
  )
}
