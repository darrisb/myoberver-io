// assets/js/data.js — shared data loaders (ES module).
// Fetches each JSON file once (cached promise), validates the entries,
// and always resolves to an array (empty array on failure — never throws).

function isValidApp(app) {
  return (
    Boolean(app) &&
    typeof app.name === "string" &&
    app.name.trim() !== "" &&
    typeof app.url === "string" &&
    // Only allow http(s) and in-page # fragment links — never javascript: etc.
    /^(?:https?:\/\/|#)/.test(app.url.trim())
  );
}

function isValidPlugin(plugin) {
  return (
    Boolean(plugin) &&
    typeof plugin.name === "string" &&
    plugin.name.trim() !== ""
  );
}

async function loadJsonArray(url, key, isValid) {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const list = data && Array.isArray(data[key]) ? data[key] : [];
    return list.filter(isValid);
  } catch {
    return [];
  }
}

let appsPromise = null;

/**
 * Load the app list from data/apps.json (hero launcher + footer links).
 * Skips entries missing name or url; keeps file order.
 * @returns {Promise<Array>} resolved app entries, empty array on failure.
 */
export function loadApps() {
  if (!appsPromise) {
    appsPromise = loadJsonArray("data/apps.json", "apps", isValidApp);
  }
  return appsPromise;
}

let pluginsPromise = null;

/**
 * Load the WordPress plugin list from data/plugins.json.
 * Skips entries missing name; keeps file order.
 * @returns {Promise<Array>} resolved plugin entries, empty array on failure.
 */
export function loadPlugins() {
  if (!pluginsPromise) {
    pluginsPromise = loadJsonArray("data/plugins.json", "plugins", isValidPlugin);
  }
  return pluginsPromise;
}
