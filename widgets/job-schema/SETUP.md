# Job Schema — Duda setup

The platform widget that puts the `JobPosting` JSON-LD on a job details page
(widget id `1d5f6367a3ee4a8e985708ba15a794c3`, 1,522 instances at v38). Its JS is
the bundle built from `legacy.js`; Duda keeps the HTML tab, the CSS and a loader stub.

The widget as it ran inline at v38 is kept verbatim in `_reference/job-schema/`.

## Paste into Widget Builder

| Duda box | File |
|---|---|
| HTML | `content.hbs` |
| JavaScript | `duda-paste-jsdelivr.js` (switch to `duda-paste.js` once the CloudFront deploy is done) |
| CSS | `duda-css.reference.css` (unchanged from v38) |

Publish it on a test site first and check a job page (see "Checking a page")
before publishing the version to every site.

## What each part does

The HTML tab renders a plain `JobPosting` block. Anything that reads the page
without running scripts gets that block. Handlebars HTML-escapes its values and
cannot escape a line break, so that block is only as good as the data: a
description with a newline in it is invalid JSON there.

The bundle then builds the posting from `data.config`, the raw values behind the
same inputs, and replaces the block. That is the version Google reads, since it
renders the page. Compared with v38 it:

1. is always valid JSON (`JSON.stringify`), whatever the description contains
2. sends the description as HTML, not as `&lt;p&gt;` text
3. maps any work type label to Google's list (`Permanent`, `Full Time`,
   `FullTimeRegular` and `Direct Hire` to `FULL_TIME`, `Temp` and `Fixed Term` to
   `TEMPORARY`, an unknown label to `OTHER`)
4. sends `baseSalary` only when there is an amount, a unit and a currency, and
   sends a single bound as `minValue` or `maxValue`, not as an exact salary
5. sends `datePosted` and `validThrough` only as ISO dates; the feed's
   `09-Nov-2026` shape is converted, anything else is left out
6. adds `addressRegion` from `state`, drops a filler street address (`NA`, `.`)
   and trailing commas
7. drops an empty `logo` and `sameAs`
8. removes the block altogether on a page that has no job, where the HTML tab
   renders a `JobPosting` with every value empty
9. adds the "SCHEMA MARKUP" label in the editor only, so it is no longer in a live
   page's source

`industry` is left out, as v38 left it out.

If the bundle cannot be fetched the page keeps the HTML tab's block and the stub
writes one `[job-schema]` warning to the console.

### Correcting a mapping on one site

The mapping from label to Google value is in the bundle. A site whose label it
reads wrongly binds the input to a field that already holds the Google value,
which the bundle passes through unchanged: `worktype` to `workTypeGoogleSEO`,
`salaryType` to `salaryTypeGoogleSEO` (both are in the job feed).

## Optional inputs

The bundle reads four inputs the widget does not have yet. Each is used only when
present, so the widget works without them.

| Input variable | Type | Bind to (job collection field) | Effect |
|---|---|---|---|
| `companyName` | text | `siteName` | `hiringOrganization.name` and `identifier.name`. Without it they use `advertiserName`, which is the internal advertiser record (for example "Acme Bullhorn") |
| `companyLogo` | image or text URL | none, set per site | `hiringOrganization.logo`. Without it the logo is `advertiserImageURL`, or left out |
| `validThrough` | text | `expiryDate` | `validThrough`, when the value is an ISO date |
| `postalCode` | text | `postalCode` | `jobLocation.address.postalCode` |

A widget instance carries its own list of bindings (`data-binding` on the element),
so adding an input here may not bind it on sites that already have the widget.
Not verified either way: check one existing site after adding an input.

## Checking a page

In the browser console on a job page:

```js
JSON.parse(document.querySelector('script.jobSchema').textContent)
```

It must return an object whose `description` starts with `<`, not `&lt;`. Then run
the page URL through Google's Rich Results Test.

`curl` shows the HTML tab's block, not the bundle's: the bundle runs in the browser.

## Rolling back

Paste `_reference/job-schema/job-schema-js.txt` into the JavaScript tab and
`_reference/job-schema/job-schema-html.txt` into the HTML tab, and publish.

## Shipping a change

1. Edit `legacy.js`, then `npm run check` and commit `dist/job-schema`.
2. Before opening the PR, set `TAG` in `duda-paste-jsdelivr.js` to the next free
   `v0.1.x`. After the merge, tag the merge commit with it and check the jsDelivr
   URL returns 200 with the new code.
3. Repaste the stub only when `TAG` changed. Sites don't need republishing.
