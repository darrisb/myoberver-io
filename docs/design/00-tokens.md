# Design tokens and global rules

Plain static site: `index.html`, `assets/css/site.css`, `assets/js/*.js`. No framework, no build step, no npm dependencies.

## Fonts (Google Fonts, one `<link>` in `<head>`)
- Headings: **Space Grotesk** 500/600/700, letter-spacing -0.02em (h1 -0.03em)
- Body: **Inter** 400/500/600, 16px, line-height 1.6
- Labels, versions, code-like text: **JetBrains Mono** 400/500

## Colors (define as CSS custom properties on `:root`)
| Token | Value | Use |
|---|---|---|
| --bg | #F4F6F8 | page background |
| --surface | #FFFFFF | cards, panels |
| --surface-alt | #FAFBFC | "more apps" row |
| --ink | #0E1726 | headings, dark bands, logo tile |
| --text-2 | #2B3648 | nav links, footer links |
| --muted | #3D4A5C | body copy on light |
| --muted-2 | #556274 | small labels |
| --border | #DCE2EA | section and card borders |
| --border-soft | #E6EAF0 | inner dividers |
| --row-divider | #EEF1F5 | launcher row dividers, light chips |
| --accent | #1F4BFF | primary buttons, links |
| --accent-hover | #142C9E | |
| --amber | #F6B94F | logo line, WordPress band accents |
| --amber-text | #8A4A00 | eyebrow labels on light |
| --mint | #8EE0B4 | Voice AI accents, meter bars |
| --sky | #7FB3FF | Geo-Locator icon |
| --orange | #E2712A | map pin, blink color |
| --green | #1E9E5A | check icons |
| --chip-live-bg / -text | #DDF3E6 / #11643A | "Available" chips |
| --chip-soon-bg / -text | #E6EBFF / #1E3399 | "Launching soon" chips |
| --dark-panel | #172235 | cards inside dark band |
| --dark-border | #2A3A55 | |
| --dark-text | #B8C2D1 | body copy on dark |

## Layout
- Content container: `max-width: 1200px; margin: 0 auto; padding-inline: 24px`.
- Section vertical padding: 96–112px (hero 88px top, 96px bottom).
- Two-column sections use `display:flex; flex-wrap:wrap; gap:56–64px`, children `flex: 1 1 420–520px; min-width: 0` so they stack on phones.
- Radii: buttons 10px, small buttons 8px, cards 14px, panels 18px, CTA box 20px, chips 999px.
- Panel shadow: `0 24px 48px -24px rgba(14,23,38,0.25)`.
- Section headings h2: `clamp(32px, 3.6vw, 44px)`, line-height 1.1, weight 700.
- Eyebrow label: JetBrains Mono 13px, uppercase, letter-spacing 0.08em.

## Buttons
- Primary: background --accent, white text, 600 weight, min-height 52px, padding 0 24px, radius 10px.
- Secondary: white background, 1px #C5CEDA border, ink text.
- Every interactive element at least 44px tall. Real `<a>`/`<button>`, never clickable divs.

## Logo (inline SVG, also in /favicon.svg)
```html
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="8" fill="#0E1726"/><path d="M6 16h5l2.5-6 5 12 2.5-6h5" stroke="#F6B94F" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
```
Wordmark "MyObserver" beside it: Space Grotesk 700, 20px.

## Icons
Inline stroke SVGs (24×24 viewBox, stroke-width 2, round caps). No emoji, no icon fonts.

## Motion
Every animation must be disabled under `@media (prefers-reduced-motion: reduce)` and auto-scrolling must not start when that media query matches.

## Accessibility
Text contrast at least 4.5:1. `aria-hidden="true"` on decorative SVGs. Visible focus outline (2px --accent, offset 2px) on links and buttons.
