Add a tab called "Filters" to the Content Editor of this widget. Add these fields to that tab only. Keep the keys exactly as written. These apply to the team list only.

**Tab: Filters**

Which consultants
- Only this location | key: location | type: text | default: (empty) | help: Show only consultants in this location, for example Sydney. Separate several with commas. Capital letters do not matter. Empty shows everyone.

Filter bar for visitors
- Show a search box | key: showSearch | type: toggle | default: false | help: Visitors type a name or job title to narrow the list.
- Search box hint | key: searchPlaceholder | type: text | default: Search by name | help: The grey hint in the box. Also read out by screen readers.
- Show sector buttons | key: showClassificationFilter | type: toggle | default: false | help: One button per sector (classification) your consultants have, plus All.
- Sector buttons name | key: classificationFilterLabel | type: text | default: Filter by sector | help: Read out by screen readers.
- Show location buttons | key: showLocationFilter | type: toggle | default: false | help: One button per location your consultants have, plus All.
- Location buttons name | key: locationFilterLabel | type: text | default: Filter by location | help: Read out by screen readers.
- All button text | key: filterAllText | type: text | default: All | help: The first button in each row, which shows everyone.
- Filter bar position | key: filterAlign | type: dropdown | default: left | options: left, center, right | help: Where the search box and buttons sit above the list.
- Message when nothing matches | key: noMatchText | type: text | default: No consultants match your search. | help: Shown when the search and buttons leave no consultants.
- Count read out, one consultant | key: resultsCountOne | type: text | default: {n} consultant shown | help: Screen readers hear this after each search or button press. {n} is the number.
- Count read out, several | key: resultsCountMany | type: text | default: {n} consultants shown | help: The same, for any other number. Not shown on the page.
