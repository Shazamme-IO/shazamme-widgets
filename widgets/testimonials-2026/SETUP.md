# Testimonials 2026: Duda setup

A new widget (it does not replace Testimonials v520, which existing sites keep). Slider, grid, list and featured-quote layouts for the Shazamme Testimonials collection. No jQuery, no slick. Its JS is `index.ts` built to `dist/testimonials-2026/0.1.0/widget.min.js`.

## Paste into Widget Builder

| Duda box | File |
|---|---|
| HTML | `content.hbs` |
| JavaScript | `duda-paste-jsdelivr.js` (switch to `duda-paste.js` once the CloudFront deploy is done) |
| CSS | `duda-css.reference.css` |
| Desktop CSS | `duda-css.desktop.reference.css` |
| Mobile CSS | `duda-css.mobile.reference.css` |
| Duda AI | `duda-ai-prompt-1-content.md` to `duda-ai-prompt-7-design-people.md`, one at a time, in order |

The CSS stays in Duda, not in the bundle: the Design Editor writes to those selectors, and the pop-up styles live on the page body.

## Shipping a change

1. Edit the TypeScript, then `npm run check` and commit `dist/testimonials-2026`.
2. Before opening the PR, set `TAG` in `duda-paste-jsdelivr.js` to the next free `v0.1.x`. After the merge, tag the merge commit with it and check the jsDelivr URL returns 200 with the new code.
3. Repaste the stub only when `TAG` changed. Sites don't need republishing.

## Data it reads

Collection `Testimonials`: `content`, `who`, `position`, `company`, `photoURL`, `testimonialDate`, `tags`, `consultantID`, `testimonialID`, and an optional rating (`rating`, `testimonialRating`, `starRating` or `stars`, a number above 0 up to 5). Collection `Consultants` is fetched only when "Show consultant" is on. Both go through `shazamme.fetch`, once per page.
