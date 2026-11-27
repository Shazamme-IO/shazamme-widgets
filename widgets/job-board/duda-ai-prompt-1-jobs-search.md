Build the Content Editor for this widget. Create one tab called "Jobs and search". Keep the keys exactly as written. Nothing here is required: with every field left alone the widget shows the site's live jobs.

**Where the jobs come from**

- Jobs collection | key: jobsCollection | type: text | default: Jobs | help: The site collection the jobs are read from. Leave it as Jobs on a Shazamme site. Clear it to read the job feed directly.
- Job page | key: detailsPage | type: text | default: /job-details | help: The page every job card opens. The job is added to the end of this address.
- Keep the search in the page address | key: syncAddress | type: toggle | default: true | help: Lets visitors share a search and use the Back button. Turn off if two job boards share one page.

**Search panel**

- Show the search panel | key: showSearch | type: toggle | default: true | help: The bar with the keyword and location boxes.
- Search panel heading | key: searchPrompt | type: text | default: Looking for your next opportunity? | help: Leave blank to show only the boxes.
- Keyword box placeholder | key: keywordPlaceholder | type: text | default: Keyword | help: Also read out to screen readers.
- Show the location box | key: showLocationSearch | type: toggle | default: true | help: Searches city, state, country and postcode.
- Location box placeholder | key: locationPlaceholder | type: text | default: Location | help: Also read out to screen readers.
- Search button name for screen readers | key: searchButtonLabel | type: text | default: Search jobs | help: The button shows a magnifying glass; this is what it is called aloud.
- Pull the search panel up (pixels) | key: searchOverlap | type: number | default: 0 | help: Moves the panel up over the bottom of the section above, for example 60. Between 0 and 240.
