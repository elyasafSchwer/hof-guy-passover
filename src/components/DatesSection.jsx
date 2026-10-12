import { useId } from 'react'
import Card from './Card.jsx'
import { DATE_LIMITS } from '../config/appConfig.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { addDays, formatDate } from '../lib/dates.js'

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 shadow-sm transition focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200 disabled:bg-slate-50'

const fieldErrorClass =
  'border-rose-300 focus:border-rose-400 focus:ring-rose-200'

export default function DatesSection({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  nights,
  errors,
}) {
  const { lang, t } = useLanguage()
  const checkInId = useId()
  const checkOutId = useId()

  // Check-out can never be earlier than the night after check-in.
  const dayAfterCheckIn = checkIn ? addDays(checkIn, 1) : null
  const checkOutMin =
    dayAfterCheckIn && dayAfterCheckIn > DATE_LIMITS.checkOutMin
      ? dayAfterCheckIn
      : DATE_LIMITS.checkOutMin

  return (
    <Card
      step={1}
      title={t('datesTitle')}
      hint={t('datesHint', {
        from: formatDate(DATE_LIMITS.checkInMin, lang),
        to: formatDate(DATE_LIMITS.checkOutMax, lang),
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={checkInId}
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            {t('checkIn')}
          </label>
          <input
            id={checkInId}
            type="date"
            value={checkIn}
            min={DATE_LIMITS.checkInMin}
            max={DATE_LIMITS.checkInMax}
            onChange={(e) => onCheckInChange(e.target.value)}
            aria-invalid={Boolean(errors.checkIn)}
            className={`${fieldClass} ${errors.checkIn ? fieldErrorClass : ''}`}
          />
          {errors.checkIn && <FieldError>{errors.checkIn}</FieldError>}
        </div>

        <div>
          <label
            htmlFor={checkOutId}
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            {t('checkOut')}
          </label>
          <input
            id={checkOutId}
            type="date"
            value={checkOut}
            min={checkOutMin}
            max={DATE_LIMITS.checkOutMax}
            onChange={(e) => onCheckOutChange(e.target.value)}
            aria-invalid={Boolean(errors.checkOut)}
            className={`${fieldClass} ${errors.checkOut ? fieldErrorClass : ''}`}
          />
          {errors.checkOut && <FieldError>{errors.checkOut}</FieldError>}
        </div>
      </div>

      {errors.dates && <FieldError className="mt-3">{errors.dates}</FieldError>}

      <div
        aria-live="polite"
        className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-ocean-50 px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-ocean-900">
          <span aria-hidden="true">🌙</span>
          {t('nights')}
        </span>
        <span className="text-lg font-extrabold text-ocean-700">
          {nights > 0 ? t('nightsValue', { n: nights }) : '—'}
        </span>
      </div>
    </Card>
  )
}

function FieldError({ children, className = '' }) {
  return (
    <p className={`mt-1.5 text-sm font-medium text-rose-600 ${className}`}>
      {children}
    </p>
  )
}
