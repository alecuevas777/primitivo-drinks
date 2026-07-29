import { Helmet } from 'react-helmet-async'
import { getSiteUrl, siteConfig } from '@/data/siteConfig'
import { useConfigStore, formatHoursLabel } from '@/store/configStore'
import { formatPhone } from '@/utils'

export default function Seo({ title, description, path = '', noIndex = false }) {
  const site = useConfigStore((state) => state.site)
  const siteName = site.name || siteConfig.name
  const siteDescription = site.description || siteConfig.seo.description
  const pageTitle = title ? `${title} | ${siteName}` : siteConfig.seo.title
  const socialTitle = title ? `${title} | ${siteName}` : siteConfig.seo.title
  const pageDescription = description || siteDescription || siteConfig.seo.description
  const origin = getSiteUrl()
  const canonicalPath = path || '/'
  const canonicalUrl = `${origin}${canonicalPath === '/' ? '' : canonicalPath}` || origin
  const ogImageRaw = siteConfig.seo.ogImage
  const ogImageUrl = /^https?:\/\//i.test(ogImageRaw)
    ? ogImageRaw
    : origin
      ? `${origin}${ogImageRaw}`
      : ogImageRaw
  const keywords = siteConfig.seo.keywords.join(', ')
  const phoneDigits = String(site.phone || siteConfig.phone).replace(/\D/g, '')
  const phoneDisplay = formatPhone(site.phone || siteConfig.phone)
  const instagram = site.social?.instagram || siteConfig.social.instagram
  const facebook = site.social?.facebook || siteConfig.social.facebook
  const tiktok = site.social?.tiktok || siteConfig.social.tiktok
  const whatsapp = site.social?.whatsapp || siteConfig.social.whatsapp
  const logoUrl = site.logo || siteConfig.logo
  const hoursLabel = formatHoursLabel(site.horarios)

  const sameAs = [instagram, facebook, tiktok, whatsapp].filter(Boolean)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    '@id': origin ? `${origin}/#business` : undefined,
    name: siteName,
    alternateName: 'Primitivos Mojilitros',
    description: pageDescription,
    url: origin || undefined,
    image: [ogImageUrl, logoUrl].filter(Boolean),
    logo: logoUrl || undefined,
    telephone: phoneDigits ? `+${phoneDigits}` : undefined,
    email: site.email || siteConfig.email || undefined,
    servesCuisine: ['Ceviche', 'Cócteles', 'Mojitos'],
    currenciesAccepted: 'CLP',
    paymentAccepted: 'Cash, Bank Transfer',
    priceRange: '$$',
    address: siteConfig.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: siteConfig.address,
          addressLocality: siteConfig.city || undefined,
          addressRegion: siteConfig.region || undefined,
          addressCountry: siteConfig.country || 'CL',
        }
      : {
          '@type': 'PostalAddress',
          addressCountry: siteConfig.country || 'CL',
        },
    sameAs: sameAs.length ? sameAs : undefined,
    openingHours: hoursLabel && hoursLabel !== 'Cerrado temporalmente' ? hoursLabel : undefined,
    potentialAction: whatsapp
      ? {
          '@type': 'OrderAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: whatsapp,
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform',
            ],
          },
          deliveryMethod: 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet',
        }
      : undefined,
  }

  return (
    <Helmet>
      <html lang="es-CL" />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywords} />
      <meta
        name="robots"
        content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}
      />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="author" content={siteName} />
      <meta name="theme-color" content={siteConfig.seo.themeColor} />
      <meta name="language" content="Spanish" />
      <meta name="geo.region" content="CL" />
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/favicon.ico" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={siteConfig.seo.locale} />
      <meta property="og:title" content={socialTitle} />
      <meta property="og:description" content={pageDescription} />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {ogImageUrl ? <meta property="og:image" content={ogImageUrl} /> : null}
      {ogImageUrl ? <meta property="og:image:secure_url" content={ogImageUrl} /> : null}
      <meta property="og:image:type" content={siteConfig.seo.ogImageType || 'image/jpeg'} />
      <meta property="og:image:width" content={String(siteConfig.seo.ogImageWidth)} />
      <meta property="og:image:height" content={String(siteConfig.seo.ogImageHeight)} />
      <meta property="og:image:alt" content={siteConfig.seo.ogImageAlt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={socialTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {ogImageUrl ? <meta name="twitter:image" content={ogImageUrl} /> : null}
      <meta name="twitter:image:alt" content={siteConfig.seo.ogImageAlt} />

      {phoneDisplay ? <meta name="telephone" content={phoneDisplay} /> : null}

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}
