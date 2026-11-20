// assets/js/plugins.js — WordPress plugin cards (docs/design/06-wordpress.md).
// Renders one fixed-width card per plugin into the #plugin-row.
// A plugin with a non-empty url is an <a> card ending in "View plugin →";
// an empty url is a plain <div> card without the link line.
// All DOM built with createElement/textContent — no innerHTML with data.

function makeEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createPluginCard(plugin) {
  const isLive = plugin.live === true;
  const card = makeEl(
    plugin.url ? "a" : "div",
    `plugin-card ${isLive ? "plugin-card--live" : "plugin-card--soon"}`,
  );
  if (plugin.url) card.href = plugin.url;

  card.appendChild(makeEl(
    "span",
    `plugin-card__chip ${isLive ? "plugin-card__chip--live" : "plugin-card__chip--soon"}`,
    plugin.status || (isLive ? "Available" : "Coming soon"),
  ));
  card.appendChild(makeEl("h3", "plugin-card__name", plugin.name));
  if (plugin.description) {
    card.appendChild(makeEl("p", "plugin-card__desc", plugin.description));
  }
  if (plugin.url) {
    card.appendChild(makeEl("span", "plugin-card__link", "View plugin →"));
  }

  return card;
}

/**
 * Render the WordPress plugin cards into the scrollable row.
 * Skips entries without a name; keeps file order. If no cards are
 * rendered (load failure), the row is hidden.
 * @param {HTMLElement} rowEl the <div id="plugin-row"> element.
 * @param {Array} plugins validated plugin entries from loadPlugins().
 */
export function renderPlugins(rowEl, plugins) {
  if (!rowEl) return;

  const list = Array.isArray(plugins) ? plugins : [];
  rowEl.replaceChildren();
  for (const plugin of list) {
    if (!plugin || typeof plugin.name !== "string" || plugin.name.trim() === "") continue;
    rowEl.appendChild(createPluginCard(plugin));
  }

  if (rowEl.children.length === 0) rowEl.hidden = true;
}
