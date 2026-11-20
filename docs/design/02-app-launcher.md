# App launcher (hero, right column) — data from `data/apps.json`

## Data
`data/apps.json` = `{ "apps": [ { name, description, url, status, live, icon } ] }`.
- `icon`: `phone` | `pin` | `plug` | `more` | anything else (generic 2×2 grid icon).
- `live: true` → green chip (--chip-live-*), else blue chip (--chip-soon-*). No chip when `status` is empty/missing.
- `icon: "more"` is the "More apps on the way" row (dashed icon box, --surface-alt background, no chip, no chevron).
- Skip entries missing `name` or `url`. Keep file order.
- Load with `fetch('data/apps.json')`. If loading fails, hide the list body and keep the panel header (no crash, no console errors besides the failed request).
- The same loaded list also feeds the footer "Apps" links (later task) — expose a small shared loader, e.g. `assets/js/data.js` exporting `loadApps()` and `loadPlugins()` that cache their promise.

## Panel markup
`<nav id="apps" aria-label="MyObserver apps">`: white, 1px --border, radius 18px, panel shadow, overflow hidden.
- Header row (padding 16px 22px, bottom border --border-soft): "Apps" (Space Grotesk 600 15px) left, `*.myobserver.io` (mono 12px, --muted-2) right.
- List container `<div class="app-list">`: column of rows.

## Row (`<a href=url>`, one per app)
Height 88px, padding 0 22px, flex, align center, gap 16px, bottom border --row-divider, ink text, no underline.
1. Icon tile 48×48, radius 12px, --ink background, centered 24px stroke icon:
   - phone (stroke --mint): `<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>`
   - pin (stroke --sky): `<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>`
   - plug (stroke --amber): `<path d="M12 2v6M8 4v4M16 4v4M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>`
   - generic (stroke #C9D5FF): four `rect` 7×7 rx 1.5 at (3,3) (14,3) (3,14) (14,14)
   - more: no dark tile; 48×48 box with 1.5px dashed #9AA6B6 border and a "+" icon in --muted-2
2. Text block (flex 1, min-width 0): name (Space Grotesk 600 18px), description (14px --muted).
3. Status chip (mono 12px, padding 3px 10px, radius 999px).
4. Chevron-right icon 18px (--muted-2), not on the "more" row.

## Looping auto-scroll (separate task)
- List container: `max-height: calc(var(--rows-shown, 3) * 88px); overflow-y: auto; scrollbar-width: none; overscroll-behavior: contain`. `--rows-shown` default 3.
- Only when content overflows: every 40ms scroll down 1px. When `scrollTop` reaches the first row's height, move the first row element to the end of the list (`appendChild`) and subtract that height from `scrollTop`, so the loop is seamless and never jumps.
- Pause while the pointer is over the list, while any element inside has focus (`focusin`/`focusout`), and on `touchstart` (resume 3s after `touchend`). Users can still scroll manually.
- Do not start at all when `prefers-reduced-motion: reduce` matches. Stop the timer when the page is hidden (`visibilitychange`).
