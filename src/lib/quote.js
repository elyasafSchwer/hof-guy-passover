import {
  BASE_NIGHTS,
  INFANT_PRICE_PER_NIGHT,
  VAT_RATE,
  getComposition,
  getGuestType,
} from '../config/pricing.js'
import { DATE_LIMITS } from '../config/appConfig.js'
import { nightsBetween } from './dates.js'

/**
 * ---------------------------------------------------------------------------
 *  VALIDATION
 * ---------------------------------------------------------------------------
 *  Returns an array of { field, key, params } descriptors. The UI turns them
 *  into localized messages, so this module stays language-agnostic.
 */
export function validateBooking({ checkIn, checkOut, rooms }) {
  const errors = []

  if (!checkIn || !checkOut) {
    errors.push({ field: 'dates', key: 'errorMissingDates' })
  } else {
    if (checkIn < DATE_LIMITS.checkInMin || checkIn > DATE_LIMITS.checkInMax) {
      errors.push({
        field: 'checkIn',
        key: 'errorCheckInRange',
        params: {
          from: DATE_LIMITS.checkInMin,
          to: DATE_LIMITS.checkInMax,
        },
      })
    }
    if (checkOut > DATE_LIMITS.checkOutMax) {
      errors.push({
        field: 'checkOut',
        key: 'errorCheckOutRange',
        params: { to: DATE_LIMITS.checkOutMax },
      })
    }
    if (checkOut <= checkIn) {
      errors.push({ field: 'checkOut', key: 'errorCheckOutAfterCheckIn' })
    }
  }

  if (!Array.isArray(rooms) || rooms.length === 0) {
    errors.push({ field: 'rooms', key: 'errorNoRooms' })
  }

  return errors
}

/**
 * ---------------------------------------------------------------------------
 *  PRICE CALCULATION
 * ---------------------------------------------------------------------------
 *
 *  Everything is priced strictly in NIGHTS. The Passover window, 21–28 April,
 *  is exactly 7 nights, which is the full package at 100%.
 *
 *  Per room (all figures INCLUDE VAT at this stage):
 *      accommodation = round(basePrice * (nights / BASE_NIGHTS))   // prorated
 *      infants       = infantCount * INFANT_PRICE_PER_NIGHT * nights
 *      roomTotal     = accommodation + infants
 *
 *  Then once, for the whole booking:
 *      subtotal = sum of roomTotal
 *      total    = tourist ? round(subtotal / (1 + VAT_RATE)) : subtotal
 *
 *  The VAT exemption is applied a single time at the end rather than per
 *  room, so the UI can show one honest division instead of the same rounding
 *  repeated N times. Every intermediate value is already a whole shekel, so
 *  the displayed breakdown always adds up to the displayed total.
 *
 *  @returns {null | object} null when the input cannot produce a quote.
 */
export function calculateQuote({ checkIn, checkOut, guestTypeId, rooms }) {
  const nights = nightsBetween(checkIn, checkOut)
  if (nights <= 0 || !Array.isArray(rooms) || rooms.length === 0) return null

  const guestType = getGuestType(guestTypeId)
  const vatExempt = guestType.vatExempt

  const roomLines = []

  for (const room of rooms) {
    const composition = getComposition(room.compositionId)
    if (!composition) continue // unknown id (stale persisted state) — skip

    const infants = Math.max(0, Number(room.infants) || 0)

    const accommodation = Math.round(
      composition.basePrice * (nights / BASE_NIGHTS),
    )
    const infantsCost = infants * INFANT_PRICE_PER_NIGHT * nights

    roomLines.push({
      id: room.id,
      compositionId: composition.id,
      composition,
      /** Inputs kept alongside the results so the UI can show the math. */
      basePrice: composition.basePrice,
      infants,
      accommodation,
      infantsCost,
      total: accommodation + infantsCost,
    })
  }

  if (roomLines.length === 0) return null

  const subtotal = roomLines.reduce((sum, r) => sum + r.total, 0)
  const total = vatExempt ? Math.round(subtotal / (1 + VAT_RATE)) : subtotal

  return {
    nights,
    baseNights: BASE_NIGHTS,
    infantRate: INFANT_PRICE_PER_NIGHT,
    vatRate: VAT_RATE,
    /** The divisor shown in the VAT breakdown, e.g. 1.17. */
    vatDivisor: 1 + VAT_RATE,
    guestType,
    vatExempt,
    rooms: roomLines,
    /** Sum of all room totals, including VAT. */
    subtotal,
    /** Amount removed by the tourist VAT exemption (0 for Israeli citizens). */
    vatDeduction: subtotal - total,
    /** The headline figure, in whole shekels. */
    total,
    /** Average cost per night across the whole booking. */
    perNight: Math.round(total / nights),
  }
}
