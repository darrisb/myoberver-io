// assets/js/loop-scroll.js — reusable looping auto-scroll.
//
// Scrolls a container by stepPx every intervalMs. When the first child
// has scrolled fully out of view it is moved to the end of the container
// and the scroll offset is corrected by its size plus gap, so the loop
// is seamless and never jumps. Does nothing while the content does not
// overflow (re-checked on every tick and on window resize).
//
// Pauses while the pointer is over the container, while an element inside
// it has focus (focusin/focusout), and after a touch (resumes 3s after
// touchend). Stops while the document is hidden, resumes when visible.
// Never runs when prefers-reduced-motion: reduce matches.

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const TOUCH_RESUME_MS = 3000;

/**
 * @param {HTMLElement} container the scrollable element.
 * @param {object} [options]
 * @param {"y"|"x"} [options.axis="y"] scroll axis.
 * @param {number} [options.gap=0] gap between children (used for the offset correction).
 * @param {number} [options.stepPx=1] pixels to scroll per tick.
 * @param {number} [options.intervalMs=40] milliseconds between ticks.
 * @returns {{ start: () => void, stop: () => void, destroy: () => void }}
 */
export function createLoopScroller(container, options = {}) {
  const { axis = "y", gap = 0, stepPx = 1, intervalMs = 40 } = options;

  if (!(container instanceof HTMLElement)) {
    throw new TypeError("createLoopScroller: container must be an HTMLElement");
  }
  if (axis !== "y" && axis !== "x") {
    throw new RangeError(`createLoopScroller: axis must be "y" or "x", got ${JSON.stringify(axis)}`);
  }

  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const scrollKey = axis === "y" ? "scrollTop" : "scrollLeft";
  const viewKey = axis === "y" ? "clientHeight" : "clientWidth";
  const contentKey = axis === "y" ? "scrollHeight" : "scrollWidth";
  const sizeKey = axis === "y" ? "offsetHeight" : "offsetWidth";

  let desired = false; // start() has been called and not undone
  let timer = null;
  let hoverPaused = false;
  let focusPaused = false;
  let touchPaused = false;
  let touchResumeTimer = null;

  const overflows = () => {
    const view = container[viewKey];
    // view === 0 means the container is not rendered (e.g. hidden list).
    return view > 0 && container[contentKey] > view + 1;
  };

  // The first child is fully out of view once the edge facing the scroll
  // direction has crossed the container's matching edge.
  const firstOutOfView = () => {
    const first = container.firstElementChild;
    if (!first) return false;
    const firstRect = first.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return axis === "y"
      ? firstRect.bottom <= containerRect.top + 0.5
      : firstRect.right <= containerRect.left + 0.5;
  };

  const tick = () => {
    if (
      document.hidden ||
      hoverPaused ||
      focusPaused ||
      touchPaused ||
      reducedMotion.matches
    ) {
      return;
    }
    if (!overflows()) return;

    container[scrollKey] += stepPx;

    const first = container.firstElementChild;
    if (!first || !firstOutOfView()) return;

    const size = first[sizeKey];
    container.appendChild(first);
    // Correct the offset by the moved child's size plus gap so the
    // visible content does not jump.
    container[scrollKey] = Math.max(0, container[scrollKey] - size - gap);
  };

  const syncTimer = () => {
    const shouldRun = desired && !reducedMotion.matches;
    if (shouldRun && timer === null) {
      timer = window.setInterval(tick, intervalMs);
    } else if (!shouldRun && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const start = () => {
    desired = true;
    syncTimer();
  };

  const stop = () => {
    desired = false;
    syncTimer();
  };

  const isInside = (target) =>
    target === container || container.contains(target);

  const onMouseEnter = () => {
    hoverPaused = true;
  };
  const onMouseLeave = () => {
    hoverPaused = false;
  };
  const onFocusIn = (event) => {
    if (isInside(event.target)) focusPaused = true;
  };
  const onFocusOut = (event) => {
    if (isInside(event.target)) focusPaused = false;
  };

  const clearTouchResume = () => {
    if (touchResumeTimer !== null) {
      window.clearTimeout(touchResumeTimer);
      touchResumeTimer = null;
    }
  };
  const onTouchStart = () => {
    clearTouchResume();
    // A real touch means the pointer is not hovering in the mouse sense;
    // do not let a synthesized mouseenter keep the list paused forever.
    hoverPaused = false;
    touchPaused = true;
  };
  const onTouchEnd = () => {
    clearTouchResume();
    touchResumeTimer = window.setTimeout(() => {
      touchResumeTimer = null;
      touchPaused = false;
    }, TOUCH_RESUME_MS);
  };
  const onReducedMotionChange = () => {
    syncTimer();
  };
  // Re-check overflow (and any pending wrap) when the viewport changes.
  const onResize = () => {
    tick();
  };

  container.addEventListener("mouseenter", onMouseEnter);
  container.addEventListener("mouseleave", onMouseLeave);
  container.addEventListener("focusin", onFocusIn);
  container.addEventListener("focusout", onFocusOut);
  container.addEventListener("touchstart", onTouchStart, { passive: true });
  container.addEventListener("touchend", onTouchEnd, { passive: true });
  reducedMotion.addEventListener("change", onReducedMotionChange);
  window.addEventListener("resize", onResize);

  const destroy = () => {
    stop();
    clearTouchResume();
    container.removeEventListener("mouseenter", onMouseEnter);
    container.removeEventListener("mouseleave", onMouseLeave);
    container.removeEventListener("focusin", onFocusIn);
    container.removeEventListener("focusout", onFocusOut);
    container.removeEventListener("touchstart", onTouchStart);
    container.removeEventListener("touchend", onTouchEnd);
    reducedMotion.removeEventListener("change", onReducedMotionChange);
    window.removeEventListener("resize", onResize);
  };

  return { start, stop, destroy };
}
