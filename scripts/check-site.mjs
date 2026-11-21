#!/usr/bin/env node
// Quick checks for the myobserver.io static site, run after each build task.
// Exits non-zero with a clear message when a check fails.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const failures = [];
let passed = 0;

function check(label, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok: ${label}`);
  } catch (err) {
    failures.push(`${label}: ${err.message}`);
    console.error(`  FAIL: ${label}: ${err.message}`);
  }
}

const read = (rel) => readFileSync(path.join(root, rel), "utf8");
const throwIf = (cond, msg) => {
  if (cond) throw new Error(msg);
};

// --- data/apps.json
check("data/apps.json: valid JSON, non-empty apps[], each app has name+url", () => {
  const data = JSON.parse(read("data/apps.json"));
  throwIf(!Array.isArray(data.apps) || data.apps.length === 0, 'missing or empty "apps" array');
  data.apps.forEach((app, i) => {
    throwIf(!app.name || !app.url, `apps[${i}] is missing name or url`);
  });
});

// --- data/plugins.json
check("data/plugins.json: valid JSON, non-empty plugins[], each plugin has name", () => {
  const data = JSON.parse(read("data/plugins.json"));
  throwIf(!Array.isArray(data.plugins) || data.plugins.length === 0, 'missing or empty "plugins" array');
  data.plugins.forEach((plugin, i) => {
    throwIf(!plugin.name, `plugins[${i}] is missing name`);
  });
});

// --- index.html
let html = null;
check("index.html exists", () => {
  if (!existsSync(path.join(root, "index.html"))) throw new Error("file not found");
  html = read("index.html");
});

check("index.html has the three favicon links", () => {
  throwIf(!html, "index.html not available");
  const links = [
    '<link rel="icon" href="/favicon.ico" sizes="any">',
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  ];
  for (const link of links) throwIf(!html.includes(link), `missing ${link}`);
});

check('index.html has <script type="module" src="assets/js/main.js">', () => {
  throwIf(
    !html || !html.includes('<script type="module" src="assets/js/main.js">'),
    'missing <script type="module" src="assets/js/main.js">',
  );
});

check("index.html has header, main and footer landmarks", () => {
  throwIf(!html, "index.html not available");
  for (const tag of ["<header", "<main", "<footer"]) {
    throwIf(!html.includes(tag), `missing <${tag.slice(1)}> landmark`);
  }
});

check('index.html has sections #top, #voice, #geo, #wordpress, #updates', () => {
  throwIf(!html, "index.html not available");
  for (const id of ["top", "voice", "geo", "wordpress", "updates"]) {
    throwIf(
      !new RegExp(`<section[^>]*id="${id}"`).test(html),
      `missing <section id="${id}">`,
    );
  }
});

check("index.html hero has the exact h1 copy", () => {
  throwIf(!html, "index.html not available");
  throwIf(
    !html.includes("<h1>Focused apps that each do one job well.</h1>"),
    "missing <h1>Focused apps that each do one job well.</h1>",
  );
});

check("index.html header nav links to #apps, #voice, #geo, #wordpress", () => {
  throwIf(!html, "index.html not available");
  const headerMatch = html.match(/<header[\s\S]*?<\/header>/);
  throwIf(!headerMatch, "missing <header> block");
  const header = headerMatch[0];
  for (const id of ["apps", "voice", "geo", "wordpress"]) {
    throwIf(!header.includes(`href="#${id}"`), `missing header nav link to #${id}`);
  }
});

check('index.html has <nav id="apps" aria-label="MyObserver apps"> placeholder', () => {
  throwIf(!html, "index.html not available");
  throwIf(
    !/<nav[^>]*id="apps"[^>]*aria-label="MyObserver apps"/.test(html),
    'missing <nav id="apps" aria-label="MyObserver apps">',
  );
});

check("every file referenced by index.html (css, js, favicons) exists", () => {
  throwIf(!html, "index.html not available");
  const refs = new Set();
  const attrRe = /(?:href|src)="([^"]+)"/g;
  let m;
  while ((m = attrRe.exec(html)) !== null) refs.add(m[1]);

  let checked = 0;
  for (const ref of refs) {
    if (/^(https?:)?\/\//.test(ref) || ref.startsWith("data:") || ref.startsWith("#")) continue;
    const filePath = path.normalize(path.join(root, ref));
    throwIf(filePath !== root && !filePath.startsWith(root + path.sep), `${ref} escapes the project root`);
    throwIf(!existsSync(filePath), `referenced file is missing: ${ref}`);
    checked++;
  }
  throwIf(checked === 0, "no local file references found (expected css/js/favicon links)");
});

