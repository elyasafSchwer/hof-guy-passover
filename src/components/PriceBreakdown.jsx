/**
 * Price-breakdown primitives — the visible arithmetic behind every number.
 *
 * The formula text is always rendered `dir="ltr"`: mathematical expressions
 * read left-to-right in both languages, and letting them inherit RTL would
 * scramble the operand order on the Hebrew side.
 */

/** One line of math: a localized label plus the LTR expression. */
export function CalcRow({ label, formula, emphasis = false }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <span
        className={`text-xs ${
          emphasis ? 'font-bold text-ocean-900' : 'text-slate-500'
        }`}
      >
        {label}
      </span>
      <span
        dir="ltr"
        className={`font-mono text-xs tabular-nums ${
          emphasis ? 'font-bold text-ocean-800' : 'text-slate-700'
        }`}
      >
        {formula}
      </span>
    </div>
  )
}

/** Titled container grouping several CalcRows. */
export function BreakdownPanel({ title, children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-slate-200 bg-slate-50/80',
    vat: 'border-emerald-200 bg-emerald-50/70',
  }

  return (
    <div className={`rounded-lg border px-3 py-2.5 ${tones[tone]}`}>
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="size-3.5"
        >
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15v2" />
        </svg>
        {title}
      </p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}
