import { addDays, format, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns'

export function todayIso() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function nowIso() {
  return new Date().toISOString()
}

export function formatDate(value?: string) {
  if (!value) {
    return 'No date'
  }

  try {
    return format(parseISO(value), 'MMM d, yyyy')
  } catch {
    return value
  }
}

export function isPastDate(value?: string) {
  if (!value) {
    return false
  }

  try {
    return isBefore(startOfDay(parseISO(value)), startOfDay(new Date()))
  } catch {
    return false
  }
}

export function isDueToday(value?: string) {
  if (!value) {
    return false
  }

  try {
    return isSameDay(parseISO(value), new Date())
  } catch {
    return false
  }
}

export function isWithinNextDays(value: string | undefined, days: number) {
  if (!value) {
    return false
  }

  try {
    const date = startOfDay(parseISO(value))
    const today = startOfDay(new Date())
    return !isBefore(date, today) && !isBefore(addDays(today, days), date)
  } catch {
    return false
  }
}