// --- assets/js (MT-003: shared data loader and app launcher)
const exportedFn = (src, name) =>
  new RegExp(`export\\s+function\\s+${name}\\s*\\(`).test(src) ||
  new RegExp(`export\\s*\\{[^}]*\\b${name}\\b`).test(src);

check("assets/js/data.js exists and exports loadApps() and loadPlugins()", () => {
  const src = read("assets/js/data.js");
  for (const name of ["loadApps", "loadPlugins"]) {
    throwIf(!exportedFn(src, name), `missing export of ${name}()`);
  }
});

check("assets/js/apps.js exists and exports renderAppLauncher()", () => {
  const src = read("assets/js/apps.js");
  throwIf(!exportedFn(src, "renderAppLauncher"), "missing export of renderAppLauncher()");
});

check("assets/js/main.js loads apps and renders the launcher", () => {
  const src = read("assets/js/main.js");
  throwIf(!src.includes('from "./data.js"'), 'missing import from "./data.js"');
  throwIf(!src.includes('from "./apps.js"'), 'missing import from "./apps.js"');
  throwIf(!src.includes("loadApps("), "missing loadApps() call");
  throwIf(!src.includes("renderAppLauncher("), "missing renderAppLauncher() call");
});

// --- MT-004: looping auto-scroll for the app launcher
check("assets/js/loop-scroll.js exists and exports createLoopScroller()", () => {
  const src = read("assets/js/loop-scroll.js");
  throwIf(!exportedFn(src, "createLoopScroller"), "missing export of createLoopScroller()");
});

check("assets/js/apps.js applies the loop scroller to the app list", () => {
  const src = read("assets/js/apps.js");
  throwIf(!src.includes('from "./loop-scroll.js"'), 'missing import from "./loop-scroll.js"');
  throwIf(!src.includes("createLoopScroller("), "missing createLoopScroller() call");
});

