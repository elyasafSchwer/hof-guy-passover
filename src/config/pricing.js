/**
 * ---------------------------------------------------------------------------
 *  PRICING CONFIGURATION
 * ---------------------------------------------------------------------------
 *  All prices are in ILS and INCLUDE 17% Israeli VAT.
 *
 *  `basePrice` is the price of a FULL 7-NIGHT stay. The Passover window runs
 *  21–28 April, which is exactly 7 nights — the full package at 100%.
 *
 *      accommodation = basePrice * (nights / BASE_NIGHTS)
 *
 *  Shorter stays are prorated: 5 nights = 5/7 of the base price.
 * ---------------------------------------------------------------------------
 */

/** The number of nights the `basePrice` figures represent. */
export const BASE_NIGHTS = 7

/** Israeli VAT rate. Tourists are exempt: total / (1 + VAT_RATE). */
export const VAT_RATE = 0.17

/** Flat surcharge per infant (age 0–2), per night. Never prorated. */
export const INFANT_PRICE_PER_NIGHT = 100

/** Currency used for all display formatting. */
export const CURRENCY = 'ILS'

/**
 * Room compositions. `id` is the stable key stored in state and used in the
 * WhatsApp message; labels are display-only.
 */
export const ROOM_COMPOSITIONS = [
  {
    id: 'one_adult',
    basePrice: 21672,
    adults: 1,
    children: 0,
    label: { en: '1 Adult', he: 'מבוגר אחד' },
  },
  {
    id: 'two_adults',
    basePrice: 24080,
    adults: 2,
    children: 0,
    label: { en: '2 Adults', he: '2 מבוגרים' },
  },
  {
    id: 'three_adults',
    basePrice: 33712,
    adults: 3,
    children: 0,
    label: { en: '3 Adults', he: '3 מבוגרים' },
  },
  {
    id: 'two_adults_one_child',
    basePrice: 30100,
    adults: 2,
    children: 1,
    label: {
      en: '2 Adults & 1 Child (age 2–13)',
      he: '2 מבוגרים + ילד אחד (גיל 2–13)',
    },
  },
  {
    id: 'two_adults_two_children',
    basePrice: 36120,
    adults: 2,
    children: 2,
    label: {
      en: '2 Adults & 2 Children (age 2–13)',
      he: '2 מבוגרים + 2 ילדים (גיל 2–13)',
    },
  },
  {
    id: 'two_children',
    basePrice: 18060,
    adults: 0,
    children: 2,
    label: { en: '2 Children (age 2–13)', he: '2 ילדים (גיל 2–13)' },
  },
  {
    id: 'three_children',
    basePrice: 24080,
    adults: 0,
    children: 3,
    label: { en: '3 Children (age 2–18)', he: '3 ילדים (גיל 2–18)' },
  },
  {
    id: 'four_children',
    basePrice: 30100,
    adults: 0,
    children: 4,
    label: { en: '4 Children (age 2–18)', he: '4 ילדים (גיל 2–18)' },
  },
]

/** The composition pre-selected when a new room is added. */
export const DEFAULT_COMPOSITION_ID = 'two_adults'

const COMPOSITION_INDEX = new Map(ROOM_COMPOSITIONS.map((c) => [c.id, c]))

/** Look up a composition by id. Returns `undefined` for unknown ids. */
export function getComposition(id) {
  return COMPOSITION_INDEX.get(id)
}

/** Guest types. Tourists are VAT exempt. */
export const GUEST_TYPES = [
  {
    id: 'israeli',
    vatExempt: false,
    label: { en: 'Israeli Citizen', he: 'אזרח ישראלי' },
    note: { en: 'Includes 17% VAT', he: 'כולל מע״מ 17%' },
  },
  {
    id: 'tourist',
    vatExempt: true,
    label: { en: 'Tourist', he: 'תייר' },
    note: { en: 'Exempt from VAT', he: 'פטור ממע״מ' },
  },
]

export const DEFAULT_GUEST_TYPE_ID = 'israeli'

/** Look up a guest type by id, falling back to the default. */
export function getGuestType(id) {
  return GUEST_TYPES.find((g) => g.id === id) ?? GUEST_TYPES[0]
}
