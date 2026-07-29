import { create } from 'zustand'
import { getConfiguracion } from '@/services/api'
import { resolveProductImage } from '@/utils'
import { siteConfig as defaults } from '@/data/siteConfig'

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/** Orden de visualización: Lunes → Domingo */
export const WEEK_DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0]

function resolveAsset(src) {
  if (!src?.trim()) return ''
  if (/^https?:\/\//i.test(src.trim())) return src.trim()
  return resolveProductImage(src)
}

function buildWhatsAppUrl(number) {
  const digits = String(number ?? '').replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : defaults.social.whatsapp
}

export function normalizeHorarios(horarios) {
  const byDay = new Map()

  for (const row of horarios ?? []) {
    const dia = Number(row.dia_semana)

    if (dia >= 0 && dia <= 6 && !byDay.has(dia)) {
      byDay.set(dia, {
        id: row.id ?? null,
        dia_semana: dia,
        hora_apertura: String(row.hora_apertura ?? '18:00').slice(0, 5),
        hora_cierre: String(row.hora_cierre ?? '23:00').slice(0, 5),
        abierto: Number(row.abierto ?? 1),
      })
    }
  }

  return WEEK_DAYS_ORDER.map(
    (dia) =>
      byDay.get(dia) ?? {
        id: null,
        dia_semana: dia,
        hora_apertura: '18:00',
        hora_cierre: '23:00',
        abierto: 1,
      },
  )
}

export function mapConfigResponse(data) {
  const cfg = data?.configuracion ?? {}

  const phone = cfg.whatsapp || cfg.telefono || defaults.phone

  return {
    name: cfg.nombre_negocio || defaults.name,
    brand: cfg.nombre_negocio || defaults.brand,
    logo: resolveAsset(cfg.logo) || defaults.logo,
    phone,
    telefono: cfg.telefono || phone,
    email: cfg.email || defaults.email,
    description: cfg.subtitulo_hero || defaults.description,
    hero: {
      title: cfg.titulo_hero || defaults.tagline,
      subtitle: cfg.subtitulo_hero || defaults.description,
      image: resolveAsset(cfg.imagen_hero) || defaults.banner || '',
      imageMobile:
        resolveAsset(cfg.imagen_hero_mobile) ||
        defaults.bannerMobile ||
        resolveAsset(cfg.imagen_hero) ||
        defaults.banner ||
        '',
    },
    promoText: cfg.texto_promo || '',
    deliveryGratisDesde:
      cfg.delivery_gratis_desde != null ? Number(cfg.delivery_gratis_desde) : null,
    descuentoPorcentaje:
      cfg.descuento_porcentaje != null ? Number(cfg.descuento_porcentaje) : 0,
    carta: {
      label: cfg.etiqueta_carta || 'Nuestra Carta',
      title: cfg.titulo_carta || 'Productos',
      subtitle:
        cfg.subtitulo_carta ||
        'Explora el menú y pide por WhatsApp con delivery a domicilio.',
    },
    bank: {
      nombre: cfg.cb_titular_nombre || '',
      rut: cfg.cb_titular_rut || '',
      email: cfg.cb_titular_email || '',
      tipoCuenta: cfg.cb_tipo_cuenta || '',
      numeroCuenta: cfg.cb_numero_cuenta || '',
      banco: cfg.cb_banco || '',
    },
    social: {
      instagram: cfg.instagram || defaults.social.instagram,
      facebook: cfg.facebook || defaults.social.facebook,
      whatsapp: buildWhatsAppUrl(phone),
      tiktok: cfg.tiktok || '',
    },
    horarios: normalizeHorarios(data?.horarios),
    raw: cfg,
  }
}

export function formatHoursLabel(horarios = []) {
  const openDays = horarios.filter((row) => Number(row.abierto))

  if (!openDays.length) return 'Cerrado temporalmente'

  const groups = new Map()

  openDays.forEach((row) => {
    const key = `${row.hora_apertura}-${row.hora_cierre}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(Number(row.dia_semana))
  })

  const formatTime = (value) => String(value).slice(0, 5)

  const parts = [...groups.entries()].map(([key, days]) => {
    const [open, close] = key.split('-')
    const sorted = [...days].sort((a, b) => a - b)
  const label =
      sorted.length === 7
        ? 'Lunes a Domingo'
        : sorted.map((day) => DAY_LABELS[day]).join(', ')

    return `${label} ${formatTime(open)} a ${formatTime(close)} hrs`
  })

  return parts.join(' · ')
}

export const useConfigStore = create((set, get) => ({
  site: mapConfigResponse({}),
  horarios: [],
  isLoading: false,
  hasLoaded: false,
  error: null,

  fetchConfig: async () => {
    const { isLoading, hasLoaded } = get()
    if (isLoading || hasLoaded) return

    set({ isLoading: true, error: null })

    try {
      const data = await getConfiguracion()
      const site = mapConfigResponse(data)
      set({
        site,
        horarios: site.horarios,
        isLoading: false,
        hasLoaded: true,
      })
    } catch (error) {
      set({
        isLoading: false,
        hasLoaded: true,
        error: error.message,
        site: mapConfigResponse({}),
      })
    }
  },

  setFromAdmin: (data) => {
    const site = mapConfigResponse(data)
    set({ site, horarios: site.horarios })
  },
}))

export { DAY_LABELS }
