Build the Content Editor for this widget, part 2 of 2. Create two tabs: "Layout" and "Height and shape". Keep the keys exactly as written. Do not remove the tabs from part 1.

**Tab: Layout**

- Cards per row on desktop | key: columnsDesktop | type: number | default: 3 | help: 1 to 6. Screens 1024px wide and up.
- Cards per row on tablet | key: columnsTablet | type: number | default: 2 | help: 1 to 6. Screens 768px to 1023px wide.
- Cards per row on mobile | key: columnsMobile | type: number | default: 1 | help: 1 to 6. Screens 767px wide and under.
- Gap between cards on desktop | key: gapDesktop | type: number | default: 24 | help: Pixels, 0 to 120.
- Gap between cards on tablet | key: gapTablet | type: number | default: 20 | help: Pixels, 0 to 120.
- Gap between cards on mobile | key: gapMobile | type: number | default: 16 | help: Pixels, 0 to 120.
- Stretch the last row | key: stretchLastRow | type: toggle | default: false | help: On: cards on a short last row grow to fill the row width.
- Fill the column height | key: fillColumn | type: toggle | default: false | help: On: the cards grow to fill the height of the column the widget sits in. Needs a column with a set height.

**Tab: Height and shape**

Height mode: Fixed keeps the card at the height you set and the back text scrolls inside it. Minimum lets the card grow so all the back text shows. Shape keeps the card's width to height ratio. Cards in one row are always the same height.

- Height mode on desktop | key: heightModeDesktop | type: dropdown | default: aspect | options: fixed, min, aspect | help: Fixed, minimum (grows to fit) or aspect (shape).
- Height on desktop | key: heightDesktop | type: number | default: 380 | help: Pixels, 80 to 1600. Used by Fixed and Minimum.
- Shape on desktop | key: aspectDesktop | type: dropdown | default: 4:5 | options: 1:1, 4:3, 3:2, 16:9, 5:4, 4:5, 3:4, 2:3, 9:16 | help: Width to height. Used by Shape.
- Height mode on tablet | key: heightModeTablet | type: dropdown | default: aspect | options: fixed, min, aspect | help: Fixed, minimum (grows to fit) or aspect (shape).
- Height on tablet | key: heightTablet | type: number | default: 340 | help: Pixels, 80 to 1600. Used by Fixed and Minimum.
- Shape on tablet | key: aspectTablet | type: dropdown | default: 4:5 | options: 1:1, 4:3, 3:2, 16:9, 5:4, 4:5, 3:4, 2:3, 9:16 | help: Width to height. Used by Shape.
- Height mode on mobile | key: heightModeMobile | type: dropdown | default: min | options: fixed, min, aspect | help: Fixed, minimum (grows to fit) or aspect (shape).
- Height on mobile | key: heightMobile | type: number | default: 320 | help: Pixels, 80 to 1600. Used by Fixed and Minimum.
- Shape on mobile | key: aspectMobile | type: dropdown | default: 4:5 | options: 1:1, 4:3, 3:2, 16:9, 5:4, 4:5, 3:4, 2:3, 9:16 | help: Width to height. Used by Shape.
- Top left corner radius | key: radiusTopLeft | type: number | default: 16 | help: Pixels, 0 to 400. Set opposite corners high and the others to 0 for a petal shape.
- Top right corner radius | key: radiusTopRight | type: number | default: 16 | help: Pixels, 0 to 400.
- Bottom right corner radius | key: radiusBottomRight | type: number | default: 16 | help: Pixels, 0 to 400.
- Bottom left corner radius | key: radiusBottomLeft | type: number | default: 16 | help: Pixels, 0 to 400.
