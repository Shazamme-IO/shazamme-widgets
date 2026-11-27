Build the Content Editor for this widget. Create one tab called "Tiles". Keep the keys exactly as written.

**Tiles (required)**

- Tiles | key: tiles | type: list (repeatable items, at most 12) | default: the five items below | help: One item per tile, left to right and top to bottom. A tile with a live number that has no data yet is left out.
  - Number from | key: source | type: dropdown | default: custom | options: jobs, industries, countries, consultants, custom | help: "jobs" counts the site's open roles, "industries" counts the different industries with open roles, "countries" counts the different countries with open roles, "consultants" counts the consultants shown on the site. "custom" shows the Typed value.
  - Typed value | key: value | type: text | default: (blank) | help: Used when "Number from" is custom. Any text, for example 24 or London · Cupertino.
  - Mark after the number | key: suffix | type: text | default: (blank) | help: Optional, shown in the accent colour straight after the number, for example . or +
  - Label | key: label | type: text | default: (blank) | help: Short heading for the tile, for example Industries.
  - Line of text | key: text | type: textarea | default: (blank) | help: One short sentence under the number.
  - Tile width | key: size | type: dropdown | default: 1 | options: 1, 2 | help: How many columns the tile covers on desktop and tablet. On a phone every tile is full width.
  - Tile style | key: style | type: dropdown | default: dark | options: dark, accent | help: dark is the navy card. accent is the bright highlight card.
  - Button text | key: linkText | type: text | default: (blank) | help: Optional. Shows a button on the tile when the address below is also filled in.
  - Button address | key: linkUrl | type: link | default: (blank) | help: A page on this site (starting with /) or a full https:// address.

Default items (use these as the starting list):

1. source: jobs | suffix: . | label: Live right now | text: Open roles with salary, location and work model on every advert, straight from our ATS. | size: 2 | style: dark
2. source: industries | label: Industries | text: From accounting to mining, healthcare to real estate. | size: 1 | style: dark
3. source: countries | label: Countries | text: Australia, the United Kingdom and the United States. | size: 1 | style: dark
4. source: consultants | label: Specialist consultants | text: Each one focused on a single market. | size: 1 | style: dark
5. source: custom | value: London · Cupertino | text: Two offices, one team, working across every time zone we hire in. | size: 2 | style: accent | linkText: Visit us | linkUrl: /about
