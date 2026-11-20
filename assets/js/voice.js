// assets/js/voice.js — Voice AI call preview meter (docs/design/03-voice.md).
// Generates the 40 .bar spans of the #voice-preview waveform.
// No animation yet: each bar gets its final height from the spec plus the
// --d / --delay custom properties the later animation task will use.

const BAR_COUNT = 40;

/**
 * Fill `container` with 40 .bar spans.
 * Bar i gets height (18 + round(|sin(i*0.7) * cos(i*0.23)| * 82))%,
 * --d = (0.7 + ((i*37) % 9)/10)s and --delay = (((i*53) % 7)/20)s.
 * @param {HTMLElement} container the .meter element (aria-hidden)
 * @returns {HTMLElement} the filled container
 */
export function buildMeter(container) {
  container.textContent = "";
  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement("span");
    bar.className = "bar";
    const height =
      18 + Math.round(Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)) * 82);
    bar.style.height = `${height}%`;
    bar.style.setProperty("--d", `${(0.7 + ((i * 37) % 9) / 10).toFixed(2)}s`);
    bar.style.setProperty("--delay", `${(((i * 53) % 7) / 20).toFixed(2)}s`);
    container.appendChild(bar);
  }
  return container;
}
