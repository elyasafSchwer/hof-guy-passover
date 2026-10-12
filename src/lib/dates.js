/**
 * Date helpers.
 *
 * All dates move through the app as plain `YYYY-MM-DD` strings — the exact
 * value an <input type="date"> produces. We never construct a Date from a
 * bare string with `new Date(str)` for arithmetic, because that parses as UTC
 * while display helpers use local time, which can shift the day across
 * timezones. Instead we parse to explicit UTC components.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** Parse 'YYYY-MM-DD' into a UTC-midnight Date, or null if malformed. */
export function parseISODate(value) {
  if (typeof value !== 'string') return null
  const match = ISO_DATE.exec(value)
  if (!match) return null

  const [, y, m, d] = match
  const year = Number(y)
  const month = Number(m)
  const day = Number(d)
  const date = new Date(Date.UTC(year, month - 1, day))

  // Reject impossible dates like 2027-02-31, which Date would roll over.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return date
}

const MS_PER_DAY = 86_400_000

/**
 * Whole nights between two ISO dates.
 * Returns 0 when either date is invalid or check-out is not after check-in.
 */
export function nightsBetween(checkIn, checkOut) {
  const start = parseISODate(checkIn)
  const end = parseISODate(checkOut)
  if (!start || !end) return 0

  const nights = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY)
  return nights > 0 ? nights : 0
}

/** `a <= b` comparison for ISO date strings (lexicographic works for ISO). */
export function isOnOrBefore(a, b) {
  return a <= b
}

/** Format an ISO date for display, e.g. "22/04/2027" / "Thu, 22 Apr 2027". */
export function formatDate(value, lang, { withWeekday = false } = {}) {
  const date = parseISODate(value)
  if (!date) return ''

  const locale = lang === 'he' ? 'he-IL' : 'en-GB'
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withWeekday ? { weekday: 'short' } : {}),
  }).format(date)
}

/** Compact numeric form, e.g. "22/04/2027". Used inside the WhatsApp text. */
export function formatDateShort(value, lang) {
  const date = parseISODate(value)
  if (!date) return ''

  const locale = lang === 'he' ? 'he-IL' : 'en-GB'
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

/** Clamp an ISO date string into [min, max]. */
export function clampDate(value, min, max) {
  if (!value) return value
  if (value < min) return min
  if (value > max) return max
  return value
}

/** Add `days` to an ISO date string, returning a new ISO date string. */
export function addDays(value, days) {
  const date = parseISODate(value)
  if (!date) return value
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
