# Live Stats — Duda setup

Karen's widget for the Shazamme Demo 3 redesign (27 Nov 2026). Its JS is the bundle built from `index.ts`; Duda keeps only the template, the CSS and a loader stub.

## Paste into Widget Builder

| Duda box | File |
|---|---|
| HTML | `content.hbs` |
| JavaScript | `duda-paste-jsdelivr.js` (switch to `duda-paste.js` once the CloudFront deploy is done) |
| CSS | `duda-css.reference.css` |
| Desktop CSS | `duda-css.desktop.reference.css` |
| Mobile CSS | `duda-css.mobile.reference.css` |
| Duda AI, Content Editor | `duda-ai-prompt-1-content.md` |
| Duda AI, Design Editor | `duda-ai-prompt-2-design.md` |

Live numbers come from the site's job feed (`/job-results/<siteID>`, the same feed Job Results uses) and the Consultants collection (visible consultants). A live tile with no data is left out. `settings.json` lists every key; `index.test.ts` keeps it, the HTML source markup and the Content editor prompt in step.

## Shipping a change

1. Edit the TypeScript, then `npm run check` and commit `dist/live-stats`.
2. Set `TAG` in `duda-paste-jsdelivr.js` to the next free `v0.1.x`. After the merge, tag the merge commit with it and check the jsDelivr URL returns 200 with the new code.
3. Repaste the stub only when `TAG` changed. Sites don't need republishing.
