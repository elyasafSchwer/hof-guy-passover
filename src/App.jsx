import { useCallback, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import Disclaimer from './components/Disclaimer.jsx'
import DatesSection from './components/DatesSection.jsx'
import GuestTypeSection from './components/GuestTypeSection.jsx'
import RoomsSection from './components/RoomsSection.jsx'
import QuoteSummary from './components/QuoteSummary.jsx'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext.jsx'
import {
  DATE_LIMITS,
  DEFAULT_DATES,
  HOTEL,
  MAX_ROOMS,
} from './config/appConfig.js'
import {
  DEFAULT_COMPOSITION_ID,
  DEFAULT_GUEST_TYPE_ID,
} from './config/pricing.js'
import { addDays, nightsBetween } from './lib/dates.js'
import { calculateQuote, validateBooking } from './lib/quote.js'

let roomCounter = 0

function createRoom() {
  roomCounter += 1
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `room-${roomCounter}-${Date.now()}`

  return { id, compositionId: DEFAULT_COMPOSITION_ID, infants: 0 }
}

function QuoteBuilder() {
  const { lang, t } = useLanguage()

  const [checkIn, setCheckIn] = useState(DEFAULT_DATES.checkIn)
  const [checkOut, setCheckOut] = useState(DEFAULT_DATES.checkOut)
  const [guestTypeId, setGuestTypeId] = useState(DEFAULT_GUEST_TYPE_ID)
  const [rooms, setRooms] = useState(() => [createRoom()])

  /* ----------------------------- date handlers ---------------------------- */

  const handleCheckInChange = useCallback((value) => {
    setCheckIn(value)
    // Keep check-out valid: it must always fall after the new check-in.
    setCheckOut((current) => {
      if (!value || current > value) return current
      const next = addDays(value, 1)
      return next <= DATE_LIMITS.checkOutMax ? next : current
    })
  }, [])

  /* ----------------------------- room handlers ---------------------------- */

  const updateRoom = useCallback((id, next) => {
    setRooms((current) => current.map((r) => (r.id === id ? next : r)))
  }, [])

  const removeRoom = useCallback((id) => {
    setRooms((current) =>
      current.length > 1 ? current.filter((r) => r.id !== id) : current,
    )
  }, [])

  const addRoom = useCallback(() => {
    setRooms((current) =>
      current.length >= MAX_ROOMS ? current : [...current, createRoom()],
    )
  }, [])

  /* ------------------------------ derived data ---------------------------- */

  const nights = useMemo(
    () => nightsBetween(checkIn, checkOut),
    [checkIn, checkOut],
  )

  const validationErrors = useMemo(
    () => validateBooking({ checkIn, checkOut, rooms }),
    [checkIn, checkOut, rooms],
  )

  /** Localized errors keyed by field, for inline display. */
  const errorsByField = useMemo(() => {
    const map = {}
    for (const error of validationErrors) {
      if (!map[error.field]) map[error.field] = t(error.key, error.params)
    }
    return map
  }, [validationErrors, t])

  const quote = useMemo(() => {
    if (validationErrors.length > 0) return null
    return calculateQuote({ checkIn, checkOut, guestTypeId, rooms })
  }, [validationErrors, checkIn, checkOut, guestTypeId, rooms])

  /* --------------------------------- render ------------------------------- */

  return (
    <div className="flex min-h-dvh flex-col bg-ocean-50">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12 sm:px-6">
        <div className="flex flex-col gap-5 pt-2">
          <Disclaimer />

          <DatesSection
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInChange={handleCheckInChange}
            onCheckOutChange={setCheckOut}
            nights={nights}
            errors={errorsByField}
          />

          <GuestTypeSection value={guestTypeId} onChange={setGuestTypeId} />

          <RoomsSection
            rooms={rooms}
            onUpdateRoom={updateRoom}
            onRemoveRoom={removeRoom}
            onAddRoom={addRoom}
            error={errorsByField.rooms}
          />

          <QuoteSummary
            quote={quote}
            checkIn={checkIn}
            checkOut={checkOut}
            blocked={validationErrors.length > 0}
          />
        </div>
      </main>

      <footer className="border-t border-ocean-100 bg-white/70 py-5 text-center text-xs text-slate-500">
        <p>{t('footer', { hotel: HOTEL[lang].name })}</p>
        <p className="mt-1">{t('disclaimer')}</p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <QuoteBuilder />
    </LanguageProvider>
  )
}