check("assets/js/loop-scroll.js resumes after touchcancel and honors stop() in tick()", () => {
  const src = read("assets/js/loop-scroll.js");
  throwIf(!/addEventListener\("touchcancel"/.test(src), "missing addEventListener(\"touchcancel\")");
  throwIf(!/removeEventListener\("touchcancel"/.test(src), "missing removeEventListener(\"touchcancel\") in destroy()");
  throwIf(!src.includes("!desired"), "tick() does not check `desired`, so resize ticks run after stop()");
});

check("assets/css/site.css .app-list has the looping auto-scroll rules", () => {
  const css = read("assets/css/site.css");
  const rule = css.match(/\.app-list\s*\{[^}]*\}/);
  throwIf(!rule, "missing .app-list rule");
  const block = rule[0];
  const decls = [
    "max-height: calc(var(--rows-shown, 3) * 88px)",
    "overflow-y: auto",
    "scrollbar-width: none",
    "overscroll-behavior: contain",
  ];
  for (const decl of decls) throwIf(!block.includes(decl), `.app-list is missing "${decl}"`);
});

// --- MT-005: Voice AI section with call preview
check('index.html has <figure id="voice-preview" aria-label="Voice AI call preview">', () => {
  throwIf(!html, "index.html not available");
  throwIf(
    !/<figure[^>]*id="voice-preview"[^>]*aria-label="Voice AI call preview"/.test(html),
    'missing <figure id="voice-preview" aria-label="Voice AI call preview">',
  );
});

check('index.html voice meter container is <div class="meter" aria-hidden="true">', () => {
  throwIf(!html, "index.html not available");
  throwIf(
    !/<div[^>]*class="meter"[^>]*aria-hidden="true"/.test(html),
    'missing <div class="meter" aria-hidden="true">',
  );
});

check("index.html voice section has the exact h2 copy", () => {
  throwIf(!html, "index.html not available");
  throwIf(
    !html.includes("<h2>An AI agent that answers the phone and books the appointment.</h2>"),
    "missing voice section <h2>An AI agent that answers the phone and books the appointment.</h2>",
  );
});

check("index.html voice section has trial link to https://scripts.myobserver.io", () => {
  throwIf(!html, "index.html not available");
  throwIf(
    !/<a[^>]*href="https:\/\/scripts\.myobserver\.io"[^>]*>Start free trial<\/a>/.test(html),
    'missing <a href="https://scripts.myobserver.io">Start free trial</a>',
  );
});

check("assets/js/voice.js exists and exports buildMeter()", () => {
  const src = read("assets/js/voice.js");
  throwIf(!exportedFn(src, "buildMeter"), "missing export of buildMeter()");
});

check("assets/js/main.js builds the voice meter", () => {
  const src = read("assets/js/main.js");
  throwIf(!src.includes('from "./voice.js"'), 'missing import from "./voice.js"');
  throwIf(!src.includes("buildMeter("), "missing buildMeter() call");
});

// --- MT-006: Geo-Locator section with map preview
check('index.html has <figure id="geo-preview" aria-label="Geo-Locator map preview">', () => {
  throwIf(!html, "index.html not available");
  throwIf(
    !/<figure[^>]*id="geo-preview"[^>]*aria-label="Geo-Locator map preview"/.test(html),
    'missing <figure id="geo-preview" aria-label="Geo-Locator map preview">',
  );
});

check('index.html geo map canvas is <div class="map" aria-hidden="true">', () => {
  throwIf(!html, "index.html not available");
  throwIf(
    !/<div[^>]*class="map"[^>]*aria-hidden="true"/.test(html),
    'missing <div class="map" aria-hidden="true">',
  );
});

check("index.html geo map has three .cluster elements, each with a child .dot and .ring, and --delay 0s/0.3s/0.6s", () => {
  throwIf(!html, "index.html not available");
  const clusterBlocks = html.match(/<div class="cluster"[^>]*>[\s\S]*?<\/div>/g) || [];
  throwIf(clusterBlocks.length !== 3, `expected 3 .cluster elements, found ${clusterBlocks.length}`);
  const expectedDelays = ["--delay: 0s", "--delay: 0.3s", "--delay: 0.6s"];
  clusterBlocks.forEach((block, i) => {
    throwIf(!block.includes('class="dot"'), `cluster[${i}] is missing a child <span class="dot">`);
    throwIf(!block.includes('class="ring"'), `cluster[${i}] is missing a child <span class="ring">`);
    throwIf(!block.includes(expectedDelays[i]), `cluster[${i}] is missing ${expectedDelays[i]}`);
  });
});

check('index.html geo pin is <svg class="pin" width="30" height="40" viewBox="0 0 24 32">', () => {
  throwIf(!html, "index.html not available");
  throwIf(
    !/<svg[^>]*class="pin"[^>]*width="30"[^>]*height="40"[^>]*viewBox="0 0 24 32"/.test(html),
    'missing <svg class="pin" width="30" height="40" viewBox="0 0 24 32">',
  );
});

check("index.html has <div class=\"pin-shadow\"> and site.css .pin-shadow is absolutely positioned at 263px/192px", () => {
  throwIf(!html, "index.html not available");
  throwIf(!/<div class="pin-shadow"><\/div>/.test(html), "missing <div class=\"pin-shadow\">");
  const css = read("assets/css/site.css");
  const rule = css.match(/\.pin-shadow\s*\{[^}]*\}/);
  throwIf(!rule, "missing .pin-shadow rule");
  for (const decl of ["position: absolute", "left: 263px", "top: 192px"]) {
    throwIf(!rule[0].includes(decl), `.pin-shadow is missing "${decl}"`);
  }
});

check("index.html geo section has the exact h2 copy", () => {
  throwIf(!html, "index.html not available");
  throwIf(
    !html.includes("<h2>Put every location you manage on one map.</h2>"),
    "missing geo section <h2>Put every location you manage on one map.</h2>",
  );
});

check("index.html geo section links to https://app.geo.myobserver.io", () => {
  throwIf(!html, "index.html not available");
  throwIf(
    !/<a[^>]*href="https:\/\/app\.geo\.myobserver\.io"[^>]*>Open Geo-Locator<\/a>/.test(html),
    'missing <a href="https://app.geo.myobserver.io">Open Geo-Locator</a>',
  );
});

