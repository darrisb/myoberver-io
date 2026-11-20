# myobserver.io

Main website for MyObserver: a gateway page that links to each MyObserver app (each on its own subdomain) plus a section for the free WordPress plugins.

Plain static site. No framework, no build step, no npm dependencies.

## Structure
```
index.html              the page
assets/css/site.css     all styles (design tokens as CSS variables)
assets/js/              small ES modules (data loading, looping lists, animations, form)
data/apps.json          the app list (hero launcher + footer links)
data/plugins.json       the WordPress plugin cards
favicon.* / *.png       favicons made from the logo
docs/design/            design spec, one file per section (00-tokens.md first)
scripts/check-site.mjs  quick checks run after each build task
scripts/serve.mjs       local preview server
```

## Preview locally
```
node scripts/serve.mjs
```
Then open http://localhost:8080. (Opening index.html directly from disk will not load the JSON files; use the server.)

## Adding or changing an app
Edit `data/apps.json`. Each app:
```json
{ "name": "Geo-Locator", "description": "Interactive maps of every location you manage",
  "url": "https://app.geo.myobserver.io", "status": "Launching soon", "live": false, "icon": "pin" }
```
- `icon`: `phone`, `pin`, `plug`, `more`, or any other word for a generic app icon.
- `live: true` = green chip, `false` = blue chip. Leave `status` empty for no chip.
- Keep the `"icon": "more"` entry ("More apps on the way") last.
- The footer's Apps links update from the same file.

## Adding or changing a WordPress plugin
Edit `data/plugins.json`. Each plugin:
```json
{ "name": "Runtime Error Monitor", "description": "…",
  "url": "https://wordpress.org/plugins/…", "status": "v3.0.3", "live": true }
```
Leave `url` empty for a plugin that isn't released yet. When there are more cards than fit, the row scrolls left to right on its own.

## Deploying
Copy everything except `docs/`, `scripts/`, `reviews/` and `build.*` files to the web root. Any static host or nginx `root` works.
