import Card from './Card.jsx'
import { GUEST_TYPES, VAT_PERCENT } from '../config/pricing.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function GuestTypeSection({ value, onChange }) {
  const { lang, t } = useLanguage()

  return (
    <Card
      step={2}
      title={t('guestTypeTitle')}
      hint={t('guestTypeHint', { percent: VAT_PERCENT })}
    >
      <div
        role="radiogroup"
        aria-label={t('guestTypeTitle')}
        className="grid gap-3 sm:grid-cols-2"
      >
        {GUEST_TYPES.map((type) => {
          const selected = value === type.id
          return (
            <button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(type.id)}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-start transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300 ${
                selected
                  ? 'border-ocean-500 bg-ocean-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-ocean-200 hover:bg-ocean-50/40'
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected ? 'border-ocean-600' : 'border-slate-300'
                }`}
              >
                {selected && (
                  <span className="size-2.5 rounded-full bg-ocean-600" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-slate-800">
                  {type.label[lang]}
                </span>
                <span className="block text-sm text-slate-500">
                  {type.note[lang]}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
