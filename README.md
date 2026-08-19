# TriOrbit Group

Marketing site for **TriOrbit Group** — a professional cleaning company operating across Bulgaria, based in Lovech. Post-construction cleaning, deep home cleaning, professional disinfection, and additional services (carpets, sofas, appliances).

Single-page bilingual site (Bulgarian primary, English toggle) with a multi-step inquiry form.

## Stack

Zero-build, zero-dependency static site:

- `index.html` — semantic markup, BG copy in-DOM, `data-bg` / `data-en` swap attributes
- `styles.css` — design tokens, layout, responsive rules
- `app.js` — language toggle, sticky-nav state, mobile menu, scroll reveals, multi-step inquiry form
- `api/inquiry.mjs` — serverless handler for the inquiry form (rate limiting, origin check, validation)

Prata and Onest are loaded from Google Fonts. No bundler, no framework, no service worker.

## Run locally

Open `index.html` directly in a browser, or serve the directory:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Design

White, black, and a single gold accent. Prata for display type and prices, Onest for body text and labels. Soft geometry throughout — pill buttons and inputs, 16/26/40/56px card radii, rounded section blocks. No uppercase labels anywhere.

```
White:      #ffffff   page ground
Grey 04:    #f4f4f4   secondary bands, chips, cards
Grey 12:    #e2e2e2   hairlines on grey
Grey 66:    #565656   body text
Black:      #000000   headings, dark blocks
Gold:       #d0a45e   brand mark, one accent button, active states
```

The gold is deliberately rare: the orbit mark, the accent button, the active form step, the discount figures, and the eyebrow dot. Override any token on `:root` in `styles.css`.

Illustration is vector only — soft circular medallions for the four services, a gradient "orbit lens" in the hero, an arc rail for the process, and the Bulgaria coverage map. The photo slots in the sign-off protocol are empty plates awaiting real job photography.

Source design canvas: https://claude.ai/code/artifact/9cd14afd-2e85-41d5-92fd-d2ddb567eea4 — the working artboards live in `design/`.

## Bilingual content

Every translatable element carries both `data-bg` and `data-en` attributes; the BG copy lives in the HTML body so the page is SEO-friendly for the Bulgarian market by default. `app.js` swaps `textContent` on toggle and persists the choice in `localStorage`.

Adding a new translation: add the BG copy as the element's text, plus `data-bg="…"` and `data-en="…"` attributes. Inputs/textareas use `data-bg-placeholder` / `data-en-placeholder`. Multi-line headings wrap each line in `<span class="line">` so the swap does not eat the line break.

## Inquiry form

Three steps (service → site → contact) with a progress bar, per-step validation, and a success state. It posts JSON to `/api/inquiry`; the handler rate-limits by IP, checks the origin in production, validates fields, and screens a honeypot.

## Contact

- **Phone:** 0889 760 505 / 0886 788 815
- **Email:** triorbit.group@gmail.com
- **Lovech, Bulgaria** · Mon – Sat, 08:00 – 19:00

## License

Proprietary — © 2026 TriOrbit Group. All rights reserved.
