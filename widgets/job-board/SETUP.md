# Job Board — Duda setup

Karen's job board widget (27 Nov 2026), modelled on the layout of a classic agency jobs page: a search panel, a sidebar of filters with live counts (from 1024px; below that a panel behind a Filters button) and a grid of job cards with sort and pages. Its JS is the bundle built from `index.ts`; Duda keeps only the template, the CSS and a loader stub.

## Paste into Widget Builder

| Duda box | File |
|---|---|
| HTML | `content.hbs` |
| JavaScript | `duda-paste-jsdelivr.js` (switch to `duda-paste.js` once the CloudFront deploy is done) |
| CSS | `duda-css.reference.css` |
| Desktop CSS | `duda-css.desktop.reference.css` |
| Mobile CSS | `duda-css.mobile.reference.css` |
| Duda AI, Content tab 1 "Jobs and search" | `duda-ai-prompt-1-jobs-search.md` |
| Duda AI, Content tab 2 "Filters" | `duda-ai-prompt-2-filters.md` |
| Duda AI, Content tab 3 "Results" | `duda-ai-prompt-3-results.md` |
| Duda AI, Content tab 4 "Job cards" | `duda-ai-prompt-4-cards.md` |
| Duda AI, Design part 1 | `duda-ai-prompt-5-design-search-filters.md` |
| Duda AI, Design part 2 | `duda-ai-prompt-6-design-results-cards.md` |

Nothing is required: with every field left alone the widget shows the site's live jobs.

## Where the jobs come from

1. **The site's "Jobs" collection** (setting `jobsCollection`, default `Jobs`), read in the browser with Duda's Collections API (`dmAPI.loadCollectionsAPI()`, 100 rows a page, every page). On a Shazamme site this is the external collection that StackSync fills, so the widget is visibly tied to the collection named in its panel, and the editor shows "Connected to the "Jobs" collection: N live jobs."
2. **The Shazamme job feed** (`/job-results/<siteID>` through the SDK, the list Job Feed 2026 and Jobs by Industry read) when the collection is not on the page, cannot be read, is empty, or the setting is cleared.

Duda's Widget Builder has no input that picks a whole collection. Its "Enable binding to Connected Data" switch binds one input to one field (on a dynamic page, or a Content Library value), which suits a job page widget, not a board of every job. So the collection is named in a text field and read at run time, which is how Duda documents custom widgets reading a collection.

Rows with `activeStatus` false are skipped. Facets read `profession` or `category`, `role` or `subCategory`, `workTypeLabel` or `workType`, `workModel`, `country`, `state`, `city`. The salary line is `core/salary.ts` (amount, then the advert's wording).

## Page address

The search lives in the query string, so a search can be shared and Back works: `keyword`, `location`, one parameter per ticked value (`profession`, `role`, `workType`, `workModel`, `country`, `state`, `city`, repeated for several), `sort` (when not the default) and `page`. It accepts what Job Search Hero sends (`keyword`, `location`, `workType`) and the keyword from the legacy Job Search hash. Only the filter groups the board shows are read from the address (none when the filters are off), so a visitor is never filtered by something they cannot untick. A search or a page change adds a Back step; a tick, a sort or "load more" does not. Turn off "Keep the search in the page address" when two boards share one page. The editor never writes the address.

## Accessibility

Filters are real checkboxes inside labels; each group is a button with `aria-expanded`. The filter panel (below 1024px) is a modal dialog: focus moves to its close button, Tab and Shift+Tab stay inside, Esc closes and focus returns to the Filters button, and the page behind does not scroll. The result count is a polite live region. Every button is at least 44px tall with the standard padding (`platform/standards/BUTTONS.md` section 3).

## Shipping a change

1. Edit the TypeScript, then `npm run check` and commit `dist/job-board`.
2. Set `TAG` in `duda-paste-jsdelivr.js` to the next free `v0.1.x`. After the merge, tag the merge commit with it and check the jsDelivr URL returns 200 with the new code.
3. Repaste the stub only when `TAG` changed. Sites don't need republishing.

## When the jobs cannot be loaded

The board waits up to 4 seconds for the Duda collection, then uses the Shazamme job feed. If neither can be read it shows `loadErrorText` with a `retryText` button (not the "no live jobs" text) and logs `[job-board] could not load jobs` with the collection name and site to the browser console.
