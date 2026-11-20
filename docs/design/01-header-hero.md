# Header and hero

## Header (`<header>` with bottom border --border)
Inner `<nav aria-label="Main">`: container, padding 18px 24px, flex, space-between, wraps on small screens.
- Left: logo SVG + "MyObserver" wordmark, links to `#top`.
- Right links (15px, weight 500, color --text-2, no underline): Apps → `#apps`, Voice AI → `#voice`, Geo-Locator → `#geo`, WordPress → `#wordpress`.
- Right button "Open an app" → `#apps` (primary style, min-height 44px, padding 0 18px, radius 8px).

## Hero (`<section id="top">`)
Two columns (text left, app launcher right; launcher is built in a later task, leave an empty `<nav id="apps" aria-label="MyObserver apps">` placeholder in the right column).

Left column, gap 24px:
1. Eyebrow: `myobserver.io` (color --amber-text)
2. `<h1>`: **Focused apps that each do one job well.** — size `clamp(40px, 5.2vw, 64px)`, line-height 1.04
3. Paragraph (19px, --muted, max-width 32em): *MyObserver builds hosted tools for businesses: AI agents that answer and make your calls, interactive maps of your locations, and more on the way. Pick an app and get to work.*
4. Buttons: primary "Browse the apps" (with right-arrow icon) → `#apps`; secondary "Get launch updates" → `#updates`.
