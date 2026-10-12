# Hof Guy Hotel — Passover Quote Generator

A bilingual (Hebrew RTL / English LTR), mobile-first, **fully client-side** price-quote
calculator for Passover vacation packages at Hof Guy Hotel (מלון חוף גיא).

Guests pick their dates, guest type and room composition; the app shows an itemised
estimate and hands off to the booking coordinator through a pre-filled WhatsApp message.

> No backend, no database, no payments, no inventory. Everything runs in the browser,
> so it deploys as static files to GitHub Pages, Vercel, Netlify or any CDN.

---

## Features

- **Bilingual** — Hebrew (RTL) and English (LTR) with a one-tap toggle; the choice is
  remembered in `localStorage` and drives `<html lang>` / `<html dir>`.
- **Date window enforcement** — check-in and check-out are constrained to the Passover
  window both natively (`min`/`max` on the date inputs) and in validation; nights are
  calculated automatically.
- **Rooms builder** — add up to 10 rooms, each with its own composition and infant count.
- **Transparent pricing** — a **Price breakdown** panel shows the actual arithmetic for
  every room (`24,080 × (7 / 7) = 24,080 ₪`), the infant line, and the tourist VAT
  division (`25,480 ÷ 1.17 = 21,778 ₪`) before the final total.
- **WhatsApp hand-off** — an emoji-formatted `wa.me` deep link with the full booking
  summary, plus a "copy summary" fallback.
- **Estimate disclaimer** shown on every quote, in both languages.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script            | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Vite dev server with hot reload                            |
| `npm run build`   | Production build into `dist/`                              |
| `npm run preview` | Serve the production build locally                         |
| `npm run verify`  | Pricing/validation sanity checks (plain Node, no deps)     |
| `npm run deploy`  | Build + publish `dist/` to the `gh-pages` branch           |

**Stack:** React 19 · Vite 7 · Tailwind CSS 4. No runtime dependencies beyond React.

---

## ⚙️ Configuration — read this before going live

Everything a non-developer needs to change lives in two files.

### 1. `src/config/appConfig.js` — **line 21**, the WhatsApp number

```js
export const WHATSAPP_PHONE = '972507783222'
```

International format, **digits only** — no `+`, no dashes, no spaces:

| Local number | Value to write |
| ------------ | -------------- |
| 050-778-3222 | `'972507783222'` |
| 054-123-4567 | `'972541234567'` |

That line is the only place the number appears, and nothing validates it — whatever
is there is what the WhatsApp button uses.

Also in this file:

| Constant                | Purpose                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `HOTEL`                 | Hotel name and tagline per language                                 |
| `BOOKING_WINDOW`        | Year, month and the allowed check-in/check-out days                 |
| `MESSAGE_SYMBOL_STYLE`  | `'safe'` (BMP symbols) or `'emoji'` for the WhatsApp message        |
| `MAX_ROOMS`             | Rooms allowed in a single quote (default 10)                        |
| `MAX_INFANTS_PER_ROOM`  | Infants allowed per room (default 3)                                |

The booking window currently defaults to **21–28 April 2027** (Passover 5787), which
is exactly **7 nights** — the full package at 100% of the base price.

### 2. `src/config/pricing.js`

```js
export const BASE_NIGHTS = 7              // basePrice covers a 7-NIGHT stay
export const VAT_RATE = 0.17              // tourists: total / (1 + VAT_RATE)
export const INFANT_PRICE_PER_NIGHT = 100 // per night, never prorated
export const ROOM_COMPOSITIONS = [ /* id, basePrice, bilingual label */ ]
```

Add, remove or reprice a composition by editing that array — the dropdown, the summary
and the WhatsApp message all read from it. Run `npm run verify` afterwards.

### 3. Copy

All user-facing text is in `src/i18n/translations.js`, with identical keys for `he`
and `en`. Values are either strings or functions receiving an interpolation object.

---

## Pricing model

Everything is priced strictly in **nights**. The Passover window, 21–28 April, is
exactly 7 nights — the full package at 100% of the base price.

Per room — every figure at this stage **includes** VAT:

```
accommodation = round(basePrice × (nights / 7))   # prorated
infants       = infantCount × 100 × nights        # flat, NOT divided by 7
roomTotal     = accommodation + infants
```

Then once, for the whole booking:

```
subtotal = sum of all roomTotal
total    = tourist ? round(subtotal / 1.17) : subtotal
```

| Stay | Nights | Share of base |
| ---- | ------ | ------------- |
| 21 → 28 Apr | 7 | **7/7 = 100%** |
| 23 → 28 Apr | 5 | 5/7 ≈ 71% |
| 21 → 24 Apr | 3 | 3/7 ≈ 43% |

**Rounding.** The VAT exemption is applied a single time to the subtotal rather than
per room, so the UI shows one honest division instead of the same rounding repeated N
times. Every intermediate value is already a whole shekel, so the breakdown on screen
always adds up exactly to the headline figure.

Worked example — 21–28 April (7 nights), 1 room of 2 adults + 2 infants, tourist:

```
Base price × (7 nights / 7)   24,080 × (7 / 7) = 24,080 ₪
Infant addition (7 nights)        2 × 100 × 7 =  1,400 ₪
Room total                  24,080 +    1,400 = 25,480 ₪
──────────────────────────────────────────────────────────
Subtotal (incl. VAT)                           = 25,480 ₪
VAT exemption               25,480 ÷ 1.17      = 21,778 ₪
VAT removed                 25,480 − 21,778    =  3,702 ₪
```

