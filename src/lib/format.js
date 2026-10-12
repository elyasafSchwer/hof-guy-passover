import { CURRENCY } from '../config/pricing.js'

const formatterCache = new Map()

function getFormatter(lang, options) {
  const locale = lang === 'he' ? 'he-IL' : 'en-IL'
  const key = `${locale}|${JSON.stringify(options)}`
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options)
    formatterCache.set(key, formatter)
  }
  return formatter
}

/**
 * Format an amount as whole shekels, e.g. "20,640 ₪" / "₪20,640".
 * Always rounded to the nearest whole shekel — no agorot anywhere in the UI.
 *
 * NOTE: in Hebrew this deliberately keeps Intl's bidi control marks, which is
 * what makes the amount lay out correctly inside RTL prose in a browser. For
 * anything leaving the page (WhatsApp, clipboard) use `formatCurrencyPlain`.
 */
export function formatCurrency(amount, lang) {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0
  return getFormatter(lang, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(safe)
}

/** Format a plain number with thousands separators, e.g. "20,640". */
export function formatNumber(value, lang) {
  const safe = Number.isFinite(value) ? Math.round(value) : 0
  return getFormatter(lang, { maximumFractionDigits: 0 }).format(safe)
}

/**
 * Currency for plain-text destinations: "20,640 ₪".
 *
 * Intl's Hebrew currency output is `U+200F 20,640 U+00A0 U+200F ₪` — two
 * invisible right-to-left marks plus a no-break space. A browser renders
 * those correctly, but once the string is URL-encoded into a wa.me link they
 * travel as %E2%80%8F / %C2%A0 and surface in WhatsApp as stray boxes or
 * question marks. So we assemble the string from plain characters instead.
 */
export function formatCurrencyPlain(amount, lang) {
  return `${formatNumber(amount, lang)} ₪`
}

/**
 * Characters that are invisible in a browser but render as junk in many
 * plain-text clients:
 *   200E / 200F   left-to-right & right-to-left marks
 *   061C          Arabic letter mark
 *   202A - 202E   bidi embeddings and overrides
 *   2066 - 2069   bidi isolates
 *   FEFF          zero-width no-break space (BOM)
 */
const BIDI_CONTROLS = /[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069\uFEFF]/g

/** No-break (00A0), figure (2007) and narrow no-break (202F) spaces. */
const EXOTIC_SPACES = /[\u00A0\u2007\u202F]/g

/**
 * Make a string safe for a plain-text destination such as a WhatsApp deep
 * link: strip invisible bidi controls, normalise exotic spaces to ASCII
 * spaces, and apply NFC so the Hebrew text is in canonical composed form.
 *
 * Emoji are untouched — they are ordinary characters and survive
 * encodeURIComponent as UTF-8 percent-escapes.
 */
export function sanitizeForPlainText(text) {
  return String(text)
    .normalize('NFC')
    .replace(BIDI_CONTROLS, '')
    .replace(EXOTIC_SPACES, ' ')
}

/**
 * Any codepoint above U+FFFF, i.e. anything stored as a UTF-16 surrogate
 * pair. All emoji in the 1F300-1FAFF range qualify; Hebrew, Latin and ₪ do
 * not. `u` flag so the regex iterates whole codepoints, not code units.
 */
const ASTRAL_G = /[\u{10000}-\u{10FFFF}]/gu
/** Separate non-global copy: `.test()` on a /g/ regex is stateful. */
const ASTRAL = /[\u{10000}-\u{10FFFF}]/u

/**
 * Emoji joiners that become meaningless once the emoji itself is gone:
 * 200D zero-width joiner, FE0E/FE0F variation selectors, 1F3FB-1F3FF skin
 * tones.
 */
const EMOJI_MODIFIERS = /[\u200D\uFE0E\uFE0F\u{1F3FB}-\u{1F3FF}]/gu

/** True if the string contains a character outside the Basic Multilingual Plane. */
export function hasAstralChars(text) {
  return ASTRAL.test(String(text))
}

/**
 * Drop every non-BMP character, so the result is safe for a consumer that
 * handles text as UCS-2 and would otherwise mangle each surrogate pair into
 * a single U+FFFD. Also removes the now-orphaned zero-width joiners, variation
 * selectors and skin-tone modifiers, and tidies the whitespace that an
 * excised leading symbol leaves behind.
 *
 * See MESSAGE_SYMBOL_STYLE in config/appConfig.js for the full explanation.
 */
export function toBmpSafe(text) {
  return String(text)
    .replace(ASTRAL_G, '')
    .replace(EMOJI_MODIFIERS, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]{2,}/g, ' ').trim())
    .join('\n')
}
