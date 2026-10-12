/**
 * Pricing sanity checks — plain Node, no test framework.
 *
 *     npm run verify
 *
 * Covers the money math (proration, infants, VAT exemption, rounding) and the
 * date-window validation. Run it after touching src/config/pricing.js.
 */
import assert from 'node:assert/strict'
import { calculateQuote, validateBooking } from '../src/lib/quote.js'
import { nightsBetween } from '../src/lib/dates.js'
import {
  buildWhatsappMessage,
  buildWhatsappUrl,
} from '../src/lib/whatsapp.js'
import { sanitizeForPlainText, hasAstralChars, toBmpSafe } from '../src/lib/format.js'
import { translate } from '../src/i18n/translations.js'
import { DATE_LIMITS, DEFAULT_DATES } from '../src/config/appConfig.js'

let passed = 0
function check(name, fn) {
  try {
    fn()
    passed += 1
    console.log(`  ✓ ${name}`)
  } catch (error) {
    console.error(`  ✗ ${name}\n    ${error.message}`)
    process.exitCode = 1
  }
}

const room = (compositionId, infants = 0) => ({
  id: compositionId + infants,
  compositionId,
  infants,
})

console.log('\nPricing (night-based proration)')

check('the full 21-28 Apr stay is 7 nights = 100% of base', () => {
  const quote = calculateQuote({
    checkIn: '2027-04-21',
    checkOut: '2027-04-28',
    guestTypeId: 'israeli',
    rooms: [room('two_adults')],
  })
  assert.equal(quote.nights, 7)
  assert.equal(quote.total, 24080)
})

check('5 nights = 5/7 of the base price', () => {
  const quote = calculateQuote({
    checkIn: '2027-04-23',
    checkOut: '2027-04-28', // 5 nights
    guestTypeId: 'israeli',
    rooms: [room('two_adults')],
  })
  assert.equal(quote.nights, 5)
  assert.equal(quote.total, Math.round(24080 * (5 / 7))) // 17,200
})

check('accommodation is prorated on NIGHTS, with no days +1 anywhere', () => {
  const quote = calculateQuote({
    checkIn: '2027-04-22',
    checkOut: '2027-04-28', // 6 nights
    guestTypeId: 'israeli',
    rooms: [room('three_adults')],
  })
  assert.equal(quote.rooms[0].accommodation, Math.round(33712 * (6 / 7)))
  // The reverted day-based figure (nights + 1) must NOT appear.
  assert.notEqual(quote.rooms[0].accommodation, Math.round(33712 * (7 / 7)))
  assert.equal(quote.days, undefined, 'a stale `days` field is still exposed')
  assert.equal(quote.baseDays, undefined, 'a stale `baseDays` field remains')
})

check('infants are a flat nightly charge, never prorated', () => {
  const quote = calculateQuote({
    checkIn: '2027-04-21',
    checkOut: '2027-04-28', // 7 nights
    guestTypeId: 'israeli',
    rooms: [room('two_adults', 2)],
  })
  assert.equal(quote.rooms[0].infantsCost, 2 * 100 * 7) // 1400
  assert.equal(quote.total, 24080 + 1400)
})

check('tourists have 17% VAT removed from the total', () => {
  const israeli = calculateQuote({
    checkIn: '2027-04-21',
    checkOut: '2027-04-28', // full package: 7 nights
    guestTypeId: 'israeli',
    rooms: [room('three_adults')],
  })
  const tourist = calculateQuote({
    checkIn: '2027-04-21',
    checkOut: '2027-04-28',
    guestTypeId: 'tourist',
    rooms: [room('three_adults')],
  })
  assert.equal(israeli.total, 33712)
  assert.equal(tourist.total, Math.round(33712 / 1.17)) // 28814
  assert.equal(tourist.vatDeduction, israeli.total - tourist.total)
  assert.equal(israeli.vatDeduction, 0)
})

check('room lines are VAT-inclusive and sum to the subtotal', () => {
  const quote = calculateQuote({
    checkIn: '2027-04-23',
    checkOut: '2027-04-28', // 5 nights
    guestTypeId: 'tourist',
    rooms: [
      room('two_adults_two_children', 1),
      room('one_adult'),
      room('four_children', 2),
    ],
  })
  const sum = quote.rooms.reduce((acc, r) => acc + r.total, 0)
  assert.equal(quote.subtotal, sum)
  // The VAT exemption is one division applied to that subtotal.
  assert.equal(quote.total, Math.round(quote.subtotal / 1.17))
  assert.equal(quote.subtotal - quote.vatDeduction, quote.total)
})

check('for Israeli citizens the subtotal IS the total', () => {
  const quote = calculateQuote({
    checkIn: '2027-04-22',
    checkOut: '2027-04-28',
    guestTypeId: 'israeli',
    rooms: [room('two_adults', 1), room('three_children')],
  })
  assert.equal(quote.subtotal, quote.total)
})

