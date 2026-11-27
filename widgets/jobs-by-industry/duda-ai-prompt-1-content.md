Build the Content Editor for this widget. Create one tab called "Jobs". Keep the keys exactly as written. Nothing here is required: with every field left alone the widget shows the site's live jobs.

**What to show**

- Most industries to show | key: maxProfessions | type: number | default: 6 | help: Industries are the professions that have live jobs, most roles first. Between 1 and 30.
- Most jobs on each industry | key: maxJobs | type: number | default: 4 | help: The newest jobs for the selected industry. Between 1 and 12.
- Show salary on each job | key: showSalary | type: toggle | default: true | help: Uses the salary text from the advert.
- How a location is written | key: locationFormat | type: dropdown | default: city-state | options: city-state, city-country, city-state-country | help: city-state gives Perth, WA.

**Links**

- Job page | key: detailsPage | type: text | default: /job-details | help: The page every job card opens. The job is added to the end of this address.
- Show the "See all" button | key: showSeeAll | type: toggle | default: true | help: A button above the panel.
- "See all" button text | key: seeAllText | type: text | default: See all {count} roles | help: {count} becomes the number of live roles on the site.
- "See all" button address | key: seeAllUrl | type: link | default: /job-results | help: A page on this site (starting with /) or a full https:// address.

**Words**

- Text under an industry name (one role) | key: countOne | type: text | default: {n} live role | help: {n} becomes the number of roles.
- Text under an industry name (many roles) | key: countMany | type: text | default: {n} live roles | help: {n} becomes the number of roles.
- Name of the industry list for screen readers | key: ariaLabel | type: text | default: Industries | help: Read out when someone reaches the list of industries.
- Heading level of the industry name | key: headingTag | type: dropdown | default: h3 | options: h2, h3, h4, h5, p | help: Pick the level that fits the page outline. The text size is set in the Design editor.
