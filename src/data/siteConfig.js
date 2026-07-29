export const siteConfig = {
  name: 'Primitivos Drinks',
  brand: 'Primitivos Drinks',
  brandSuffix: 'DRINKS',

  logo: 'https://res.cloudinary.com/dinhrwram/image/upload/v1784771925/ChatGPT_Image_22_jul_2026_09_58_39_p.m._rvcwew.png',
  banner:
    'https://res.cloudinary.com/dinhrwram/image/upload/v1784771943/ChatGPT_Image_22_jul_2026_09_58_24_p.m._rf4mcf.png',
  bannerMobile:
    'https://res.cloudinary.com/dinhrwram/image/upload/v1784781306/bannersimiomovi1l_mrg6bo.png',

  tagline: 'Ceviches y mojitos a domicilio',
  description:
    'Ceviches frescos, mojitos y promos con delivery a domicilio. Pide fácil por WhatsApp con Primitivos Drinks.',
  phone: import.meta.env.VITE_WHATSAPP_NUMBER || '',
  email: '',
  address: '',
  city: '',
  region: '',
  country: 'CL',
  mapUrl: '',
  hours: 'Lunes a Domingo',
  happyHour: '',
  schedule: {
    openHour: 18,
    openMinute: 0,
    closeHour: 23,
    closeMinute: 0,
  },

  social: {
    instagram: '',
    facebook: '',
    whatsapp: '',
    tiktok: '',
  },

  seo: {
    title: 'Primitivos Drinks | Ceviches, Mojitos y Delivery',
    description:
      'Ceviches frescos, mojitos y promos con delivery a domicilio. Revisa la carta digital y pide por WhatsApp con Primitivos Drinks.',
    keywords: [
      'Primitivos Drinks',
      'ceviches',
      'mojitos',
      'delivery',
      'carta digital',
      'pedidos WhatsApp',
      'cócteles a domicilio',
      'promos mojitos',
    ],
    locale: 'es_CL',
    ogImage:
      'https://res.cloudinary.com/dinhrwram/image/upload/v1785098540/ChatGPT_Image_26_jul_2026_04_41_05_p.m._gf4rhe.png',
    ogImageAlt: 'Primitivos Drinks — ceviches, mojitos y delivery',
    ogImageType: 'image/png',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    themeColor: '#ffd400',
  },
}

/** URL pública del sitio (para Open Graph / canonical). */
export function getSiteUrl() {
  const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}
