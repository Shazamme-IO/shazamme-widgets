Add a tab called "Card" to the Content Editor of this widget. Add these fields to that tab only. Keep the keys exactly as written.

**Tab: Card**

Layout (team)
- Columns on desktop | key: columnsDesktop | type: number | default: 4 | help: 1 to 6. Used when the widget is wide.
- Columns on tablet | key: columnsTablet | type: number | default: 2 | help: 1 to 6. Used when the widget is medium width.
- Columns on mobile | key: columnsMobile | type: number | default: 1 | help: 1 to 6. Used when the widget is narrow.
- Screen reader name | key: ariaLabel | type: text | default: Our consultants | help: Read out by screen readers for the list of consultants.

What each card shows
- Show job title | key: showRole | type: toggle | default: true | help: The consultant's position, under their name.
- Show live roles | key: showLiveRoles | type: dropdown | default: auto | options: auto, show, hide | help: A line such as "4 live roles". Auto shows it on team and hides it on job pages. It only appears when your jobs say which consultant owns them.
- Show a line when there are 0 live roles | key: showZeroRoles | type: toggle | default: false | help: Off hides the line for a consultant with no live jobs, so the page never says "0 live roles".
- Live roles text, one | key: liveRolesOne | type: text | default: {n} live role | help: Used when there is exactly one. {n} becomes the number.
- Live roles text, many | key: liveRolesMany | type: text | default: {n} live roles | help: Used for any other number. {n} becomes the number.
- Show phone | key: showPhone | type: dropdown | default: auto | options: auto, show, hide | help: Auto hides it on team and shows it on job pages.
- Show email | key: showEmail | type: dropdown | default: auto | options: auto, show, hide | help: Auto hides it on team and shows it on job pages.
- Link name to the consultant's page | key: linkProfile | type: toggle | default: true | help: Makes the whole team card a link to the consultant's profile page.
- Small heading (job page) | key: eyebrow | type: text | default: Your consultant | help: The small capital-letter heading above the job page card. Empty hides it.
