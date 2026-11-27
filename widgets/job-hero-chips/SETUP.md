# Job Hero Chips: Duda setup

New widget (Shazamme Demo 3 redesign). The pills under the job title on the job details page. It does not replace anything: no existing widget is touched. Its JS is `index.ts` (with `chips.ts` and the shared `../_job-page/job.ts`) built to `dist/job-hero-chips/0.1.0/widget.min.js`.

## Paste into Widget Builder

| Duda box | File |
|---|---|
| HTML | `content.hbs` |
| JavaScript | `duda-paste-jsdelivr.js` (switch to `duda-paste.js` once the CloudFront deploy is done) |
| CSS | `duda-css.reference.css` |
| Desktop CSS | `duda-css.desktop.reference.css` |
| Mobile CSS | `duda-css.mobile.reference.css` |
| Duda AI | `duda-ai-prompt-1-content.md`, then `duda-ai-prompt-2-design.md`, one at a time |

## On the job details page

Add the widget to the dynamic page `job-details/~page-item~` and bind its **Job ID** input to the page's `jobID` field, exactly as the Dynamic Application button's is bound. The widget reads the site's Jobs list through the Shazamme SDK (the same list Job Feed 2026 and Job Search read, so profession, work type and work model arrive as names, not ids) and picks the row with that id. If nothing is bound it matches the page address to the job's own address.

A live page with no matching job renders nothing. In the editor it shows a sample job and a note.

## Data it reads

Collection `Jobs`: `jobID`, `city`, `state`, `country`, `workType`, `workModel`, `salaryText`, `salaryFrom` and `salaryTo` (else `realSalaryFrom`, `realSalaryTo`), `currencyCode` (else `salaryCurrency`, `currency`), `category` (profession), `subCategory` (role). The salary chip shows `salaryText`, else the formatted range.

## Shipping a change

1. Edit the TypeScript, then `npm run check` and commit `dist/job-hero-chips`.
2. Set `TAG` in `duda-paste-jsdelivr.js` to the next free `v0.1.x`. After the merge, tag the merge commit with it and check the jsDelivr URL returns 200 with the new code.
3. Repaste the stub only when `TAG` changed. Sites don't need republishing.
