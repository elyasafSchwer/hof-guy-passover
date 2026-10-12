import { useLanguage } from '../i18n/LanguageContext.jsx'

/** Always-visible estimate disclaimer, required on every quote. */
export default function Disclaimer() {
  const { t } = useLanguage()

  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-2xl border border-sand-200 bg-sand-50 p-4 text-sand-600"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="mt-0.5 size-5 shrink-0 text-sand-400"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v4h1" />
      </svg>
      <p className="text-sm leading-relaxed">
        <span className="font-bold">{t('disclaimerTitle')}: </span>
        <span className="text-slate-700">{t('disclaimer')}</span>
      </p>
    </div>
  )
}
