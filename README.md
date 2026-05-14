# TriOrbit Group

Marketing site for **TriOrbit Group** — a Sofia-based professional cleaning company. Post-construction cleaning, deep home cleaning, professional disinfection, and additional services (carpets, sofas, appliances).

Single-page bilingual site (Bulgarian primary, English toggle) with a multi-step inquiry form.

## Stack

Zero-build, zero-dependency static site:

- `index.html` — semantic markup, BG copy in-DOM, `data-bg` / `data-en` swap attributes
- `styles.css` — design tokens (dark + gold accent), Manrope + JetBrains Mono, airy density
- `app.js` — language toggle, sticky-nav scroll state, mobile menu, scroll reveals, multi-step inquiry form

Manrope and JetBrains Mono are loaded from Google Fonts. No bundler, no framework, no service worker.

## Run locally

Open `index.html` directly in a browser, or serve the directory:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Design tokens

```
Background:  oklch(0.165 0.020 255)  — deep navy-black
Accent:      oklch(0.78 0.135 82)    — TriOrbit gold
Ink:         oklch(0.97 0.005 80)    — warm off-white
Display:     Manrope 700 / -0.025em
Body:        Manrope 300/400
Eyebrow:     JetBrains Mono 500 / uppercase / 0.20em tracking
Section gap: 176px (airy)
```

Override via CSS custom properties on `:root` in `styles.css`.

## Bilingual content

Every translatable element carries both `data-bg` and `data-en` attributes; the BG copy lives in the HTML body so the page is SEO-friendly for the Bulgarian market by default. `app.js` swaps `textContent` on toggle and persists the choice in `localStorage`.

Adding a new translation: add the BG copy as the element's text, plus `data-bg="…"` and `data-en="…"` attributes. Inputs/textareas use `data-bg-placeholder` / `data-en-placeholder`.

## Inquiry form

Three-step form (service → property → contact) with progress bar, validation between steps, and a success state. No backend — wire your endpoint in `app.js` inside the submit handler (look for the `Hook your endpoint here` comment).

## Contact

- **Phone:** 0889 760 505 / 0886 788 815
- **Email:** triorbit.group@gmail.com
- **Sofia, Bulgaria** · Mon – Sat, 08:00 – 19:00

## License

Proprietary — © 2026 TriOrbit Group. All rights reserved.
