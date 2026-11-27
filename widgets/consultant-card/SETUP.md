# Consultant Card: Duda setup

A new widget (it does not replace Consultant or Consultant on Jobs, which existing sites keep). An initials-badge card for the Shazamme Consultants collection. Never shows a photo. Its JS is `index.ts` built to `dist/consultant-card/0.1.0/widget.min.js`.

Two modes in one widget:

- **team**: a grid of consultants, each with name, job title and "N live roles".
- **job**: the one consultant who owns the current job, on a dark panel with phone and email. Connect `jobID` to the job's ID on the dynamic job page.

## Paste into Widget Builder

| Duda box | File |
|---|---|
| HTML | `content.hbs` |
| JavaScript | `duda-paste-jsdelivr.js` (switch to `duda-paste.js` once the CloudFront deploy is done) |
| CSS | `duda-css.reference.css` |
| Desktop CSS | `duda-css.desktop.reference.css` |
| Mobile CSS | `duda-css.mobile.reference.css` |
| Duda AI | `duda-ai-prompt-1-content.md`, `duda-ai-prompt-2-card.md`, `duda-ai-prompt-3-design.md`, one at a time, in order |

## Shipping a change

1. Edit the TypeScript, then `npm run check` and commit `dist/consultant-card`.
2. Before opening the PR, set `TAG` in `duda-paste-jsdelivr.js` to the next free `v0.1.x`. After the merge, tag the merge commit with it and check the jsDelivr URL returns 200 with the new code.
3. Repaste the stub only when `TAG` changed. Sites don't need republishing.

## Data it reads

Collection `Consultants`: `consultantID`, `firstName`, `lastName`, `positionTitle`, `eMail`, `phone` (else `mobile`), `consultantURL`, `classification`, `sortOrder`, `isVisible`. Collection `Jobs` (live roles and job mode): `jobID`, `activeStatus`, `contactEmail`, `consultantURL`, and for the fallback card `contactName`, `contactPhone`. Both go through `shazamme.fetch`, once per page.

**How a job links to a consultant.** A job names its consultant by `contactEmail` (matches the consultant's `eMail`, ignoring case) or by `consultantURL` (matches the consultant's page). These are the same fields Jobs on Consultants filters on. If no job in the feed carries either field, nobody's count is known, so the "N live roles" line is hidden rather than showing 0. A consultant with no live jobs hides the line unless `showZeroRoles` is on.
