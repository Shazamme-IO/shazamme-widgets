Build the Content Editor for this widget. Create one tab called "Ticker". Keep the keys exactly as written.

**Words (required)**

- Where the words come from | key: source | type: dropdown | default: words | options: words, professions | help: "words" shows the list you type below. "professions" shows the industries that have live jobs on this site (most roles first).
- Words | key: words | type: textarea (tall, at least 8 rows) | default: Accounting & Finance\nTechnology\nData & Analytics\nSales & Marketing\nConstruction\nHealthcare\nBanking & Compliance\nEducation | help: One word or phrase per line. Used when the source is "words".
- Most professions to show | key: maxWords | type: number | default: 12 | help: Used when the source is "professions". Between 1 and 60.

**Movement**

- Seconds for one full loop | key: speed | type: number | default: 40 | help: A bigger number is slower. Between 5 and 300.
- Direction | key: direction | type: dropdown | default: rtl | options: rtl, ltr | help: rtl scrolls right to left, ltr scrolls left to right.
- Pause when hovered | key: pauseOnHover | type: toggle | default: true | help: The band stops while the pointer is over it.
- Dot between words | key: showSeparator | type: toggle | default: true | help: Show a small dot after each word.
