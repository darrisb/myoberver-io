# Scroll-triggered animations

Put all keyframes and animation rules in `assets/css/site.css`; trigger logic in `assets/js/animations.js`.

## Trigger
- `IntersectionObserver` with `threshold: 0.35` watching `#voice-preview` and `#geo-preview`.
- On entering view: add class `is-playing`. On leaving view: remove it (so it replays next time it scrolls in).
- To restart cleanly when re-adding: remove the class, force reflow (`void el.offsetWidth`), add it.
- Each animation runs a few times and then stops (finite iteration counts — nothing loops forever).
- If `IntersectionObserver` is missing, add `is-playing` once on load.
- Under `prefers-reduced-motion: reduce`: do nothing (no class, no animation).

## Voice meter: bars jump and change color, then stop
```css
@keyframes mo-eq{0%{transform:scaleY(1);background:#8EE0B4}20%{transform:scaleY(.35);background:#F6B94F}45%{transform:scaleY(1.3);background:#7FB3FF}70%{transform:scaleY(.55);background:#E2712A}100%{transform:scaleY(1);background:#8EE0B4}}
#voice-preview.is-playing .bar{animation:mo-eq var(--d,1s) ease-in-out var(--delay,0s) 3}
```

## Map: pin bounces a few times, cluster markers blink
```css
@keyframes mo-bounce{0%{transform:translateY(-60px)}30%{transform:translateY(0) scaleY(.85)}45%{transform:translateY(-26px) scaleY(1)}60%{transform:translateY(0) scaleY(.9)}72%{transform:translateY(-10px)}84%{transform:translateY(0) scaleY(.96)}92%{transform:translateY(-3px)}100%{transform:translateY(0)}}
@keyframes mo-shadow{0%{transform:scale(.4);opacity:.2}30%{transform:scale(1.1);opacity:.5}45%{transform:scale(.7);opacity:.3}60%{transform:scale(1.05);opacity:.5}72%{transform:scale(.85);opacity:.4}100%{transform:scale(1);opacity:.45}}
@keyframes mo-ring{0%{transform:scale(.8);opacity:.9}100%{transform:scale(1.6);opacity:0}}
@keyframes mo-blink{0%,100%{background:#1F4BFF}50%{background:#E2712A}}
#geo-preview.is-playing .pin{animation:mo-bounce 1.6s ease-in .2s 1 both}
#geo-preview.is-playing .pin-shadow{animation:mo-shadow 1.6s ease-in .2s 1 both}
#geo-preview.is-playing .cluster .ring{animation:mo-ring .9s ease-out var(--delay,0s) 4}
#geo-preview.is-playing .cluster .dot{animation:mo-blink .9s ease-in-out var(--delay,0s) 4}
@media (prefers-reduced-motion: reduce){#voice-preview .bar,#geo-preview .pin,#geo-preview .pin-shadow,#geo-preview .ring,#geo-preview .dot{animation:none!important}}
```
