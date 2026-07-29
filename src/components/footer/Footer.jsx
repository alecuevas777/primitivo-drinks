import { FiClock, FiPhone } from 'react-icons/fi'
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa6'
import { useConfigStore, formatHoursLabel, DAY_LABELS, WEEK_DAYS_ORDER } from '@/store/configStore'
import { formatPhone } from '@/utils'
import styles from './Footer.module.css'

function telHref(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  return digits ? `tel:+${digits}` : null
}

export default function Footer() {
  const year = new Date().getFullYear()
  const site = useConfigStore((state) => state.site)
  const hoursSummary = formatHoursLabel(site.horarios)
  const phone = site.phone || site.telefono || ''
  const phoneLabel = phone ? formatPhone(phone) : null
  const phoneLink = telHref(phone)
  const whatsappHref = site.social?.whatsapp || null

  const socialLinks = [
    { key: 'instagram', label: 'Instagram', href: site.social?.instagram, Icon: FaInstagram },
    { key: 'whatsapp', label: 'WhatsApp', href: whatsappHref, Icon: FaWhatsapp },
    { key: 'facebook', label: 'Facebook', href: site.social?.facebook, Icon: FaFacebookF },
    { key: 'tiktok', label: 'TikTok', href: site.social?.tiktok, Icon: FaTiktok },
  ].filter((link) => Boolean(link.href?.trim()))

  const scheduleRows = WEEK_DAYS_ORDER.map((dia) => {
    const row = (site.horarios || []).find((item) => Number(item.dia_semana) === dia)
    return {
      dia,
      label: DAY_LABELS[dia],
      abierto: Number(row?.abierto ?? 0) === 1,
      apertura: String(row?.hora_apertura ?? '18:00').slice(0, 5),
      cierre: String(row?.hora_cierre ?? '23:00').slice(0, 5),
    }
  })

  return (
    <footer className={styles.footer} id="contacto">
      <div className={styles.grid}>
        <div className={styles.brand}>
          <img src={site.logo} alt={site.name} className={styles.logoImage} />
        </div>

        <div>
          <h3 className={styles.colTitle}>REDES SOCIALES</h3>
          {socialLinks.length > 0 ? (
            <div className={styles.social}>
              {socialLinks.map(({ key, label, href, Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                >
                  <Icon aria-hidden="true" />
                </a>
              ))}
            </div>
          ) : null}
          <p className={styles.hint}>Síguenos y escribe por WhatsApp para pedidos.</p>
        </div>

        <div>
          <h3 className={styles.colTitle}>
            <FiClock aria-hidden="true" /> HORARIOS
          </h3>
          <p className={styles.text}>{hoursSummary}</p>
          <ul className={styles.scheduleList}>
            {scheduleRows.map((row) => (
              <li key={row.dia} className={styles.scheduleItem}>
                <span>{row.label}</span>
                <span>
                  {row.abierto ? `${row.apertura} – ${row.cierre}` : 'Cerrado'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={styles.colTitle}>
            <FiPhone aria-hidden="true" /> TELÉFONO
          </h3>
          {phoneLabel && phoneLink ? (
            <a href={phoneLink} className={styles.phone}>
              {phoneLabel}
            </a>
          ) : (
            <p className={styles.text}>Disponible pronto</p>
          )}

          {whatsappHref ? (
            <a href={whatsappHref} className={styles.whatsappLink} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp aria-hidden="true" />
              Escribir por WhatsApp
            </a>
          ) : null}
        </div>
      </div>

      <p className={styles.copy}>
        © {year} {site.name}. Todos los derechos reservados.
      </p>
    </footer>
  )
}
