import { useConfigStore } from '@/store/configStore'

function encodeMessage(text) {
  return encodeURIComponent(text)
}

/** Número de WhatsApp de pedidos (admin → Contacto y redes). */
export function getWhatsAppPhone() {
  const site = useConfigStore.getState().site
  const digits = String(site.phone ?? '').replace(/\D/g, '')
  return digits
}

export function buildWhatsAppUrl(message = '') {
  const phone = getWhatsAppPhone()
  const base = phone
    ? `https://wa.me/${phone}`
    : useConfigStore.getState().site.social.whatsapp || 'https://wa.me/'

  if (!message) return base
  return `${base}?text=${encodeMessage(message)}`
}
