Add a tab called "Layout" to the Content Editor of this widget. Add these fields to that tab only. Keep the keys exactly as written.

**Tab: Layout**

- Layout | key: testimonialLayout | type: dropdown | default: slider | options: slider, grid, list, featured | help: Slider scrolls sideways. Grid shows cards in columns. List shows one wide card per row. Featured shows one large quote at a time.
- Columns on desktop | key: columnsDesktop | type: number | default: 3 | help: 1 to 4. Used by slider and grid when the widget is wide.
- Columns on tablet | key: columnsTablet | type: number | default: 2 | help: 1 to 4. Used when the widget is medium width.
- Columns on mobile | key: columnsMobile | type: number | default: 1 | help: 1 to 4. Used when the widget is narrow.
- Show this many at first (grid and list) | key: pageSize | type: number | default: 6 | help: A Show more button reveals the rest. 0 shows all at once.
- Show more button text | key: loadMoreText | type: text | default: Show more | help: The label on the button under a grid or list.
- Show tag filter buttons (grid and list) | key: showTagFilter | type: toggle | default: false | help: Adds buttons so visitors can filter by tag. Only appears when there is more than one tag.
- Text of the "all" filter button | key: allTagsLabel | type: text | default: All | help: The first filter button.
