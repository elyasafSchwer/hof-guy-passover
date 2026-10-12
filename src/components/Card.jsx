/**
 * Section card — the single container style used by every form section.
 */
export default function Card({ step, title, hint, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm shadow-ocean-900/5 sm:p-6 ${className}`}
    >
      <header className="mb-4 flex items-start gap-3">
        {step != null && (
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-sm font-bold text-white"
          >
            {step}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-ocean-900 sm:text-xl">
            {title}
          </h2>
          {hint && <p className="mt-0.5 text-sm text-slate-500">{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  )
}
