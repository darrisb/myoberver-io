// assets/js/main.js — site entry module (ES module).
import { loadApps, loadPlugins } from "./data.js";
import { renderAppLauncher } from "./apps.js";
import { buildMeter } from "./voice.js";
import { initPreviewAnimations } from "./animations.js";
import { renderPlugins } from "./plugins.js";
import { createLoopScroller } from "./loop-scroll.js";

// MT-003: hero app launcher — list from data/apps.json.
// On load failure loadApps() resolves to [] and renderAppLauncher
// keeps the panel header but hides the list body.
// MT-004: when more rows than --rows-shown fit, the list auto-scrolls
// in a seamless loop (loop-scroll.js; never under
// prefers-reduced-motion: reduce).
loadApps().then((apps) => {
  renderAppLauncher(document.getElementById("apps"), apps);
});

// MT-005: Voice AI call preview — build the 40 meter bars
// (--d / --delay feed the scroll-triggered animation below).
buildMeter(document.querySelector("#voice-preview .meter"));

// MT-007: scroll-triggered animations for the voice and geo previews
// (IntersectionObserver, finite keyframes, never under
// prefers-reduced-motion: reduce).
initPreviewAnimations();

// MT-008: WordPress plugin cards — row from data/plugins.json.
// On load failure loadPlugins() resolves to [] and renderPlugins
// hides the row.
// MT-009: sideways looping auto-scroll for the row (1px every 40ms,
// gap 20px). No-op while all cards fit or the row is hidden; pauses on
// hover/focus/touch; never runs under prefers-reduced-motion: reduce.
loadPlugins().then((plugins) => {
  const row = document.getElementById("plugin-row");
  renderPlugins(row, plugins);
  if (row.hidden) return;
  if (row.__pluginLoop) row.__pluginLoop.destroy();
  row.__pluginLoop = createLoopScroller(row, { axis: "x", gap: 20 });
  row.__pluginLoop.start();
});
