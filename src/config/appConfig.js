/**
 * ---------------------------------------------------------------------------
 *  APP CONFIGURATION
 * ---------------------------------------------------------------------------
 *  Everything a non-developer may need to change lives in this file and in
 *  `pricing.js`. No other file should need editing for a new season.
 * ---------------------------------------------------------------------------
 */

/**
 * ===========================================================================
 *  >>> THE BOOKING COORDINATOR'S WHATSAPP NUMBER — EDIT THE LINE BELOW <<<
 * ===========================================================================
 *  International format, digits only. No "+", no dashes, no spaces.
 *      050-778-3222  ->  '972507783222'
 *      054-123-4567  ->  '972541234567'
 *
 *  This is the only place the number appears. Nothing validates it, so
 *  whatever is here is what the WhatsApp button will use.
 */
export const WHATSAPP_PHONE = '972507783222'

/** Hotel branding, per language. */
export const HOTEL = {
  en: { name: 'Hof Guy Hotel', tagline: 'Passover Vacation Packages' },
  he: { name: 'מלון חוף גיא', tagline: 'חבילות נופש לפסח' },
}

/**
 * ---------------------------------------------------------------------------
 *  WHATSAPP MESSAGE SYMBOLS
 * ---------------------------------------------------------------------------
 *  Which symbol set the outgoing WhatsApp message uses.
 *
 *  'safe'  (default) — BMP-only symbols (★ ▸ ✦ ☾ ✓). Every character is at
 *          most 3 bytes in UTF-8, so it survives any client on the path.
 *  'emoji'           — the richer 🏨 📅 🛏️ 💰 set.
 *
 *  Why this exists: emoji like 🏨 live above U+FFFF and are encoded as UTF-16
 *  surrogate pairs. Some WhatsApp Web / browser / OS combinations push the
 *  ?text= payload through a UCS-2 ("2 bytes per character") path, which
 *  collapses each pair into a single U+FFFD replacement character — the
 *  message arrives reading "� Check-in:" instead of "📅 Check-in:". Plain
 *  text, Hebrew and ₪ are all BMP and are never affected, which is why only
 *  the emoji break.
 *
 *  Switch to 'emoji' if your coordinator's WhatsApp renders them correctly.
 *  The in-app UI always uses emoji — it is a browser, and it renders them
 *  fine; only the outgoing message is affected by this setting.
 */
export const MESSAGE_SYMBOL_STYLE = 'safe'

export const MESSAGE_SYMBOLS = {
  safe: {
    title: '★',
    date: '▸',
    nights: '☾',
    guest: '▸',
    rooms: '▸',
    subtotal: '▸',
    vat: '−',
    total: '✦',
    vatNote: '✓',
    thanks: '',
  },
  emoji: {
    title: '🏨',
    date: '📅',
    nights: '🌙',
    guest: '👤',
    rooms: '🛏️',
    subtotal: '🧾',
    vat: '➖',
    total: '💰',
    vatNote: '✅',
    thanks: ' 🙏',
  },
}

/** The active symbol set, falling back to the safe one. */
export const SYMBOLS =
  MESSAGE_SYMBOLS[MESSAGE_SYMBOL_STYLE] ?? MESSAGE_SYMBOLS.safe

/**
 * Booking window.
 *
 * NOTE: Passover 5787 runs 21–28 April 2027, which is where these defaults
 * come from. Change `YEAR` (and the day numbers if needed) for a different
 * season — every date rule in the app derives from this object.
 *
 * The widest stay, 21 -> 28, is exactly 7 NIGHTS: the full package at 100%
 * of the base price. See BASE_NIGHTS in pricing.js.
 */
export const BOOKING_WINDOW = {
  YEAR: 2027,
  MONTH: 4, // April
  CHECK_IN_MIN_DAY: 21,
  CHECK_IN_MAX_DAY: 28,
  CHECK_OUT_MIN_DAY: 22,
  CHECK_OUT_MAX_DAY: 28,
}

const pad = (n) => String(n).padStart(2, '0')
const iso = (day) =>
  `${BOOKING_WINDOW.YEAR}-${pad(BOOKING_WINDOW.MONTH)}-${pad(day)}`

/** ISO (YYYY-MM-DD) bounds used directly by the <input type="date"> fields. */
export const DATE_LIMITS = {
  checkInMin: iso(BOOKING_WINDOW.CHECK_IN_MIN_DAY),
  checkInMax: iso(BOOKING_WINDOW.CHECK_IN_MAX_DAY),
  checkOutMin: iso(BOOKING_WINDOW.CHECK_OUT_MIN_DAY),
  checkOutMax: iso(BOOKING_WINDOW.CHECK_OUT_MAX_DAY),
}

/** Sensible starting selection: the longest allowed stay. */
export const DEFAULT_DATES = {
  checkIn: DATE_LIMITS.checkInMin,
  checkOut: DATE_LIMITS.checkOutMax,
}

/** Hard cap on how many rooms a single quote may contain. */
export const MAX_ROOMS = 10

/** Hard cap on infants per room. */
export const MAX_INFANTS_PER_ROOM = 3