check("assets/css/site.css .geo__inner is flex-wrap: wrap-reverse with map first, text after in HTML", () => {
  throwIf(!html, "index.html not available");
  const css = read("assets/css/site.css");
  const rule = css.match(/\.geo__inner\s*\{[^}]*\}/);
  throwIf(!rule, "missing .geo__inner rule");
  const decls = ["display: flex", "flex-wrap: wrap-reverse", "align-items: center", "gap: 64px", "padding-block: 112px"];
  for (const decl of decls) throwIf(!rule[0].includes(decl), `.geo__inner is missing "${decl}"`);
  const fig = html.indexOf('id="geo-preview"');
  const copy = html.indexOf("geo__copy");
  throwIf(fig === -1 || copy === -1 || fig > copy, "map preview must come before the text column in the DOM");
});

check("assets/css/site.css .pin has transform-origin: 50% 100%", () => {
  const css = read("assets/css/site.css");
  const rule = css.match(/\.pin\s*\{[^}]*\}/);
  throwIf(!rule, "missing .pin rule");
  throwIf(!rule[0].includes("transform-origin: 50% 100%"), '.pin is missing "transform-origin: 50% 100%"');
});

// --- MT-007: scroll-triggered animations for voice and geo previews
check("assets/js/animations.js exists and exports initPreviewAnimations()", () => {
  const src = read("assets/js/animations.js");
  throwIf(!exportedFn(src, "initPreviewAnimations"), "missing export of initPreviewAnimations()");
  throwIf(!src.includes("IntersectionObserver"), "missing IntersectionObserver usage");
  throwIf(!/\bthreshold:\s*0\.35\b/.test(src), "missing IntersectionObserver threshold 0.35");
  throwIf(!/offsetWidth/.test(src), "missing forced reflow (void el.offsetWidth) for a clean restart");
  throwIf(!/prefers-reduced-motion: reduce/.test(src), "missing prefers-reduced-motion: reduce guard");
});

check("assets/js/main.js calls initPreviewAnimations() after building the meter", () => {
  const src = read("assets/js/main.js");
  throwIf(!src.includes('from "./animations.js"'), 'missing import from "./animations.js"');
  throwIf(!src.includes("initPreviewAnimations("), "missing initPreviewAnimations() call");
  throwIf(
    src.indexOf("buildMeter(") === -1 ||
      src.indexOf("initPreviewAnimations(") === -1 ||
      src.indexOf("initPreviewAnimations(") < src.indexOf("buildMeter("),
    "initPreviewAnimations() must be called after buildMeter()",
  );
});

check("assets/css/site.css contains the mo-eq, mo-bounce, mo-ring and mo-blink keyframes plus a prefers-reduced-motion block", () => {
  const css = read("assets/css/site.css");
  for (const name of ["mo-eq", "mo-bounce", "mo-ring", "mo-blink"]) {
    throwIf(!new RegExp(`@keyframes\\s+${name}\\s*\\{`).test(css), `missing @keyframes ${name}`);
  }
  throwIf(
    !/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?animation:\s*none/.test(css),
    "missing @media (prefers-reduced-motion: reduce) block disabling the animations",
  );
});

