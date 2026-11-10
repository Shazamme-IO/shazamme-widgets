# Consultant Widget — Duda config fields to add/edit

The code fixes live in `widget.js` / `widget.css` / `widget.html`. A few features also
need fields in the widget's **Duda config panel** (Content/Design tabs). Add these so the
new behaviour is reachable from the editor.

## 1. Columns up to 8 (all grid layouts)

Field: **`gridSize`** (the existing "Columns" dropdown).
Add these options (value must match the CSS class exactly):

| Label       | Value           |
|-------------|-----------------|
| 5 Columns   | `column-five`   |
| 6 Columns   | `column-six`    |
| 7 Columns   | `column-seven`  |
| 8 Columns   | `column-eight`  |

(1–4 already exist. The CSS now defines `column-five` … `column-eight`, and dense grids
auto-collapse on narrow screens so they never overflow the widget.)

## 2. Slider "Show per page" up to 8

Field: **`slidePerPage`** (Content tab → "Show per page").
- If it is a **dropdown**: add options `4`, `5`, `6`, `7`, `8` (plain integer values).
- If it is a **number input**: no change needed — any integer now works.

Also applies to **`slidePerPageTablet`** if you want higher tablet counts.

> Note: the per-page logic was hardened — the live count is now driven by real viewport
> width (Splide `breakpoints`), not the `data.device` flag that was collapsing it to 1.
> So "only one card showing" will not recur even if a device value is wrong.

## 3. Arrows ON or OFF the cards (new field)

Add a new **boolean / checkbox** field:

| Key                 | Type     | Default | Label                          |
|---------------------|----------|---------|--------------------------------|
| `slideArrowsOnCard` | checkbox | `false` | "Navigation arrows on cards"   |

- **Unchecked (default):** arrows sit just outside the cards; cards stay centred between them.
- **Checked:** arrows overlay the cards' left/right edges.

## 4. Overlay angle — sanity check (no new field)

The overlay gradient now reads `gradientDegreeAngle` into a CSS variable. Make sure that
field outputs a value **with a unit** (e.g. `180deg`, not `180`). It did before (the old
`border-image` used the same value), so this is just a checkpoint.

---

## Nothing to add for these (pure code fixes, already done)

- Flip card: front/back share one cell → no size change on hover, no track overflow.
- Slide-out: opening the accordion now grows the card and pushes content down (no overlap).
- Buttons pinned to the bottom of every card.
- Columns confined within the widget; widget resizes horizontally.
- Pagination dots moved below the cards.
- Overlay reworked (pseudo-element) for default / slide-out / flip.
- Category separator stray-comma / trailing-separator cleaned.
- Flip card title & location were bound to `data.config.*` instead of the consultant's
  `c.data.*` (showed "N/A") — fixed.
