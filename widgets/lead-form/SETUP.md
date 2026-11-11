# Lead Form — Duda setup

The lead-capture form (first name, last name, email, plus a screening template for the
other questions) that posts `Submit Lead` and sends the visitor to the thank-you page.
Widget Builder widget `49d66be920ac41458fdecd1af4b625b9`. Its JS is the bundle built from
`legacy.js`; Duda keeps the HTML and CSS tabs and a loader stub.

## Paste into Widget Builder

| Duda box | File |
|---|---|
| HTML | unchanged (stays in Widget Builder) |
| JavaScript | `duda-paste-jsdelivr.js` (switch to `duda-paste.js` once the CloudFront deploy is done) |
| CSS / Desktop CSS / Mobile CSS | unchanged (stay in Widget Builder) |

## What the bundle is

Live Widget Builder version 144 (captured 11 Nov 2026 from chandlermacleod.com) plus:

- `screeningTemplateIdManual` text setting wins over the collection picker (duda-widget
  38d59da / e504cf7, which never reached Widget Builder).
- Screening-question plugin pinned to **1.0.10**: a Text question whose Default Answer is
  `{{page.url}}` is submitted hidden, pre-filled with the page the form is on. Map it to
  the ATS field (Bullhorn Lead `customText3` "Page URL" for Chandler Macleod, Freshdesk
  #13297).
- `buildHref` hardened to the shared contract (missing slash, absolute hrefs, fragments).

Settings read from `data.config`: `searchResultPage`, `thankyouPage`, `dashboardPage`,
`collectionQuestions`, `screeningQuestionsCollection`, `screeningTemplateId`,
`screeningTemplateIdManual`, `blockFreeEmail` (+ `blockFreeEmailTitle` / `Message`),
`warningRequired` (+ `Title`), `showLoader`, `ApplyButtonLoadingText`, `debugMode`, and the
`screening*` display options passed through to the plugin.

## Shipping a change

1. Edit `legacy.js`, then `npm run check` and commit `dist/lead-form`.
2. Before opening the PR, set `TAG` in `duda-paste-jsdelivr.js` to the next free
   `v0.1.x`. After the merge, tag the merge commit with it and check the jsDelivr
   URL returns 200 with the new code.
3. Repaste the stub only when `TAG` changed. Sites don't need republishing.
