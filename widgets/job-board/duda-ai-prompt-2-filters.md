Build the Content Editor for this widget. Create one tab called "Filters". Keep the keys exactly as written.

**Filter groups**

- Show filters | key: showFilters | type: toggle | default: true | help: A sidebar on wide screens and a Filters button on tablets and phones.
- Groups to show, in order | key: filterGroups | type: text | default: profession, workType, workModel, country, city | help: Any of profession, role, workType, workModel, country, state, city, separated by commas. Remove a name to hide that group.
- Options shown before "Show more" | key: optionsShown | type: number | default: 8 | help: Longer groups get a Show more button. Between 1 and 50.
- Groups open when the page loads | key: groupsOpen | type: dropdown | default: all | options: all, first, none | help: Visitors can open and close each group.

**Group names**

- Profession group name | key: labelProfession | type: text | default: Profession
- Role group name | key: labelRole | type: text | default: Role
- Work type group name | key: labelWorkType | type: text | default: Work type
- Work model group name | key: labelWorkModel | type: text | default: Work model
- Country group name | key: labelCountry | type: text | default: Country
- State group name | key: labelState | type: text | default: State
- City group name | key: labelCity | type: text | default: City

**Buttons and words**

- Filters heading | key: filtersTitle | type: text | default: Filter jobs | help: Heading of the filter panel on tablets and phones.
- Filters button (tablets and phones) | key: filtersButtonText | type: text | default: Filters
- Close button name for screen readers | key: closeText | type: text | default: Close filters
- Apply button in the filter panel | key: applyText | type: text | default: Show {count} jobs | help: {count} becomes the number of matching jobs.
- Clear button | key: clearText | type: text | default: Clear all | help: Clears the search and every filter.
- Show more button | key: showMoreText | type: text | default: Show more
- Show less button | key: showLessText | type: text | default: Show less