check('each room line adds up: accommodation + infants === room total', () => {
  const quote = calculateQuote({
    checkIn: '2027-04-22',
    checkOut: '2027-04-27',
    guestTypeId: 'tourist',
    rooms: [room('two_adults_one_child', 3), room('two_children', 1)],
  })
  for (const r of quote.rooms) {
    assert.equal(r.accommodation + r.infantsCost, r.total)
  }
})

check('the breakdown exposes the inputs needed to show the math', () => {
  const quote = calculateQuote({
    checkIn: '2027-04-22',
    checkOut: '2027-04-28',
    guestTypeId: 'tourist',
    rooms: [room('two_adults', 2)],
  })
  assert.equal(quote.baseNights, 7)
  assert.equal(quote.infantRate, 100)
  assert.equal(quote.vatDivisor, 1.17)
  assert.equal(quote.rooms[0].basePrice, 24080)
  // Every figure the UI prints in a formula must be a whole number.
  const r = quote.rooms[0]
  for (const v of [r.basePrice, r.accommodation, r.infantsCost, r.total]) {
    assert.ok(Number.isInteger(v), `${v} is not an integer`)
  }
})

check('every total is a whole shekel', () => {
  const quote = calculateQuote({
    checkIn: '2027-04-22',
    checkOut: '2027-04-25',
    guestTypeId: 'tourist',
    rooms: [room('three_children', 1), room('two_adults')],
  })
  assert.ok(Number.isInteger(quote.total))
  assert.ok(Number.isInteger(quote.perNight))
  for (const r of quote.rooms) assert.ok(Number.isInteger(r.total))
})

check('unknown composition ids are skipped, not crashed on', () => {
  const quote = calculateQuote({
    checkIn: '2027-04-22',
    checkOut: '2027-04-28',
    guestTypeId: 'israeli',
    rooms: [room('nonexistent_id'), room('one_adult')],
  })
  assert.equal(quote.rooms.length, 1)
})

console.log('\nDates & validation')

check('nightsBetween counts whole nights', () => {
  assert.equal(nightsBetween('2027-04-22', '2027-04-28'), 6)
  assert.equal(nightsBetween('2027-04-22', '2027-04-22'), 0)
  assert.equal(nightsBetween('2027-04-28', '2027-04-22'), 0)
  assert.equal(nightsBetween('', '2027-04-28'), 0)
})

check('check-in outside the booking window is rejected', () => {
  const errors = validateBooking({
    checkIn: '2027-04-20',
    checkOut: '2027-04-26',
    rooms: [room('two_adults')],
  })
  assert.ok(errors.some((e) => e.key === 'errorCheckInRange'))
})

check('check-in on 21 Apr is now accepted (window starts a day earlier)', () => {
  assert.deepEqual(
    validateBooking({
      checkIn: '2027-04-21',
      checkOut: '2027-04-28',
      rooms: [room('two_adults')],
    }),
    [],
  )
  assert.equal(DATE_LIMITS.checkInMin, '2027-04-21')
  assert.equal(DATE_LIMITS.checkOutMax, '2027-04-28')
  // The default selection should be the full 7-night package.
  assert.equal(
    nightsBetween(DEFAULT_DATES.checkIn, DEFAULT_DATES.checkOut),
    7,
  )
})

check('check-out past the window is rejected', () => {
  const errors = validateBooking({
    checkIn: '2027-04-22',
    checkOut: '2027-04-30',
    rooms: [room('two_adults')],
  })
  assert.ok(errors.some((e) => e.key === 'errorCheckOutRange'))
})

check('check-out must be after check-in', () => {
  const errors = validateBooking({
    checkIn: '2027-04-25',
    checkOut: '2027-04-24',
    rooms: [room('two_adults')],
  })
  assert.ok(errors.some((e) => e.key === 'errorCheckOutAfterCheckIn'))
})

check('a valid booking produces no errors', () => {
  assert.deepEqual(
    validateBooking({
      checkIn: '2027-04-22',
      checkOut: '2027-04-28',
      rooms: [room('two_adults')],
    }),
    [],
  )
})

console.log('\nWhatsApp encoding')

const sampleQuote = (guestTypeId) =>
  calculateQuote({
    checkIn: '2027-04-22',
    checkOut: '2027-04-28',
    guestTypeId,
    rooms: [room('two_adults'), room('two_adults_two_children', 2)],
  })

const messageFor = (lang, guestTypeId = 'israeli') =>
  buildWhatsappMessage({
    quote: sampleQuote(guestTypeId),
    checkIn: '2027-04-22',
    checkOut: '2027-04-28',
    lang,
    t: (key, params) => translate(lang, key, params),
  })

