import { formatHoursLabel, DAY_LABELS } from '@/store/configStore'

function toMinutes(time) {
  const [hours, minutes] = String(time).slice(0, 5).split(':').map(Number)
  return hours * 60 + minutes
}

export function getTodaySchedule(horarios = [], date = new Date()) {
  return horarios.find((row) => Number(row.dia_semana) === date.getDay()) ?? null
}

export function formatDayHours(schedule, date = new Date()) {
  if (!schedule) return formatHoursLabel([])

  const dayName = DAY_LABELS[date.getDay()]

  if (!Number(schedule.abierto)) {
    return `${dayName}: sin atención`
  }

  const open = String(schedule.hora_apertura).slice(0, 5)
  const close = String(schedule.hora_cierre).slice(0, 5)

  return `${dayName} ${open} a ${close} hrs`
}

function isOpenAtTime(date, schedule) {
  if (!schedule || !Number(schedule.abierto)) return false

  const now = date.getHours() * 60 + date.getMinutes()
  const openAt = toMinutes(schedule.hora_apertura)
  const closeAt = toMinutes(schedule.hora_cierre)

  if (closeAt <= openAt) {
    return now >= openAt || now < closeAt
  }

  return now >= openAt && now < closeAt
}

export function isStoreOpen(date = new Date(), horarios = []) {
  const today = getTodaySchedule(horarios, date)
  if (!today || !Number(today.abierto)) return false

  return isOpenAtTime(date, today)
}

export function getStoreStatus(date = new Date(), horarios = []) {
  const today = getTodaySchedule(horarios, date)
  const hours = today ? formatDayHours(today, date) : formatHoursLabel(horarios)

  if (!today || !Number(today.abierto)) {
    return {
      isOpen: false,
      label: 'Cerrado',
      hours,
      detail: 'Sin atención hoy',
      closedToday: true,
    }
  }

  const open = isOpenAtTime(date, today)
  const openTime = String(today.hora_apertura).slice(0, 5)
  const closeTime = String(today.hora_cierre).slice(0, 5)

  return {
    isOpen: open,
    label: open ? 'Abierto' : 'Cerrado',
    hours,
    detail: open ? `Cierra a las ${closeTime}` : `Abre a las ${openTime}`,
    closedToday: false,
  }
}
