Build a second Content Editor tab for this widget called "Industry details". Keep the keys exactly as written. It lets the site builder add a one-line description and a picture to an industry. An industry with no entry here still shows, with its name and jobs only.

- Fallback background picture | key: defaultImage | type: image | default: (blank) | help: Used behind an industry that has no picture of its own. Leave blank for a plain navy panel.
- Industry details | key: industries | type: list (repeatable items) | default: one empty item | help: One item per industry you want to describe. The name must match the industry's name on the site's jobs, for example Accounting & Finance. Capitals do not matter.
  - Industry name | key: name | type: text | default: (blank) | help: Exactly as the industry appears in the tab list.
  - One-line description | key: blurb | type: text | default: (blank) | help: One short sentence shown under the industry name.
  - Background picture | key: image | type: image | default: (blank) | help: Shown behind the panel, dimmed. Use a picture without people.