check('the deep link is encoded and digits-only', () => {
  const url = buildWhatsappUrl('Hello & welcome 🏨\nline two', '+972-50-123 4567')
  assert.ok(url.startsWith('https://wa.me/972501234567?text='))
  assert.ok(!url.includes(' '))
  assert.equal(
    decodeURIComponent(url.split('?text=')[1]),
    'Hello & welcome 🏨\nline two',
  )
})

check('newlines are encoded as %0A', () => {
  const url = buildWhatsappUrl(messageFor('he'))
  const encoded = url.split('?text=')[1]
  assert.ok(encoded.includes('%0A'), 'no %0A found in the encoded body')
  assert.ok(!/[\n\r]/.test(encoded), 'raw newline survived into the URL')
})

check('Hebrew round-trips through the URL byte-for-byte', () => {
  const message = messageFor('he')
  const url = buildWhatsappUrl(message)
  assert.equal(decodeURIComponent(url.split('?text=')[1]), message)
  assert.ok(message.includes('מלון חוף גיא'))
  assert.ok(/%D7%/.test(url), 'Hebrew was not percent-encoded as UTF-8')
})

check('no character in the message exceeds 3 UTF-8 bytes', () => {
  // WhatsApp Web mangled every 4-byte emoji into U+FFFD, so the outgoing
  // message must stay inside the Basic Multilingual Plane.
  for (const lang of ['he', 'en']) {
    for (const guest of ['israeli', 'tourist']) {
      const message = buildWhatsappMessage({
        quote: sampleQuote(guest),
        checkIn: '2027-04-22',
        checkOut: '2027-04-28',
        lang,
        t: (key, params) => translate(lang, key, params),
      })
      assert.equal(
        hasAstralChars(message),
        false,
        `${lang}/${guest} contains a non-BMP character`,
      )
      const widest = Math.max(
        ...[...message].map((c) => Buffer.byteLength(c, 'utf8')),
      )
      assert.ok(widest <= 3, `${lang}/${guest} has a ${widest}-byte character`)
    }
  }
})

check('the BMP symbols actually appear in the message', () => {
  const message = messageFor('en')
  for (const symbol of ['★', '▸', '☾', '✦']) {
    assert.ok(message.includes(symbol), `missing ${symbol}`)
  }
  assert.ok(!message.includes('�'), 'replacement character in output')
})

check('toBmpSafe drops emoji but keeps Hebrew, Latin and ₪', () => {
  assert.equal(toBmpSafe('🏨 שלום 20,640 ₪ hello'), 'שלום 20,640 ₪ hello')
  // 1F6CF + FE0F: the orphaned variation selector must go too.
  assert.equal(toBmpSafe('🛏️ Room'), 'Room')
  assert.equal(toBmpSafe('no emoji here'), 'no emoji here')
})

check('hasAstralChars is not stateful across calls', () => {
  // A /g/ regex reused with .test() would alternate true/false here.
  for (let i = 0; i < 4; i++) {
    assert.equal(hasAstralChars('🏨'), true, `call ${i}`)
    assert.equal(hasAstralChars('abc ₪'), false, `call ${i}`)
  }
})

check('no invisible bidi marks or no-break spaces reach the message', () => {
  for (const lang of ['he', 'en']) {
    for (const guest of ['israeli', 'tourist']) {
      const message = buildWhatsappMessage({
        quote: sampleQuote(guest),
        checkIn: '2027-04-22',
        checkOut: '2027-04-28',
        lang,
        t: (key, params) => translate(lang, key, params),
      })
      const offenders = [...message].filter((c) =>
        /[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069\uFEFF\u00A0\u2007\u202F]/.test(
          c,
        ),
      )
      assert.equal(
        offenders.length,
        0,
        `${lang}/${guest} contains ${offenders
          .map((c) => 'U+' + c.codePointAt(0).toString(16).toUpperCase())
          .join(', ')}`,
      )
    }
  }
})

check('sanitizer strips bidi controls but keeps Hebrew and emoji', () => {
  const dirty = '‏20,640 ‏₪ שלום 🏨'
  assert.equal(sanitizeForPlainText(dirty), '20,640 ₪ שלום 🏨')
})

check('the tourist message shows the VAT calculation', () => {
  const quote = sampleQuote('tourist')
  const message = messageFor('he', 'tourist')
  assert.ok(message.includes('סכום ביניים'), 'no subtotal line')
  assert.ok(message.includes('1.17'), 'no VAT divisor shown')
  assert.ok(
    message.includes(quote.total.toLocaleString('en-US')),
    'final total missing from the message',
  )
})

console.log(
  `\n${process.exitCode ? '✗ failures above' : `✓ all ${passed} checks passed`}\n`,
)
