// assets/js/main.js — site entry module (ES module).
import { loadApps } from "./data.js";
import { renderAppLauncher } from "./apps.js";

// MT-003: hero app launcher — static list from data/apps.json.
// On load failure loadApps() resolves to [] and renderAppLauncher
// keeps the panel header but hides the list body.
loadApps().then((apps) => {
  renderAppLauncher(document.getElementById("apps"), apps);
});
