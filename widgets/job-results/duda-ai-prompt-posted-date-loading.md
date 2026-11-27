# Job Results: posted date as entered, and a loading message (Duda AI prompt)

Added for Marshall Harmony QA items 24 and 16 (27 Nov 2026). Both are **off by
default**: the widget reads them only when they are set, so a site that never
adds the settings is unchanged.

- `useJobPostedDate` (toggle). On: the standard card shows the job's posted date
  exactly as the Modern card and Job Feed 2026 show it (for example `16-Nov-2026`).
  Off: the card shows the changed-on day in the visitor's own locale and time zone
  (`17/11/2026` for a visitor in Sydney, `16/11/2026` in London).
- `loadingText` (text). When set, the empty results list shows this line while the
  jobs load (about 2 to 4 seconds on a cold load), and it is replaced by the cards.

## Prompt for Duda's widget AI

Paste everything below the line into Duda's AI in Widget Builder on the Job
Results widget.

---

In the Job Results widget, add two new settings to the Content panel. Do not change the JavaScript tab or any existing settings, HTML or CSS.

1. Add a Toggle setting.
   - Label: Show Posted Date As Entered
   - Variable name: useJobPostedDate
   - Default: OFF

2. Add a Text input setting.
   - Label: Loading Message
   - Variable name: loadingText
   - Default: empty

---

## After the AI runs

1. Check the keys are exactly `useJobPostedDate` and `loadingText`.
2. Publish the widget version. Click **Update Widget** on any instance that asks, then republish that page.
3. On Marshall Harmony (`a19b0b0c`) /job-results: turn Show Posted Date As Entered on, and set Loading Message to `Loading jobs...`. "Show Date" must already be on (it is).
