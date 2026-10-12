import { useId } from 'react'
import { MAX_INFANTS_PER_ROOM } from '../config/appConfig.js'
import {
  INFANT_PRICE_PER_NIGHT,
  ROOM_COMPOSITIONS,
} from '../config/pricing.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

/** A single room row inside the rooms builder. */
export default function RoomRow({ room, index, canRemove, onChange, onRemove }) {
  const { lang, t } = useLanguage()
  const compositionId = useId()
  const infantsId = useId()

  const infants = room.infants

  const setInfants = (next) => {
    const clamped = Math.min(MAX_INFANTS_PER_ROOM, Math.max(0, next))
    onChange({ ...room, infants: clamped })
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-bold text-ocean-900">
          <span aria-hidden="true">🛏️</span>
          {t('room', { n: index + 1 })}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="size-4"
            >
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </svg>
            {t('removeRoom')}
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label
            htmlFor={compositionId}
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            {t('composition')}
          </label>
          <select
            id={compositionId}
            value={room.compositionId}
            onChange={(e) =>
              onChange({ ...room, compositionId: e.target.value })
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 shadow-sm transition focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          >
            {ROOM_COMPOSITIONS.map((composition) => (
              <option key={composition.id} value={composition.id}>
                {composition.label[lang]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={infantsId}
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            {t('infants')}
          </label>
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <StepperButton
              onClick={() => setInfants(infants - 1)}
              disabled={infants <= 0}
              label="−"
            />
            <input
              id={infantsId}
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_INFANTS_PER_ROOM}
              value={infants}
              onChange={(e) => setInfants(Number(e.target.value))}
              className="w-12 border-0 bg-transparent text-center text-base font-bold text-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <StepperButton
              onClick={() => setInfants(infants + 1)}
              disabled={infants >= MAX_INFANTS_PER_ROOM}
              label="+"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {t('infantsHint', { price: INFANT_PRICE_PER_NIGHT })}
          </p>
        </div>
      </div>
    </li>
  )
}

function StepperButton({ onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label === '+' ? 'increase' : 'decrease'}
      className="flex size-9 items-center justify-center rounded-lg bg-ocean-50 text-lg font-bold text-ocean-700 transition hover:bg-ocean-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300"
    >
      {label}
    </button>
  )
}
