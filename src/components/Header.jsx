import { HOTEL } from '../config/appConfig.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import LanguageToggle from './LanguageToggle.jsx'

export default function Header() {
  const { lang, t } = useLanguage()
  const hotel = HOTEL[lang]

  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-ocean-800 to-ocean-600 text-white">
      {/* decorative wave */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 w-full text-ocean-50"
      >
        <path
          fill="currentColor"
          d="M0 64c120 24 240 36 360 28s240-36 360-40 240 20 360 32 240 8 360-12v48H0z"
        />
      </svg>

      <div className="relative mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-5 pb-14 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className="text-2xl">
              🏨
            </span>
            <span className="truncate text-base font-extrabold tracking-tight sm:text-lg">
              {hotel.name}
            </span>
          </div>
          <LanguageToggle />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
            {t('appTitle')}
          </h1>
          <p className="mt-1 text-sm text-ocean-100 sm:text-base">
            {t('appSubtitle')}
          </p>
        </div>
      </div>
    </header>
  )
}
