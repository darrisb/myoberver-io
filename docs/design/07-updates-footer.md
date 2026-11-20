# Launch-updates box and footer

## Updates (`<section id="updates">`)
Container, padding 112px 24px. Inner box: white, 1px --border, radius 20px, padding 56px 48px (24px on phones), flex wrap, space-between, align center, gap 32px.
- Left (flex 1 1 420px): h2 **Hear when a new app opens.** (`clamp(28px, 3.2vw, 40px)`) and p (17px --muted) *One email per launch. Nothing else.*
- Right `<form id="updates-form">` (flex 1 1 380px, flex wrap, gap 10px): visually hidden `<label for="updates-email">Email address</label>`, `<input id="updates-email" type="email" required placeholder="you@company.com">` (min-height 52px, 1px #C5CEDA, radius 10px), `<button type="submit">Notify me</button>` (ink background, white, min-height 52px, radius 10px).
- No email backend yet: on submit, `preventDefault()`, validate the address with the input's built-in validity, and show an inline message in an `aria-live="polite"` element: "Thanks — we'll email you at launch." Leave a `// TODO: send to email service (e.g. Resend)` comment where the request will go. Do not send anything anywhere.

## Footer (`<footer>`, top border --border)
Container, padding 48px 24px 56px, flex wrap, space-between, gap 32px, 14px --muted.
1. Brand column (flex 1 1 260px): 24px logo + "MyObserver" (Space Grotesk 700 16px ink), then "© 2026 MyObserver" (year from `new Date().getFullYear()`).
2. `<nav aria-label="Apps">`: label "APPS" (mono 12px uppercase --muted-2), then one link per app from `loadApps()` **excluding** `icon: "more"` — so new apps added to `data/apps.json` appear here automatically.
3. `<nav aria-label="Company">`: label "COMPANY", links GitHub → `https://github.com/darrisb`, Privacy → `#privacy`, Terms → `#terms`, Contact → `mailto:hello@myobserver.io` (placeholder address, mark with an HTML comment `<!-- TODO: real contact email -->`).
