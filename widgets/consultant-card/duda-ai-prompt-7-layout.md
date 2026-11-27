Add a tab called "Layout" to the Content Editor of this widget. Add these fields to that tab only. Keep the keys exactly as written. These apply to the team list only; a job page always shows one card.

**Tab: Layout**

Grid or slider
- Layout | key: layout | type: dropdown | default: grid | options: grid, slider | help: Grid shows every consultant in rows. Slider shows one row that moves sideways.
- Cards visible in the slider | key: slidesToShow | type: number | default: 3 | help: 1 to 6, on a wide screen. Medium and narrow screens show no more than the tablet and mobile columns on the Card tab.
- Move on its own | key: autoplay | type: toggle | default: false | help: The slider moves by itself, with a pause button. It stops while a visitor points at it or uses the keyboard in it, and never moves for visitors who turned off motion.
- Time between moves (milliseconds) | key: sliderSpeed | type: number | default: 5000 | help: 2000 to 20000. 5000 is five seconds.
- Show arrows | key: arrows | type: toggle | default: true | help: Previous and next buttons under the slider.
- Loop back to the start | key: infinite | type: toggle | default: true | help: After the last card the next button goes back to the first. Off stops the arrows at the ends. A slider that moves on its own always starts again from the first card.

Slider button names (read out by screen readers)
- Previous button name | key: previousLabel | type: text | default: Previous consultants | help: Not shown on the page.
- Next button name | key: nextLabel | type: text | default: Next consultants | help: Not shown on the page.
- Pause button name | key: pauseLabel | type: text | default: Pause | help: Not shown on the page.
- Play button name | key: playLabel | type: text | default: Play | help: Not shown on the page.
