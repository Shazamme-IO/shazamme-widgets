# Job Application (screening questions) → link-out variant

The duplicated Duda widget: the **full job application form** (screening
questions, resume/cover upload, phone validation, knockout handling) that now
**captures the application and then sends the candidate to the job's external
apply URL** — the behaviour the Candidate Form dynamic-redirect widget had, on
the real application form.

## Files

| file | what it is |
|---|---|
| `applicationsq-js.rtf` / `.txt` | **live baseline**, verbatim from Duda's JS box (2089 lines) — rollback source |
| `applicationsq-html.rtf` / `.txt` | live HTML box, verbatim — **unchanged by this port** |
| `applicationsq-mobcsss.rtf` / `applicationsq-mobcss.txt` | live mobile CSS box, verbatim — **unchanged by this port** |
| `applicationsq-linkout.js` | **paste this into the duplicated widget's JS box** (2121 lines) |

Desktop CSS was not exported — moot when the widget is duplicated in Duda, since
every CSS box comes across with the copy.

## Wiring

1. Duplicate the Job Application widget in Duda (name it for the link-out use).
2. Replace the JS box — **only the JS box**; HTML and both CSS boxes came across
   with the duplicate unchanged. Either:
   - `widgets/job-app-sq-linkout/duda-paste-jsdelivr.js` (**preferred**, 33
     lines) — loads the bundle from this repo's `dist/` via jsDelivr at a pinned
     tag, so fixes ship git → CDN with no re-paste on any site; or
   - `applicationsq-linkout.js` (2121 lines) — the inline fallback, if a site
     must not depend on an external bundle.

   `widgets/job-app-sq-linkout/duda-paste.js` is the CloudFront variant, for
   whenever the bundle is deployed to `sdk.shazamme.io` (needs the `sdk-deployer`
   AWS profile; unused until then).
3. Point the **dynamic apply button** at this widget's page. The button stores
   `jobID` + `currentJobViewed` in localStorage on click; this form reads
   `currentJobViewed` on submit to find the link-out URL — no extra fetch.
4. Jobs whose `applicationURL` is empty still land on the thank-you page, so one
   widget serves both link-out and normal jobs.

## The three changes vs the baseline

**1. No redirect on page load.** The stock widget did
`window.location = j.data.applicationURL` as soon as the job row came back, so on
a link-out job the candidate left before the form was filled. The row is still
cached to `currentJobViewed`; only the bounce is gone.

**2. Link-out destination on submit.** `apply()` now resolves a destination
before recording:

- `currentJobViewed.data.applicationURL` when set → the external apply URL
- otherwise `/{thankYouPage}`, plus the `redirectJobField` query when
  `includeLastSearch` is on — read from the cached row instead of re-fetching it

**3. Soft capture instead of register/duplicate round trips.** The stock flow did
a user lookup, then either a duplicate check + `Edit Candidate Info` (logged in)
or a firebase register (logged out) *before* applying — several seconds of
spinner on a form whose real apply happens at the link-out. Now the candidate is
minted from the form values (`collectRegisterFormValues()` + a fresh
`candidateID`) and recorded directly. Required-field and resume checks are kept.

With no file upload the `Apply Job` record is fired with `keepalive: true`
(same URL, method and body shape as `shazamme.submit` — `RegionalUrl`, POST,
JSON string body) and the redirect happens immediately; the request still
completes as the page navigates away. With a resume or cover letter the payload
can exceed the ~64KB keepalive cap, so there the awaited `shazamme.submit` is
kept and the redirect waits for it.

## Tracking

Unchanged and intact: `apply()` still builds
`referralSource / referralMedium / referralTerm / referralCampaign /
referralContent` from `utm_*` on the URL or `shazamme.session(...)`, and they
ride in the `Apply Job` payload on **both** paths above. `enableTracing` still
logs the candidate + application payload.

## Known trade-offs

- **No candidate account.** A logged-in candidate gets a fresh soft-capture
  record, not an update to their account, and no duplicate-application warning
  fires. That is the intended shape for a soft application whose real apply
  happens on the client's ATS — but it means this widget must not replace the
  normal application form on internally-hosted jobs.
- `register()`, `updateCandidate()` and `checkForDuplicate()` are left in place
  but are now unreferenced from the submit path; kept so the diff against the
  live baseline stays small and reversible.
- The keepalive path cannot see a backend failure. A rejected `Apply Job` is lost
  silently — acceptable for soft capture, not for a primary application form.
