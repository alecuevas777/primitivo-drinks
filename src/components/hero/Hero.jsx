import { useEffect, useState } from 'react'
import { FiClock, FiStar } from 'react-icons/fi'
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa6'
import { getStoreStatus } from '@/utils/storeHours'
import { useConfigStore } from '@/store/configStore'
import styles from './Hero.module.css'

const DEFAULT_BANNER =
  'https://res.cloudinary.com/dinhrwram/image/upload/v1784771943/ChatGPT_Image_22_jul_2026_09_58_24_p.m._rf4mcf.png'

const DEFAULT_BANNER_MOBILE =
  'https://res.cloudinary.com/dinhrwram/image/upload/v1784781306/bannersimiomovi1l_mrg6bo.png'

const DEFAULT_LOGO =
  'https://res.cloudinary.com/dinhrwram/image/upload/v1784771925/ChatGPT_Image_22_jul_2026_09_58_39_p.m._rvcwew.png'

function brandTitle(name = '') {
  const first = String(name).trim().split(/\s+/).filter(Boolean)[0] || 'Primitivos'
  return `${first}.cl`
}

export default function Hero() {
  const site = useConfigStore((state) => state.site)
  const bannerDesktop = site.hero?.image || DEFAULT_BANNER
  const bannerMobile = site.hero?.imageMobile || DEFAULT_BANNER_MOBILE || bannerDesktop
  const logoSrc = site.logo || DEFAULT_LOGO
  const title = brandTitle(site.name)
  const [status, setStatus] = useState(() => getStoreStatus(new Date(), site.horarios))

  const socialLinks = [
    { key: 'instagram', label: 'Instagram', href: site.social?.instagram, Icon: FaInstagram },
    { key: 'whatsapp', label: 'WhatsApp', href: site.social?.whatsapp, Icon: FaWhatsapp },
    { key: 'facebook', label: 'Facebook', href: site.social?.facebook, Icon: FaFacebookF },
    { key: 'tiktok', label: 'TikTok', href: site.social?.tiktok, Icon: FaTiktok },
  ].filter((link) => Boolean(link.href?.trim()))

  useEffect(() => {
    const tick = () => setStatus(getStoreStatus(new Date(), site.horarios))
    tick()
    const interval = window.setInterval(tick, 60_000)
    return () => window.clearInterval(interval)
  }, [site.horarios])

  return (
    <section id="inicio" className={styles.hero}>
      <picture>
        <source media="(max-width: 767px)" srcSet={bannerMobile} />
        <img
          src={bannerDesktop}
          alt=""
          className={styles.banner}
          decoding="async"
          fetchPriority="high"
        />
      </picture>

      <div className={styles.overlay}>
        <div className={styles.panel}>
          <div className={styles.topRow}>
            <div className={styles.logoFrame}>
              <img src={logoSrc} alt={site.name} className={styles.logo} />
            </div>

            <div className={styles.brandText}>
              <h1 className={styles.title}>
                <span className={styles.crown} aria-hidden />
                {title}
              </h1>
            </div>
          </div>

          <div className={styles.meta} aria-live="polite">
            <span className={styles.metaPill}>
              <span
                className={`${styles.dot} ${status.isOpen ? styles.dotOpen : styles.dotClosed}`}
                aria-hidden
              />
              {status.label}
            </span>
            <span className={styles.metaPill}>
              <FiClock aria-hidden />
              {status.detail || status.hours}
            </span>
            <span className={styles.metaPill}>
              <FiStar className={styles.star} aria-hidden />
              Delivery a domicilio
            </span>

            {socialLinks.length > 0 ? (
              <div className={styles.social}>
                {socialLinks.map(({ key, label, href, Icon }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={label}
                  >
                    <Icon aria-hidden />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
