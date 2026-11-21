// assets/js/updates.js — launch-updates form and footer
// (docs/design/07-updates-footer.md).
// The form is validated with the input's built-in email validity and
// shows an inline aria-live confirmation; it sends nothing yet.
// The footer shows the current year and one Apps link per app from
// loadApps(), excluding the "more" launcher entry.

function makeEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Wire up the launch-updates form: preventDefault on submit, validate
 * the address with the input's built-in validity, and show a message
 * in the aria-live element. Sends nothing anywhere.
 * @param {HTMLFormElement} formEl the <form id="updates-form"> element.
 */
export function initUpdatesForm(formEl) {
  if (!formEl) return;

  const email = formEl.querySelector("#updates-email");
  const message = formEl.querySelector("#updates-message");

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();

    // TODO: send to email service (e.g. Resend)

    if (!email || !email.checkValidity()) {
      if (message) message.textContent = "Please enter a valid email address.";
      return;
    }
    if (message) message.textContent = "Thanks — we'll email you at launch.";
  });
}

/**
 * Set the footer copyright year from the current date.
 * @param {HTMLElement} yearEl the <span id="footer-year"> element.
 */
export function setFooterYear(yearEl) {
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

/**
 * Render one footer link per app (file order) into the footer Apps
 * nav, excluding the "more" launcher entry, so new apps added to
 * data/apps.json appear here automatically. If no links are rendered
 * (load failure), the nav is hidden.
 * @param {HTMLElement} navEl the footer <nav aria-label="Apps"> element.
 * @param {Array} apps validated app entries from loadApps().
 */
export function renderFooterApps(navEl, apps) {
  if (!navEl) return;
  const list = navEl.querySelector("ul");
  if (!list) return;

  list.replaceChildren();
  for (const app of Array.isArray(apps) ? apps : []) {
    if (!app || app.icon === "more") continue;
    const link = makeEl("a", null, app.name);
    link.href = app.url;
    const item = document.createElement("li");
    item.appendChild(link);
    list.appendChild(item);
  }

  if (list.children.length === 0) navEl.hidden = true;
}
