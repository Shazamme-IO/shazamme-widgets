# Job Search Hero: Duda setup

New widget (Shazamme Demo 3 redesign), separate from Job Search on purpose: Job Search is on 9,892 placements and its HTML and CSS live only in Widget Builder, so a layout change there would reach every site. Nothing about Job Search changes. Its JS is `index.ts` (with `settings.ts` and the shared `../_job-page/job.ts`) built to `dist/job-search-hero/0.1.0/widget.min.js`.

## Paste into Widget Builder

| Duda box | File |
|---|---|
| HTML | `content.hbs` |
| JavaScript | `duda-paste-jsdelivr.js` (switch to `duda-paste.js` once the CloudFront deploy is done) |
| CSS | `duda-css.reference.css` |
| Desktop CSS | `duda-css.desktop.reference.css` |
| Mobile CSS | `duda-css.mobile.reference.css` |
| Duda AI | `duda-ai-prompt-1-content.md`, then `duda-ai-prompt-2-design.md`, one at a time |

## What it does

Three labelled boxes in a translucent panel (Keyword, Location, Work type) and a button that reads "Search 24 roles" with the live count. Pressing it goes to `/<resultsPage>?keyword=...&location=...&workType=...`, the same addresses Job Results already reads. Boxes the visitor leaves empty are left out of the address. On the results page the boxes are prefilled from the address. In the editor the button does nothing.

The count is every live job in the site's Jobs list. The work type dropdown holds the distinct work types of those jobs and hides itself when there are none. Location is free text: Job Results matches it against each job's location and address text.

## Data it reads

Collection `Jobs` through `shazamme.fetch({ name: 'Jobs', useCache: true })`, once per page (shared with the Job Summary and Job Hero Chips widgets): the row count and each row's `workType`.

## Shipping a change

1. Edit the TypeScript, then `npm run check` and commit `dist/job-search-hero`.
2. Set `TAG` in `duda-paste-jsdelivr.js` to the next free `v0.1.x`. After the merge, tag the merge commit with it and check the jsDelivr URL returns 200 with the new code.
3. Repaste the stub only when `TAG` changed. Sites don't need republishing.
