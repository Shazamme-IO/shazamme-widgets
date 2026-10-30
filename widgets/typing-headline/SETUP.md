# Typing Headline — Duda setup

Karen's widget for the Talent International clone (Home page hero). Its JS is the bundle built
from `legacy.js`; Duda keeps only the template, the CSS and a loader stub.

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

The CSS stays in Duda, not in the bundle. It hides the raw text before the script
runs, so it has to be on the page before the bundle loads, and the Design Editor
writes to the same selectors.

The widget needs no Shazamme SDK (`.no-sdk`), so its stubs load only the bundle.

## Shipping a change

1. Edit `legacy.js`, then `npm run check` and commit `dist/typing-headline`.
2. Before opening the PR, set `TAG` in `duda-paste-jsdelivr.js` to the next free
   `v0.1.x`. After the merge, tag the merge commit with it and check the jsDelivr
   URL returns 200 with the new code.
3. Repaste the stub only when `TAG` changed. Sites don't need republishing.
