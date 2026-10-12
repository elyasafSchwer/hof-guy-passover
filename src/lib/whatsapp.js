import {
  HOTEL,
  MESSAGE_SYMBOL_STYLE,
  SYMBOLS,
  WHATSAPP_PHONE,
} from '../config/appConfig.js'
import {
  formatCurrencyPlain,
  sanitizeForPlainText,
  toBmpSafe,
} from './format.js'
import { formatDateShort } from './dates.js'

/** wa.me accepts digits only — strip "+", spaces, dashes and parentheses. */
function sanitizePhone(phone) {
  return String(phone).replace(/\D/g, '')
}

/**
 * Build the human-readable WhatsApp message.
 * Uses WhatsApp's own markup (*bold*, _italic_) for scannability.
 *
 * Three things keep the output safe in transit:
 *   1. `formatCurrencyPlain` instead of Intl's currency output, which would
 *      embed invisible bidi marks and a no-break space in every price.
 *   2. `sanitizeForPlainText` over the finished string, as a backstop.
 *   3. `toBmpSafe` when the symbol style is 'safe', so no surrogate pair can
 *      reach a client that would mangle it into U+FFFD.
 *
 * Leading symbols come from SYMBOLS in appConfig.js rather than being baked
 * into the translation strings, so the whole set swaps in one place.
 *
 * @param {object}   args
 * @param {object}   args.quote     result of calculateQuote()
 * @param {string}   args.checkIn   ISO date
 * @param {string}   args.checkOut  ISO date
 * @param {string}   args.lang      'he' | 'en'
 * @param {Function} args.t         translate function bound to `lang`
 * @returns {string} the message body, un-encoded
 */
export function buildWhatsappMessage({ quote, checkIn, checkOut, lang, t }) {
  if (!quote) return ''

  const hotel = HOTEL[lang]?.name ?? HOTEL.en.name
  const money = (amount) => formatCurrencyPlain(amount, lang)
  const lines = []

  lines.push(t('waTitle', { sym: SYMBOLS.title, hotel }))
  lines.push('')
  lines.push(
    t('waCheckIn', {
      sym: SYMBOLS.date,
      date: formatDateShort(checkIn, lang),
    }),
  )
  lines.push(
    t('waCheckOut', {
      sym: SYMBOLS.date,
      date: formatDateShort(checkOut, lang),
    }),
  )
  lines.push(t('waNights', { sym: SYMBOLS.nights, n: quote.nights }))
  lines.push(
    t('waGuestType', {
      sym: SYMBOLS.guest,
      type: quote.guestType.label[lang],
      note: quote.guestType.note[lang],
    }),
  )
  lines.push('')
  lines.push(t('waRoomsHeader', { sym: SYMBOLS.rooms }))

  quote.rooms.forEach((room, index) => {
    const composition =
      room.composition.label[lang] +
      (room.infants > 0 ? t('waInfantsSuffix', { n: room.infants }) : '')

    lines.push(
      t('waRoomLine', {
        index: index + 1,
        composition,
        price: money(room.total),
      }),
    )
  })

  lines.push('')

  // Show the VAT step explicitly, so the quoted total is self-explanatory.
  if (quote.vatExempt) {
    lines.push(
      t('waSubtotal', { sym: SYMBOLS.subtotal, price: money(quote.subtotal) }),
    )
    lines.push(
      t('waVatCalc', {
        sym: SYMBOLS.vat,
        divisor: quote.vatDivisor,
        deduction: money(quote.vatDeduction),
      }),
    )
  }

  lines.push(t('waTotal', { sym: SYMBOLS.total, price: money(quote.total) }))
  if (quote.vatExempt) lines.push(t('waVatNote', { sym: SYMBOLS.vatNote }))
  lines.push('')
  lines.push(t('waClosing', { sym: SYMBOLS.thanks }))
  lines.push('')
  lines.push(t('waDisclaimer'))

  const message = sanitizeForPlainText(lines.join('\n'))
  return MESSAGE_SYMBOL_STYLE === 'safe' ? toBmpSafe(message) : message
}

/**
 * Build the full `https://wa.me/<digits>?text=<encoded>` deep link.
 *
 * encodeURIComponent percent-escapes the entire body as UTF-8: Hebrew becomes
 * %D7xx, emoji become 4-byte %F0%9F.. sequences, and newlines become %0A —
 * which is exactly what WhatsApp expects for a multi-line message.
 */
export function buildWhatsappUrl(message, phone = WHATSAPP_PHONE) {
  const digits = sanitizePhone(phone)
  const text = encodeURIComponent(sanitizeForPlainText(message))
  return `https://wa.me/${digits}?text=${text}`
}
