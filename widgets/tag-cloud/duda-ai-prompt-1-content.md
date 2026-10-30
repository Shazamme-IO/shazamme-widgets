Build the Content Editor for this widget. Create one tab called "Tags". Keep the keys exactly as written.

**Required (every site fills these in)**

- Groups | key: groups | type: list (repeatable items) | default: one empty item | help: Each group is a heading with its tags. Add one group for a single plain cloud (leave the heading blank).
  - Heading | key: heading | type: text | default: (blank) | help: Optional title above this group's tags.
  - Tags | key: tags | type: textarea (tall, at least 10 rows) | default: (blank) | help: One tag per line. Paste hundreds at once; blank lines are ignored.

**Links**

- Link each tag to the job search | key: linkEnabled | type: toggle | default: true | help: On: each tag is a link. Off: tags are plain labels.
- Link address | key: linkPattern | type: text | default: /job-results?search={tag} | help: Where a tag goes. {tag} is replaced by the tag text. Use a path starting with / or a full https:// address.

**Layout**

- Heading level | key: headingTag | type: dropdown | default: h3 | options: h2, h3, h4, h5, p | help: Use the level that fits the page outline. The text size is set in the Design Editor, not here.
- Columns on desktop | key: columnsDesktop | type: number | default: 0 | help: 0 lets tags wrap freely. 2 to 8 puts them in an even grid.
- Columns on mobile | key: columnsMobile | type: number | default: 0 | help: 0 lets tags wrap freely. 1 to 3 puts them in an even grid.
