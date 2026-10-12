import { useCallback, useMemo, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { BreakdownPanel, CalcRow } from './PriceBreakdown.jsx'
import { formatDate } from '../lib/dates.js'
import { formatCurrency, formatNumber } from '../lib/format.js'
import { buildWhatsappMessage, buildWhatsappUrl } from '../lib/whatsapp.js'

export default function QuoteSummary({ quote, checkIn, checkOut, blocked }) {
  const { lang, t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const message = useMemo(
    () =>
      quote ? buildWhatsappMessage({ quote, checkIn, checkOut, lang, t }) : '',
    [quote, checkIn, checkOut, lang, t],
  )

  const whatsappUrl = useMemo(
    () => (message ? buildWhatsappUrl(message) : '#'),
    [message],
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable (insecure context / denied) — stay silent */
    }
  }, [message])

  if (blocked || !quote) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-500">
        {t('fixErrors')}
      </div>
    )
  }

  // Shorthands for building the formula strings. `n` keeps raw numbers out of
  // locale-specific currency formatting, which would inject bidi marks.
  const n = (value) => formatNumber(value, lang)
  const money = (value) => `${n(value)} ₪`
  const vatPercent = Math.round(quote.vatRate * 100)

  return (
    <section
      aria-live="polite"
      className="overflow-hidden rounded-2xl border border-ocean-200 bg-white shadow-lg shadow-ocean-900/10"
    >
      <header className="bg-gradient-to-br from-ocean-700 to-ocean-500 px-5 py-4 text-white sm:px-6">
        <h2 className="text-lg font-extrabold sm:text-xl">
          {t('summaryTitle')}
        </h2>
      </header>

      <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
        {/* Dates + guest type */}
        <dl className="grid gap-3 sm:grid-cols-2">
          <SummaryItem icon="📅" label={t('summaryDates')}>
            <span className="font-semibold">
              {formatDate(checkIn, lang)} – {formatDate(checkOut, lang)}
            </span>
            <span className="block text-sm text-slate-500">
              {t('nightsValue', { n: quote.nights })}
            </span>
          </SummaryItem>

          <SummaryItem icon="👤" label={t('summaryGuestType')}>
            <span className="font-semibold">
              {quote.guestType.label[lang]}
            </span>
            <span className="block text-sm text-slate-500">
              {quote.guestType.note[lang]}
            </span>
          </SummaryItem>
        </dl>

        {/* Room breakdown, each with its own visible math */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            <span aria-hidden="true">🛏️</span>
            {t('summaryRooms')}
          </h3>

          <ul className="flex flex-col gap-2.5">
            {quote.rooms.map((room, index) => (
              <li
                key={room.id}
                className="rounded-xl border border-slate-100 p-3.5"
              >
                <div className="mb-2.5 flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ocean-100 text-xs font-bold text-ocean-700"
                  >
                    {index + 1}
                  </span>

                  <p className="min-w-0 flex-1 font-semibold text-slate-800">
                    {room.composition.label[lang]}
                    {room.infants > 0 && (
                      <span className="block text-sm font-normal text-slate-500">
                        👶 {t('infantsLine', {
                          n: room.infants,
                          nights: quote.nights,
                        })}
                      </span>
                    )}
                  </p>

                  <span className="shrink-0 font-bold text-ocean-800">
                    {formatCurrency(room.total, lang)}
                  </span>
                </div>

                <BreakdownPanel title={t('breakdownTitle')}>
                  <CalcRow
                    label={t('calcBaseLabel', {
                      nights: quote.nights,
                      base: quote.baseNights,
                    })}
                    formula={`${n(room.basePrice)} × (${quote.nights} / ${
                      quote.baseNights
                    }) = ${money(room.accommodation)}`}
                  />

                  {room.infants > 0 && (
                    <>
                      <CalcRow
                        label={t('calcInfantsLabel', { nights: quote.nights })}
                        formula={`${room.infants} × ${n(quote.infantRate)} × ${
                          quote.nights
                        } = ${money(room.infantsCost)}`}
                      />
                      <CalcRow
                        label={t('calcRoomTotalLabel')}
                        formula={`${n(room.accommodation)} + ${n(
                          room.infantsCost,
                        )} = ${money(room.total)}`}
                        emphasis
                      />
                    </>
                  )}
                </BreakdownPanel>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-xs text-slate-400">
            {t('proratedNote', {
              nights: quote.nights,
              base: quote.baseNights,
            })}
          </p>
        </div>

        {/* Totals, with the VAT step shown explicitly for tourists */}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
          {quote.vatExempt && (
            <>
              <TotalRow
                label={t('calcSubtotalLabel')}
                value={formatCurrency(quote.subtotal, lang)}
              />

              <BreakdownPanel title={t('calcVatTitle')} tone="vat">
                <CalcRow
                  label={t('calcVatLabel', {
                    divisor: quote.vatDivisor,
                    percent: vatPercent,
                  })}
                  formula={`${n(quote.subtotal)} ÷ ${quote.vatDivisor} = ${money(
                    quote.total,
                  )}`}
                />
                <CalcRow
                  label={t('calcVatSaved')}
                  formula={`${n(quote.subtotal)} − ${n(quote.total)} = ${money(
                    quote.vatDeduction,
                  )}`}
                  emphasis
                />
              </BreakdownPanel>
            </>
          )}

          <div className="flex items-end justify-between gap-3 rounded-xl bg-ocean-50 px-4 py-3">
            <div>
              <span className="block font-bold text-ocean-900">
                {t('total')}
              </span>
              <span className="block text-xs text-slate-500">
                {t('perNight', {
                  price: formatCurrency(quote.perNight, lang),
                })}
              </span>
            </div>
            <span className="text-2xl font-extrabold text-ocean-700 sm:text-3xl">
              {formatCurrency(quote.total, lang)}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="no-print flex flex-col gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-[#25D366]/30 transition hover:bg-[#1fb855] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:text-lg"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35z" />
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.7 8.22-8.23 8.22z" />
            </svg>
            {t('sendWhatsapp')}
          </a>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">{t('whatsappHint')}</p>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-ocean-700 transition hover:bg-ocean-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300"
            >
              {copied ? `✓ ${t('copied')}` : t('copySummary')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function SummaryItem({ icon, label, children }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3.5">
      <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
        <span aria-hidden="true">{icon}</span>
        {label}
      </dt>
      <dd className="text-slate-800">{children}</dd>
    </div>
  )
}

function TotalRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  )
}
