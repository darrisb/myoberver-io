# WordPress section (`<section id="wordpress">`) — data from `data/plugins.json`

Full-width dark band: background --ink, text #F4F6F8. Container, padding 96px 24px, column gap 40px.

## Heading row (flex wrap, space-between, align flex-end, gap 24px)
- Left: eyebrow "For WordPress" (color --amber) above h2 **Free plugins on WordPress.org.** (`clamp(28px, 3.2vw, 40px)`).
- Right p (--dark-text): *Lightweight plugins that run on your own server. Install from Plugins › Add New in wp-admin.*

## Data
`data/plugins.json` = `{ "plugins": [ { name, description, url, status, live } ] }`.
- Skip entries without `name`. Keep file order.
- `live: true` → solid card (background --dark-panel, 1px solid --dark-border) with green chip (#1C4A33 bg, #BFF0D4 text).
- `live: false` → outlined card (transparent, 1px dashed #3A4A66) with blue chip (#1E2C4A bg, #C9D5FF text).
- `url` non-empty → card is an `<a href=url>` and ends with "View plugin →" (amber, 600, 15px). Empty `url` → card is a `<div>` with no link line.
- Load with the shared loader (`loadPlugins()`); on failure hide the row.

## Card
Fixed width: `flex: 0 0 340px` (on screens under 420px: `flex-basis: 85%`). Padding 24px, radius 14px, column, gap 10px: chip (status text, mono 12px), name (Space Grotesk 600 20px), description (15px --dark-text), link line pushed to the bottom (`margin-top: auto`).

## Row and sideways loop
- Row `<div id="plugin-row" class="plugin-row" role="region" aria-label="WordPress plugins" tabindex="0">`: `display:flex; gap:20px; overflow-x:auto; scrollbar-width:none; overscroll-behavior-x:contain; padding-bottom:4px`.
- If all cards fit, nothing moves.
- If they overflow: every 40ms scroll right 1px. When `scrollLeft` reaches the first card's width + 20px gap, move the first card to the end (`appendChild`) and subtract that amount from `scrollLeft` — a seamless left-to-right loop that never jumps back.
- Pause on pointer hover, while focus is inside (`focusin`/`focusout`), on `touchstart` (resume 3s after `touchend`); manual swiping/scrolling still works. No auto-scroll under `prefers-reduced-motion: reduce`; stop when the page is hidden.
- Reuse the same loop helper as the app launcher if one exists (e.g. `createLoopScroller(container, { axis: 'x' | 'y', gap })` in `assets/js/loop-scroll.js`).
