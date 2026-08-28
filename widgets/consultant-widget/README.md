# Consultant Widget (Duda)

Team / consultant cards widget for Duda. Four layouts:

1. **Slider** (`layout_1` + Show slides) — Splide carousel
2. **Slide-out** (`layout_2`) — accordion "Read Bio"
3. **Flip Card** (`layout_3`) — front flips to reveal detail
4. **Popup** (`layout_4`) — card + modal

## Files

| File | Duda tab | Notes |
|------|----------|-------|
| `widget.js` | Widget Builder → JavaScript | Templates + render + Splide setup |
| `widget.css` | Widget Builder → CSS | All layout/card styling |
| `widget.html` | Widget Builder → HTML | Container div + `{{ColumnGap}}` / `{{RowGap}}` / `{{WidgetFontSize}}` tokens |
| `DUDA-CONFIG-CHANGES.md` | — | Config-panel fields to add (columns 5–8, per-page to 8, arrows-on-card toggle) |
| `harness/index.html` | — | Local test rig: mocks the Duda env + runs the real widget with real Splide |

## Deploy

1. Paste each file into the matching tab of the Duda Widget Builder.
2. Add the config fields listed in `DUDA-CONFIG-CHANGES.md`.
3. Republish the site.

## Testing locally

Open `harness/index.html` in a browser. Switch layouts / columns via query string:

```
harness/index.html?layout=layout_3            # flip
harness/index.html?layout=layout_1&slides=1   # slider
harness/index.html?layout=layout_2&col=column-eight
```

## Verifying a live deploy — gotchas

- **Version fingerprint:** the fixed build stamps cards with class `widget-5dd67b`; the
  old build used `widget-b72f5c`. Grep the rendered DOM to confirm which is live.
- **Read computed styles, not `cssRules`:** Duda serves the widget CSS from a cross-origin
  CDN, so `document.styleSheets[].cssRules` throws and marker scans give false negatives.
  Verify fixes via `getComputedStyle()` on real elements.
- Live test page: `https://www.devdemo2.shazamme.com/consultant-26`
  (use `http://` if the staging TLS cert is expired).

## What was fixed (v1.0.0)

- Grid: `minmax(0,1fr)` + `min-width:0` (no overflow), columns up to 8, responsive collapse.
- Flip card: front & back share one grid cell — no size change on hover, no track overflow.
- Slide-out: card grows and pushes content down instead of overlapping it.
- Buttons pinned to the bottom of every card.
- Overlay: pseudo-element gradient (replaced the fragile `border-image` hack).
- Slider: single arrows container (cards centred between arrows), pagination moved below
  the cards, per-page driven by real viewport width (never collapses to 1).
- Fixes: flip title/location data binding (`c.data.*`), category separator stray comma.
