Build the Content Editor for a widget called "Job Search Hero". It is a search panel with labelled boxes for keyword, location and work type, and a button that shows how many roles are live. Pressing it opens the job results page with the search applied. Create these fields exactly as listed, in this order, under the headings. Keep every key exactly as written. All values arrive as text.

**Where it goes**

- Results page | key: resultsPage | type: text | default: job-results | help: The page that shows the search results, without the first slash. The default suits most sites.
- Screen reader name | key: ariaLabel | type: text | default: Search jobs | help: Read out by screen readers for the whole search panel.

**Boxes**

- Show location box | key: showLocation | type: toggle | default: true | help: A free-text box, for example a city or state.
- Show work type box | key: showWorkType | type: toggle | default: true | help: A dropdown of the work types your live jobs use. It hides itself when there are none.
- Keyword label | key: keywordLabel | type: text | default: Keyword | help: Small heading above the keyword box.
- Keyword placeholder | key: keywordPlaceholder | type: text | default: Job title, skill or company | help: Grey hint inside the box.
- Location label | key: locationLabel | type: text | default: Location | help: Small heading above the location box.
- Location placeholder | key: locationPlaceholder | type: text | default: Sydney, London… | help: Grey hint inside the box.
- Work type label | key: workTypeLabel | type: text | default: Work type | help: Small heading above the dropdown.
- Work type first option | key: workTypeAllLabel | type: text | default: All types | help: The choice that means any work type.

**Button**

- Button text | key: buttonText | type: text | default: Search {count} roles | help: Shown when there are two or more live roles. {count} becomes the number of live roles.
- Button text for one role | key: buttonTextOne | type: text | default: Search 1 role | help: Shown when exactly one role is live.
- Button text when the number is not known | key: buttonTextNoCount | type: text | default: Search roles | help: Shown while the number loads, and when there are no live roles.
