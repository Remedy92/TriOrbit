# TriOrbit Group

Marketing site for **TriOrbit Group** — a professional cleaning company operating across Bulgaria, based in Lovech. Post-construction cleaning, deep home cleaning, professional disinfection, and additional services (carpets, sofas, appliances).

Single-page bilingual site (Bulgarian primary, English toggle) with a multi-step inquiry form.

## Stack

Zero-build, zero-dependency static site:

- `index.html` — semantic markup, BG copy in-DOM, `data-bg` / `data-en` swap attributes
- `styles.css` — design tokens, layout, responsive rules
- `app.js` — language toggle, sticky nav, mobile menu, scroll reveals, the hero before/after wipe, the section index, and the multi-step inquiry form
- `api/inquiry.mjs` — serverless handler for the inquiry form (rate limiting, origin check, validation)
- `img/` — the photographic set (hero pair, four service bands, four protocol details, crew)

Onest and JetBrains Mono are loaded from Google Fonts. No bundler, no framework, no service worker.

## Run locally

```sh
python3 -m http.server 8811
```

Then open http://localhost:8811. `.claude/launch.json` starts the same server from the editor's preview pane.

## Design

**Paper, ink, and one brass signal.** The page sits on a warm off-white ground rather than pure white, with near-black inverted bands for the protocol, the surcharge ledger, the inquiry form, and the footer.

```
Paper:      #E8E7E3   page ground
Paper lo:   #E1E0DB   recessed band
Paper hi:   #EFEEEA   hover, map landmass
Ink:        #0C0C0C   headings, body at 72% alpha
Rule:       rgba(12,12,12,.20) / .11   hairlines
Void:       #0B0B0B   inverted sections
Chalk:      #E8E7E3   text on void
Brass:      #B8873F   signal only
```

Four rules carry the whole system:

1. **Zero radius.** No pills, no rounded cards. Every edge is square.
2. **Hairline structure.** A fixed five-line column grid runs the height of the page; sections, tables, and card grids snap to it. Dark bands carry their own light-on-dark copy of the same rails.
3. **One weight, size does the hierarchy.** Onest at 400 throughout, with tight negative tracking that increases with size (−0.022em at 25px, −0.045em at 124px).
4. **Mono for metadata.** JetBrains Mono in uppercase at 9.5–11px with 0.14–0.2em tracking for every index number, label, unit, and price. Prices and stats are set in mono at display scale.

Brass is deliberately rare: the orbit mark, the section index letters, tick marks, the active form step, the discount figures, and the wipe divider. It never fills a button.

Photography is graded as one campaign with `filter: saturate(.68) contrast(1.07)` on every image.

### The hero wipe

The hero is a full-viewport before/after comparison of the same room — construction dust on one side, finished and spotless on the other — split by a draggable divider. It auto-sweeps once on load to teach the affordance, then stops as soon as the visitor touches it. It is drag-, keyboard-, and range-input accessible, and honours `prefers-reduced-motion`.

## Bilingual content

Every translatable element carries both `data-bg` and `data-en` attributes; the BG copy lives in the HTML body so the page is SEO-friendly for the Bulgarian market by default. `app.js` swaps `textContent` on toggle and persists the choice in `localStorage`.

Adding a new translation: add the BG copy as the element's text, plus `data-bg="…"` and `data-en="…"`. Inputs/textareas use `data-bg-placeholder` / `data-en-placeholder`. Multi-line headings wrap each line in `<span class="line">` so the swap does not eat the line break.

**The swap sets `textContent`, so an element carrying `data-bg` must have no element children.** Where a button needs both a label and an icon, put the attributes on an inner `<span>`.

## Inquiry form

Three steps (service → site → contact) with a segmented progress bar, per-step gating, and a success state. It posts JSON to `/api/inquiry`; the handler rate-limits by IP, checks the origin in production, validates fields, and screens a honeypot.

## Contact

- **Phone:** 0889 760 505 / 0886 788 815
- **Email:** triorbit.group@gmail.com
- **Lovech, Bulgaria** · Mon – Sat, 08:00 – 19:00

## License

Proprietary — © 2026 TriOrbit Group. All rights reserved.
