// assets/js/apps.js — hero app launcher (docs/design/02-app-launcher.md).
// Renders the static panel (header + one row per app) from a loaded app
// list. No auto-scroll yet (separate task). All DOM built with
// createElement/textContent — no innerHTML with data values.

const SVG_NS = "http://www.w3.org/2000/svg";

// 24×24 stroke icon sets for the dark 48×48 icon tile (per spec).
const TILE_ICONS = {
  phone: {
    stroke: "var(--mint)",
    parts: [
      {
        tag: "path",
        d: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
      },
    ],
  },
  pin: {
    stroke: "var(--sky)",
    parts: [
      { tag: "path", d: "M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" },
      { tag: "circle", attrs: { cx: "12", cy: "10", r: "2.5" } },
    ],
  },
  plug: {
    stroke: "var(--amber)",
    parts: [{ tag: "path", d: "M12 2v6M8 4v4M16 4v4M6 8h12v4a6 6 0 0 1-12 0zM12 18v4" }],
  },
  generic: {
    stroke: "#C9D5FF",
    parts: [
      { tag: "rect", attrs: { x: "3", y: "3", width: "7", height: "7", rx: "1.5" } },
      { tag: "rect", attrs: { x: "14", y: "3", width: "7", height: "7", rx: "1.5" } },
      { tag: "rect", attrs: { x: "3", y: "14", width: "7", height: "7", rx: "1.5" } },
      { tag: "rect", attrs: { x: "14", y: "14", width: "7", height: "7", rx: "1.5" } },
    ],
  },
};

// "+" for the dashed "more" box (no dark tile).
const MORE_ICON = {
  stroke: "var(--muted-2)",
  parts: [{ tag: "path", d: "M12 5v14M5 12h14" }],
};

const CHEVRON = {
  stroke: "var(--muted-2)",
  parts: [{ tag: "path", d: "m9 6 6 6-6 6" }],
};

function makeEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Build a decorative inline SVG icon from a { stroke, parts } definition.
function makeIcon(def, size = 24) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  // Inline style, not a presentation attribute: var() tokens are only
  // valid in CSS, so a stroke="var(--x)" attribute would be ignored.
  svg.style.stroke = def.stroke;
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  for (const part of def.parts) {
    const node = document.createElementNS(SVG_NS, part.tag);
    if (part.d) node.setAttribute("d", part.d);
    for (const [key, value] of Object.entries(part.attrs || {})) {
      node.setAttribute(key, String(value));
    }
    svg.appendChild(node);
  }
  return svg;
}

function createAppRow(app) {
  const isMore = app.icon === "more";

  const row = makeEl("a", isMore ? "app-row app-row--more" : "app-row");
  row.href = app.url;

  const iconBox = makeEl(
    "span",
    isMore ? "app-row__icon app-row__icon--more" : "app-row__icon",
  );
  iconBox.appendChild(makeIcon(isMore ? MORE_ICON : (TILE_ICONS[app.icon] || TILE_ICONS.generic)));
  row.appendChild(iconBox);

  const text = makeEl("span", "app-row__text");
  text.appendChild(makeEl("span", "app-row__name", app.name));
  if (app.description) {
    text.appendChild(makeEl("span", "app-row__desc", app.description));
  }
  row.appendChild(text);

  if (!isMore && app.status) {
    row.appendChild(
      makeEl(
        "span",
        `app-row__chip ${app.live ? "app-row__chip--live" : "app-row__chip--soon"}`,
        app.status,
      ),
    );
  }

  if (!isMore) {
    const chevron = makeIcon(CHEVRON, 18);
    chevron.classList.add("app-row__chevron");
    row.appendChild(chevron);
  }

  return row;
}

/**
 * Render the app launcher panel into a nav element: a header row plus
 * one <a> row per app (file order). If `apps` is empty (load failure),
 * the list body is hidden and only the header stays.
 * @param {HTMLElement} navEl the <nav id="apps"> element.
 * @param {Array} apps validated app entries from loadApps().
 */
export function renderAppLauncher(navEl, apps) {
  if (!navEl) return;

  const header = makeEl("div", "app-launcher__header");
  header.appendChild(makeEl("span", "app-launcher__title", "Apps"));
  header.appendChild(makeEl("span", "app-launcher__domain", "*.myobserver.io"));

  const list = makeEl("div", "app-list");
  for (const app of Array.isArray(apps) ? apps : []) {
    list.appendChild(createAppRow(app));
  }
  if (list.children.length === 0) list.hidden = true;

  // replaceChildren (not appendChild) so a re-render replaces the panel
  // content instead of duplicating header/list.
  navEl.replaceChildren(header, list);
}
