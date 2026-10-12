import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  translate,
} from './translations.js'

const STORAGE_KEY = 'hofguy.lang'

const LanguageContext = createContext(null)

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && LANGUAGES[stored]) return stored
  } catch {
    /* localStorage can be unavailable (private mode, blocked cookies) */
  }
  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readStoredLanguage)

  const dir = LANGUAGES[lang].dir

  // Keep <html lang>/<html dir> in sync so the browser applies the right
  // text direction, hyphenation and native control layout.
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore persistence failures */
    }
  }, [lang, dir])

  const toggleLanguage = useCallback(() => {
    setLang((current) => (current === 'he' ? 'en' : 'he'))
  }, [])

  const t = useCallback((key, params) => translate(lang, key, params), [lang])

  const value = useMemo(
    () => ({ lang, dir, t, setLang, toggleLanguage }),
    [lang, dir, t, toggleLanguage],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>')
  return ctx
}