Each of those lines is rendered in the app, per room and for the booking as a whole,
under a **Price breakdown / פירוט חישוב** panel. Formula text is always `dir="ltr"`
so the operands keep their order on the Hebrew side.

---

## WhatsApp message encoding

The message body is built from plain characters and the whole string is
percent-encoded with `encodeURIComponent()` before being appended to
`https://wa.me/<digits>?text=` — Hebrew becomes `%D7xx` and newlines become `%0A`.

Two non-obvious traps are already handled. Both are worth reading before
"tidying" the formatting back.

### 1. Emoji are 4 bytes and get destroyed in transit

WhatsApp Web delivered this:

```
� *Booking Request – Hof Guy Hotel*
� Check-in: 22/04/2027
```

Every emoji became one `U+FFFD`, while `₪`, `–` and all the Hebrew arrived intact.
The dividing line is the Basic Multilingual Plane: `🏨` is `U+1F3E8`, stored as a
UTF-16 **surrogate pair** and 4 bytes in UTF-8, whereas `₪` (`U+20AA`) is 3 bytes.
Somewhere on the path the payload goes through a UCS-2 ("2 bytes per character")
stage that collapses each pair into a single replacement character.

So the outgoing message uses BMP-only symbols — `★ ▸ ☾ ✦ ✓ −` — configured in
`MESSAGE_SYMBOLS` / `MESSAGE_SYMBOL_STYLE` in `src/config/appConfig.js`:

```js
export const MESSAGE_SYMBOL_STYLE = 'safe'   // or 'emoji'
```

Set it to `'emoji'` to get the 🏨 📅 💰 set back if your coordinator's client
renders them correctly. `toBmpSafe()` additionally strips any stray astral
character (and its orphaned variation selectors) in `'safe'` mode, so adding an
emoji to a translation string can't silently reintroduce the bug.

**The in-app UI is unaffected and still uses emoji** — a browser renders them
correctly; only the outgoing message is restricted.

### 2. Intl's Hebrew currency output contains invisible characters

`Intl.NumberFormat('he-IL', {style:'currency'})` does not return `"20,640 ₪"`. It
returns

```
U+200F 2 0 , 6 4 0 U+00A0 U+200F U+20AA
```

— two invisible right-to-left marks and a no-break space. A browser renders that
correctly, but encoded it travels as `%E2%80%8F` / `%C2%A0` and surfaces as stray
boxes. So `formatCurrencyPlain()` assembles the amount by hand, and
`sanitizeForPlainText()` strips bidi controls and exotic spaces from the finished
message.

`npm run verify` asserts all of this: no character above 3 UTF-8 bytes, no bidi
mark or no-break space, newlines encoded as `%0A`, and a byte-for-byte Hebrew
round-trip through the URL.

---

## Project structure

```
src/
├── App.jsx                     # state, handlers, layout
├── main.jsx
├── index.css                   # Tailwind v4 theme (ocean/sand palette)
├── config/
│   ├── appConfig.js            # phone, hotel, booking window, limits
│   └── pricing.js              # base prices, VAT, infants, guest types
├── i18n/
│   ├── translations.js         # all he/en strings + translate()
│   └── LanguageContext.jsx     # provider, toggle, <html dir> sync
├── lib/
│   ├── dates.js                # ISO parsing, nights, formatting
│   ├── format.js               # currency/number formatting + plain-text sanitizer
│   ├── quote.js                # validation + price calculation
│   └── whatsapp.js             # message builder + wa.me URL
└── components/
    ├── Header.jsx, LanguageToggle.jsx, Disclaimer.jsx, Card.jsx
    ├── DatesSection.jsx, GuestTypeSection.jsx
    ├── RoomsSection.jsx, RoomRow.jsx
    ├── PriceBreakdown.jsx      # the visible-math panel and rows
    └── QuoteSummary.jsx        # breakdown, totals, WhatsApp CTA
scripts/verify-pricing.mjs      # npm run verify
.github/workflows/deploy.yml    # GitHub Pages CI
```

---

## Deployment

`vite.config.js` sets `base: './'`, so the build uses relative asset paths and the same
`dist/` works at any sub-path. There is no router, so no SPA rewrite rules are needed.

### GitHub Pages — automatic (recommended)

1. Create the repo and push:

   ```bash
   git init
   git add .
   git commit -m "Passover quote generator"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```

2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

3. The included workflow (`.github/workflows/deploy.yml`) builds and publishes on every
   push to `main`. The site lands at `https://<user>.github.io/<repo>/`.

### GitHub Pages — manual

```bash
npm run deploy      # builds and pushes dist/ to the gh-pages branch
```

Then set **Settings → Pages → Source: Deploy from a branch → `gh-pages` / root**.

### Vercel

Import the repo at [vercel.com/new](https://vercel.com/new). Vercel detects Vite
automatically — build command `npm run build`, output directory `dist`. No env vars.

### Netlify / any static host

```bash
npm run build       # then upload the contents of dist/
```

---

## Notes & limitations

- The quote is an estimate only; availability is confirmed by the coordinator. The
  disclaimer is shown in the body and the footer, and repeated inside the WhatsApp
  message.
- `wa.me` opens WhatsApp with the message pre-filled; the guest still presses send, and
  can edit the text first.
- Clipboard copy needs a secure context (HTTPS or `localhost`); it fails silently
  otherwise and the WhatsApp button remains available.
- Prices are hardcoded for one season. There is no availability check, no hold on a
  room, and no persistence of submitted quotes.
