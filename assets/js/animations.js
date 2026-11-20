// assets/js/animations.js — scroll-triggered animations for the voice
// and geo previews (docs/design/05-animations.md).
//
// Watches #voice-preview and #geo-preview with an IntersectionObserver
// (threshold 0.35). On entering view the .is-playing class is added so
// the (finite) keyframes run; on leaving view it is removed so the
// animation replays the next time the preview scrolls in.
//
// If IntersectionObserver is missing, .is-playing is added once on load.
// Never does anything when prefers-reduced-motion: reduce matches.

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const PREVIEW_IDS = ["#voice-preview", "#geo-preview"];
const PLAYING_CLASS = "is-playing";

/**
 * Observe the voice and geo previews and toggle .is-playing as they
 * enter and leave the viewport.
 * @param {Document} [doc=document]
 */
export function initPreviewAnimations(doc = document) {
  // No class, no animation under reduced motion.
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

  const targets = PREVIEW_IDS.map((id) => doc.querySelector(id)).filter(Boolean);
  if (targets.length === 0) return;

  const play = (el) => {
    // Restart cleanly when re-adding: remove, force reflow, then add.
    el.classList.remove(PLAYING_CLASS);
    void el.offsetWidth;
    el.classList.add(PLAYING_CLASS);
  };

  if (typeof IntersectionObserver === "undefined") {
    // Fallback: play once on load.
    for (const el of targets) el.classList.add(PLAYING_CLASS);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          play(entry.target);
        } else {
          entry.target.classList.remove(PLAYING_CLASS);
        }
      }
    },
    { threshold: 0.35 },
  );

  for (const el of targets) observer.observe(el);
}
