import { useLanguage } from '../i18n/LanguageContext.jsx'
import { LANGUAGES } from '../i18n/translations.js'

/** Top-right toggle that flips the whole interface between Hebrew and English. */
export default function LanguageToggle() {
  const { lang, toggleLanguage, t } = useLanguage()
  const other = lang === 'he' ? LANGUAGES.en : LANGUAGES.he

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={t('switchLanguage')}
      className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ocean-700"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="size-4"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
      </svg>
      {other.name}
    </button>
  )
}
