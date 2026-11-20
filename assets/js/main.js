// assets/js/main.js — site entry module (ES module).
import { loadApps } from "./data.js";
import { renderAppLauncher } from "./apps.js";

// MT-003: hero app launcher — list from data/apps.json.
// On load failure loadApps() resolves to [] and renderAppLauncher
// keeps the panel header but hides the list body.
// MT-004: when more rows than --rows-shown fit, the list auto-scrolls
// in a seamless loop (loop-scroll.js; never under
// prefers-reduced-motion: reduce).
loadApps().then((apps) => {
  renderAppLauncher(document.getElementById("apps"), apps);
});
