# Geo-Locator section (`<section id="geo">`)

Container, padding 112px 24px, two columns with the **map preview on the left** and text on the right (`flex-wrap: wrap-reverse` so text comes first on phones), gap 64px, align center.

## Map preview (`<figure id="geo-preview" aria-label="Geo-Locator map preview">`)
White, 1px --border, radius 18px, overflow hidden, panel shadow.
1. Toolbar (padding 14px 18px, bottom border --border-soft, flex wrap, gap 8px): fake search box (flex 1 1 180px, min-height 40px, 1px --border, radius 8px, magnifier icon + "Search locations" in --muted-2 14px); chips "All types" (ink bg, white), "Available", "Region" (--row-divider bg, --text-2), all 13px, padding 6px 12px, radius 999px.
2. Map canvas (`<div class="map" aria-hidden="true">`): `position: relative; height: 400px; background: #E9EEF2; overflow: hidden`. All children absolutely positioned (desktop coordinates; it is fine if things clip on phones):
   - water: right -60px, top -40px, 320×260, radius 50%, #CFE0EE
   - roads (white): full-width at top 140px (10px tall) and top 290px (6px); full-height at left 180px (10px wide) and left 400px (6px)
   - highway: left -40px, top 220px, 700×8, #F7D9A0, `rotate(-14deg)`
   - three cluster markers (`.cluster`): halo circle rgba(31,75,255,0.18) with a centered solid --accent dot showing a white mono count:
     - left 70px top 60px, halo 56, dot 40, "24", font 14px
     - left 300px top 300px, halo 48, dot 34, "9", font 13px
     - left 470px top 90px, halo 44, dot 30, "5", font 12px
     Each cluster also contains an empty `<span class="ring">` (absolute, inset 0, radius 50%, 2px solid --accent border, opacity 0) for the blink animation. Give clusters `--delay` 0s, 0.3s, 0.6s.
   - pin shadow (`.pin-shadow`): left 263px top 192px, 20×6, radius 50%, rgba(14,23,38,0.45)
   - pin (`<svg class="pin" width="30" height="40" viewBox="0 0 24 32">` at left 258px top 156px, `transform-origin: 50% 100%`): `<path d="M12 31s10-9.5 10-18A10 10 0 0 0 2 13c0 8.5 10 18 10 18z" fill="#E2712A"/><circle cx="12" cy="13" r="4" fill="#fff"/>`
   - popup card: left 296px top 110px, width 220px, padding 14px, radius 12px, white, shadow `0 12px 28px -8px rgba(14,23,38,0.3)`: "Route 29 North" (Space Grotesk 600 15px), "Digital billboard · 14 × 48 ft" (13px --muted), chip "AVAILABLE" (live chip colors, mono 12px, radius 5px).

## Text column (gap 16px)
- Eyebrow (color --chip-soon-text): `Geo-Locator · app.geo.myobserver.io`
- h2: **Put every location you manage on one map.**
- p: *Billboards, stores, job sites, listings: any kind of location. Customers search and filter it; your team keeps it current from the field.*
- Checklist (check icons in --accent):
  - **Clusters, search and filters.** Thousands of pins stay readable at any zoom.
  - **Popup cards.** Show the details that matter for each location.
  - **Teams with field contributors.** Let people on the ground add and update locations.
- Primary button "Open Geo-Locator" → `https://app.geo.myobserver.io`
