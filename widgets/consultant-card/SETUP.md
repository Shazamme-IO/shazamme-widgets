# Consultant Card: Duda setup

A card for the Shazamme Consultants collection (it does not replace Consultant or Consultant on Jobs, which existing sites keep). Initials by default; the consultant's photo is an option. Its JS is `index.ts` built to `dist/consultant-card/0.1.0/widget.min.js`.

Two modes in one widget:

- **team**: a grid (or slider) of consultants, each with name, job title and "N live roles", plus whatever the site builder switches on: photo, location, sector, short description, phone, mobile, email, LinkedIn, Facebook, X, Google, WeChat, a View profile button, and a search box and sector and location buttons above the list.
- **job**: the one consultant who owns the current job, on a dark panel with phone and email, and the same photo, contact and social options. Connect `jobID` to the job's ID on the dynamic job page.

With every new setting at its default the widget draws exactly what v0.1.65 drew (`golden.test.ts` runs both bundles and compares the HTML byte for byte).

## Paste into Widget Builder

| Duda box | File |
|---|---|
| HTML | `content.hbs` |
| JavaScript | `duda-paste-jsdelivr.js` (switch to `duda-paste.js` once the CloudFront deploy is done) |
| CSS | `duda-css.reference.css` |
| Desktop CSS | `duda-css.desktop.reference.css` |
| Mobile CSS | `duda-css.mobile.reference.css` |
| Duda AI | `duda-ai-prompt-1-content.md` to `duda-ai-prompt-9-design-more.md`, one at a time, in order. On the widget already built from prompts 1 to 3, paste only 4 to 9 |

Content Editor tabs: Content (1), Card (2), Photo and details (4), Contact (5), Social (6), Layout (7), Filters (8). Design Editor: prompt 3, then prompt 9 adds photo, icon, social, button, slider and filter styles.

## Shipping a change

1. Edit the TypeScript, then `npm run check` and commit `dist/consultant-card`.
2. Before opening the PR, set `TAG` in `duda-paste-jsdelivr.js` to the next free `v0.1.x`. After the merge, tag the merge commit with it and check the jsDelivr URL returns 200 with the new code.
3. Repaste the stub only when `TAG` changed. Sites don't need republishing.
4. A change to the default output must update `golden.test.ts` on purpose (say so in the PR): the live placements rely on it.

## Data it reads

Collection `Consultants`: `consultantID`, `firstName`, `lastName`, `positionTitle`, `eMail`, `phone`, `mobile`, `consultantURL`, `classification` (JSON `[{"Profession":…}]` or text; `classification2` when empty), `businessLocation` (JSON `[{"LocationName":…}]`; `businessLocation2` when empty), `shortDescription`, `photoURL` (the field the platform Consultant and Consultant on Jobs widgets use; then `externalPhotoURL`, then `s3URL`), `linkedInURL`, `facebookURL`, `twitterURL`, `googleURL`, `weChatURL`, `sortOrder`, `isVisible`. Collection `Jobs` (live roles and job mode): `jobID`, `activeStatus`, `contactEmail`, `consultantURL`, and for the fallback card `contactName`, `contactPhone`. Both go through `shazamme.fetch`, once per page. Photos and social links are used only when they are http(s) addresses.

**How a job links to a consultant.** A job names its consultant by `contactEmail` (matches the consultant's `eMail`, ignoring case) or by `consultantURL` (matches the consultant's page). These are the same fields Jobs on Consultants filters on. If no job in the feed carries either field, nobody's count is known, so the "N live roles" line is hidden rather than showing 0. A consultant with no live jobs hides the line unless `showZeroRoles` is on.

**Profile page.** Empty uses each consultant's own `consultantURL` path. Set (for example `consultant`), the name and button go to `/consultant/<last part of their address>`, as the Consultant widget's `consultantPage` does.