check("assets/css/site.css animation rules are finite (no infinite iteration count)", () => {
  const css = read("assets/css/site.css");
  throwIf(/animation:.*infinite/.test(css), "found an infinite animation iteration count");
  for (const rule of [
    "#voice-preview.is-playing .bar",
    "#geo-preview.is-playing .pin",
    "#geo-preview.is-playing .pin-shadow",
    "#geo-preview.is-playing .cluster .ring",
    "#geo-preview.is-playing .cluster .dot",
  ]) {
    const escaped = rule.replace(/[.#]/g, "\\$&");
    const match = css.match(new RegExp(`${escaped}\\s*\\{[^}]*\\}`));
    throwIf(!match, `missing animation rule for ${rule}`);
    throwIf(
      !/animation:/.test(match[0]),
      `rule for ${rule} has no animation declaration`,
    );
  }
});

// --- MT-008: WordPress section with plugin cards from data/plugins.json
check('index.html has #plugin-row with role=region, aria-label="WordPress plugins" and tabindex="0"', () => {
  throwIf(!html, "index.html not available");
  throwIf(
    !/<div[^>]*id="plugin-row"[^>]*class="plugin-row"[^>]*role="region"[^>]*aria-label="WordPress plugins"[^>]*tabindex="0"/.test(html),
    "missing <div id=\"plugin-row\" class=\"plugin-row\" role=\"region\" aria-label=\"WordPress plugins\" tabindex=\"0\">",
  );
});

check("index.html wordpress section has the exact eyebrow and h2 copy", () => {
  throwIf(!html, "index.html not available");
  const section = (html.match(/<section[^>]*id="wordpress"[\s\S]*?<\/section>/) || [""])[0];
  throwIf(!section, "missing <section id=\"wordpress\"> block");
  throwIf(!section.includes("For WordPress"), "missing \"For WordPress\" eyebrow");
  throwIf(
    !section.includes("<h2>Free plugins on WordPress.org.</h2>"),
    "missing wordpress section <h2>Free plugins on WordPress.org.</h2>",
  );
});

check("assets/js/plugins.js exists and exports renderPlugins()", () => {
  const src = read("assets/js/plugins.js");
  throwIf(!exportedFn(src, "renderPlugins"), "missing export of renderPlugins()");
  throwIf(!src.includes("createElement"), "renderPlugins must build cards with createElement");
});

check("assets/js/main.js loads plugins and renders the row", () => {
  const src = read("assets/js/main.js");
  throwIf(!src.includes('from "./plugins.js"'), 'missing import from "./plugins.js"');
  throwIf(!src.includes("loadPlugins("), "missing loadPlugins() call");
  throwIf(!src.includes("renderPlugins("), "missing renderPlugins() call");
  throwIf(
    !src.includes('getElementById("plugin-row")'),
    'missing render target getElementById("plugin-row")',
  );
});

check("assets/css/site.css .plugin-row is a horizontally scrollable row and cards are fixed-width 340px (85% under 420px)", () => {
  const css = read("assets/css/site.css");
  const rule = css.match(/\.plugin-row\s*\{[^}]*\}/);
  throwIf(!rule, "missing .plugin-row rule");
  for (const decl of [
    "display: flex",
    "gap: 20px",
    "overflow-x: auto",
    "scrollbar-width: none",
    "overscroll-behavior-x: contain",
  ]) {
    throwIf(!rule[0].includes(decl), `.plugin-row is missing "${decl}"`);
  }
  const hiddenRow = css.match(/\.plugin-row\[hidden\]\s*\{[^}]*\}/);
  throwIf(!hiddenRow, "missing .plugin-row[hidden] rule");
  throwIf(
    !/display:\s*none/.test(hiddenRow[0]),
    '.plugin-row[hidden] must declare "display: none" so a load-failure row is truly hidden',
  );
  const card = css.match(/\.plugin-card\s*\{[^}]*\}/);
  throwIf(!card, "missing .plugin-card rule");
  throwIf(!card[0].includes("flex: 0 0 340px"), '.plugin-card is missing "flex: 0 0 340px"');
  throwIf(
    !/@media\s*\(max-width:\s*419px\)\s*\{[\s\S]*?flex-basis:\s*85%/.test(css),
    "missing @media (max-width: 419px) card flex-basis: 85%",
  );
});

// --- MT-009: sideways looping scroll for the WordPress plugin row
check("assets/js/main.js applies createLoopScroller with axis \"x\" to #plugin-row", () => {
  const src = read("assets/js/main.js");
  throwIf(!src.includes('from "./loop-scroll.js"'), 'missing import from "./loop-scroll.js"');
  throwIf(!src.includes("createLoopScroller("), "missing createLoopScroller() call");
  throwIf(
    !/createLoopScroller\(\s*row\s*,\s*\{[^}]*axis:\s*"x"[^}]*gap:\s*20[^}]*\}\s*\)/.test(src),
    'missing createLoopScroller(row, { axis: "x", gap: 20 }) call',
  );
  throwIf(!src.includes('getElementById("plugin-row")'), 'missing render target getElementById("plugin-row")');
  throwIf(!/renderPlugins\(\s*row\s*,/.test(src), "renderPlugins() must run before the loop is created");
});

// --- summary
console.log(`check-site: ${passed} passed, ${failures.length} failed`);
if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
