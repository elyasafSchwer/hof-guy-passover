/**
 * ---------------------------------------------------------------------------
 *  TRANSLATIONS
 * ---------------------------------------------------------------------------
 *  Every user-facing string lives here. Keys are identical across languages.
 *  Values may be plain strings or functions taking an interpolation object.
 * ---------------------------------------------------------------------------
 */

export const LANGUAGES = {
  he: { code: 'he', dir: 'rtl', name: 'עברית', switchTo: 'English' },
  en: { code: 'en', dir: 'ltr', name: 'English', switchTo: 'עברית' },
}

export const DEFAULT_LANGUAGE = 'he'

export const translations = {
  he: {
    /* --- header --- */
    appTitle: 'הצעת מחיר לחופשת פסח',
    appSubtitle: 'בנו את החבילה שלכם וקבלו הערכת מחיר מיידית',
    switchLanguage: 'Switch to English',

    /* --- disclaimer --- */
    disclaimerTitle: 'שימו לב',
    disclaimer:
      'זוהי הצעת מחיר משוערת בלבד. האישור הסופי כפוף לזמינות החדרים.',

    /* --- dates --- */
    datesTitle: 'תאריכי השהייה',
    checkIn: 'תאריך הגעה',
    checkOut: 'תאריך עזיבה',
    nights: 'מספר לילות',
    nightsValue: ({ n }) => (n === 1 ? 'לילה אחד' : `${n} לילות`),
    datesHint: ({ from, to }) => `ניתן להזמין בין ${from} ל-${to}`,

    /* --- guest type --- */
    guestTypeTitle: 'סוג אורח',
    guestTypeHint: 'תיירים בעלי דרכון זר פטורים ממע״מ בשיעור 17%',

    /* --- rooms --- */
    roomsTitle: 'הרכב החדרים',
    room: ({ n }) => `חדר ${n}`,
    composition: 'הרכב החדר',
    infants: 'תינוקות (גיל 0–2)',
    infantsHint: ({ price }) => `${price} ₪ ללילה לתינוק`,
    addRoom: 'הוספת חדר',
    removeRoom: 'הסרת חדר',
    maxRoomsReached: ({ max }) => `ניתן להוסיף עד ${max} חדרים`,

    /* --- summary --- */
    summaryTitle: 'סיכום ההצעה',
    summaryDates: 'תאריכים',
    summaryGuestType: 'סוג אורח',
    summaryRooms: 'פירוט חדרים',
    roomSubtotal: 'סה״כ לחדר',
    accommodation: 'אירוח',
    infantsLine: ({ n, nights }) =>
      `${n === 1 ? 'תינוק אחד' : `${n} תינוקות`} × ${nights} לילות`,
    subtotal: 'סכום ביניים',
    vatDeduction: 'הנחת מע״מ (פטור לתיירים)',
    total: 'סה״כ משוער',
    perNight: ({ price }) => `כ-${price} ללילה`,
    proratedNote: ({ nights, base }) =>
      `מחויב ${nights} מתוך ${base} לילות`,

    /* --- price breakdown (the visible math) --- */
    breakdownTitle: 'פירוט חישוב',
    calcBaseLabel: ({ nights, base }) =>
      `מחיר בסיס × (${nights} לילות / ${base})`,
    calcInfantsLabel: ({ nights }) => `תוספת תינוקות (${nights} לילות)`,
    calcRoomTotalLabel: 'סה״כ לחדר',
    calcSubtotalLabel: 'סכום ביניים (כולל מע״מ)',
    calcVatTitle: 'חישוב פטור ממע״מ (תייר)',
    calcVatLabel: ({ divisor, percent }) =>
      `חלוקה ב-${divisor} (ניכוי מע״מ ${percent}%)`,
    calcVatSaved: 'סכום המע״מ שנוכה',
    calcFinalLabel: 'סה״כ לתשלום',

    /* --- CTA --- */
    sendWhatsapp: 'שליחת בקשת הזמנה לוואטסאפ',
    whatsappHint: 'ההודעה תיפתח מוכנה לשליחה — אפשר לערוך לפני השליחה',
    copySummary: 'העתקת הסיכום',
    copied: 'הועתק!',

    /* --- validation --- */
    errorCheckInRange: ({ from, to }) =>
      `תאריך ההגעה חייב להיות בין ${from} ל-${to}`,
    errorCheckOutRange: ({ to }) => `תאריך העזיבה יכול להיות עד ${to}`,
    errorCheckOutAfterCheckIn: 'תאריך העזיבה חייב להיות אחרי תאריך ההגעה',
    errorNoRooms: 'יש להוסיף לפחות חדר אחד',
    errorMissingDates: 'יש לבחור תאריכי הגעה ועזיבה',
    fixErrors: 'יש לתקן את הפרטים כדי לקבל הצעת מחיר',

    /* --- whatsapp message (symbols are injected, see appConfig SYMBOLS) --- */
    waTitle: ({ sym, hotel }) => `${sym} *בקשת הזמנה – ${hotel}*`,
    waCheckIn: ({ sym, date }) => `${sym} הגעה: ${date}`,
    waCheckOut: ({ sym, date }) => `${sym} עזיבה: ${date}`,
    waNights: ({ sym, n }) => `${sym} לילות: ${n}`,
    waGuestType: ({ sym, type, note }) => `${sym} סוג אורח: ${type} (${note})`,
    waRoomsHeader: ({ sym }) => `${sym} *פירוט החדרים:*`,
    waRoomLine: ({ index, composition, price }) =>
      `${index}. ${composition} — ${price}`,
    waInfantsSuffix: ({ n }) =>
      n === 1 ? ' + תינוק אחד' : ` + ${n} תינוקות`,
    waSubtotal: ({ sym, price }) => `${sym} סכום ביניים (כולל מע״מ): ${price}`,
    waVatCalc: ({ sym, divisor, deduction }) =>
      `${sym} ניכוי מע״מ (חלוקה ב-${divisor}): ${deduction}`,
    waTotal: ({ sym, price }) => `${sym} *סה״כ משוער: ${price}*`,
    waVatNote: ({ sym }) => `${sym} המחיר אינו כולל מע״מ (פטור לתיירים)`,
    waClosing: ({ sym }) =>
      `אשמח לקבל אישור זמינות ולהתקדם עם ההזמנה. תודה רבה!${sym}`,
    waDisclaimer: '_הצעת מחיר משוערת, בכפוף לזמינות חדרים._',

    /* --- misc --- */
    currencySymbol: '₪',
    footer: ({ hotel }) => `${hotel} · מחשבון הצעות מחיר לפסח`,
  },

  en: {
    /* --- header --- */
    appTitle: 'Passover Vacation Quote',
    appSubtitle: 'Build your package and get an instant price estimate',
    switchLanguage: 'מעבר לעברית',

    /* --- disclaimer --- */
    disclaimerTitle: 'Please note',
    disclaimer:
      'This is an estimated quote only. Final confirmation depends on room availability.',

    /* --- dates --- */
    datesTitle: 'Stay Dates',
    checkIn: 'Check-in date',
    checkOut: 'Check-out date',
    nights: 'Number of nights',
    nightsValue: ({ n }) => (n === 1 ? '1 night' : `${n} nights`),
    datesHint: ({ from, to }) => `Bookable between ${from} and ${to}`,

    /* --- guest type --- */
    guestTypeTitle: 'Guest Type',
    guestTypeHint: 'Foreign-passport tourists are exempt from the 17% VAT',

    /* --- rooms --- */
    roomsTitle: 'Rooms',
    room: ({ n }) => `Room ${n}`,
    composition: 'Room composition',
    infants: 'Infants (age 0–2)',
    infantsHint: ({ price }) => `${price} ILS per night, per infant`,
    addRoom: 'Add room',
    removeRoom: 'Remove room',
    maxRoomsReached: ({ max }) => `Up to ${max} rooms per quote`,

    /* --- summary --- */
    summaryTitle: 'Quote Summary',
    summaryDates: 'Dates',
    summaryGuestType: 'Guest type',
    summaryRooms: 'Room breakdown',
    roomSubtotal: 'Room total',
    accommodation: 'Accommodation',
    infantsLine: ({ n, nights }) =>
      `${n === 1 ? '1 infant' : `${n} infants`} × ${nights} nights`,
    subtotal: 'Subtotal',
    vatDeduction: 'VAT deduction (tourist exemption)',
    total: 'Total estimate',
    perNight: ({ price }) => `≈ ${price} per night`,
    proratedNote: ({ nights, base }) => `Charged ${nights} of ${base} nights`,

    /* --- price breakdown (the visible math) --- */
    breakdownTitle: 'Price breakdown',
    calcBaseLabel: ({ nights, base }) =>
      `Base price × (${nights} nights / ${base})`,
    calcInfantsLabel: ({ nights }) => `Infant addition (${nights} nights)`,
    calcRoomTotalLabel: 'Room total',
    calcSubtotalLabel: 'Subtotal (incl. VAT)',
    calcVatTitle: 'Tourist VAT exemption',
    calcVatLabel: ({ divisor, percent }) =>
      `Divide by ${divisor} (removes ${percent}% VAT)`,
    calcVatSaved: 'VAT removed',
    calcFinalLabel: 'Final total',

    /* --- CTA --- */
    sendWhatsapp: 'Send Quote to Agent via WhatsApp',
    whatsappHint: 'The message opens pre-filled — you can edit it before sending',
    copySummary: 'Copy summary',
    copied: 'Copied!',

    /* --- validation --- */
    errorCheckInRange: ({ from, to }) =>
      `Check-in must be between ${from} and ${to}`,
    errorCheckOutRange: ({ to }) => `Check-out can be no later than ${to}`,
    errorCheckOutAfterCheckIn: 'Check-out must be after check-in',
    errorNoRooms: 'Add at least one room',
    errorMissingDates: 'Select both check-in and check-out dates',
    fixErrors: 'Fix the details above to see your quote',

    /* --- whatsapp message (symbols are injected, see appConfig SYMBOLS) --- */
    waTitle: ({ sym, hotel }) => `${sym} *Booking Request – ${hotel}*`,
    waCheckIn: ({ sym, date }) => `${sym} Check-in: ${date}`,
    waCheckOut: ({ sym, date }) => `${sym} Check-out: ${date}`,
    waNights: ({ sym, n }) => `${sym} Nights: ${n}`,
    waGuestType: ({ sym, type, note }) =>
      `${sym} Guest type: ${type} (${note})`,
    waRoomsHeader: ({ sym }) => `${sym} *Room breakdown:*`,
    waRoomLine: ({ index, composition, price }) =>
      `${index}. ${composition} — ${price}`,
    waInfantsSuffix: ({ n }) => (n === 1 ? ' + 1 infant' : ` + ${n} infants`),
    waSubtotal: ({ sym, price }) => `${sym} Subtotal (incl. VAT): ${price}`,
    waVatCalc: ({ sym, divisor, deduction }) =>
      `${sym} VAT removed (÷ ${divisor}): ${deduction}`,
    waTotal: ({ sym, price }) => `${sym} *Total estimate: ${price}*`,
    waVatNote: ({ sym }) =>
      `${sym} Price excludes VAT (tourist exemption applied)`,
    waClosing: ({ sym }) =>
      `I would be glad to confirm availability and proceed with the booking. Thank you!${sym}`,
    waDisclaimer: '_Estimated quote, subject to room availability._',

    /* --- misc --- */
    currencySymbol: '₪',
    footer: ({ hotel }) => `${hotel} · Passover quote calculator`,
  },
}

/**
 * Resolve a translation key for a language.
 * Function values are called with `params`; string values are returned as-is.
 * Falls back to the other language, then to the key itself, so a missing
 * string never crashes the UI.
 */
export function translate(lang, key, params) {
  const entry =
    translations[lang]?.[key] ??
    translations[DEFAULT_LANGUAGE]?.[key] ??
    translations.en?.[key]

  if (entry == null) {
    if (import.meta.env?.DEV) console.warn(`[i18n] missing key: ${key}`)
    return key
  }
  return typeof entry === 'function' ? entry(params ?? {}) : entry
}
