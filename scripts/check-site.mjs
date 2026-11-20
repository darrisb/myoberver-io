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
  for (const id of ["apps", "voice", "geo", "wordpress"]) {
    throwIf(!html.includes(`href="#${id}"`), `missing header nav link to #${id}`);
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

// --- summary
console.log(`check-site: ${passed} passed, ${failures.length} failed`);
if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
