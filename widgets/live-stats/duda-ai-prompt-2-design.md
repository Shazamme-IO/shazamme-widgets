Build the Design Editor for this widget. Every line is one style a site builder can change. Keep the selectors and properties exactly as written. Group under the headings.

**Grid**

- Columns on desktop (a CSS grid-template-columns value; the widget uses 2 columns from 768px to 1023px and 1 column below 768px) | selector: .shm-ls .shm-ls-grid | property: grid-template-columns | default: repeat(4, minmax(0, 1fr))
- Gap between tiles | selector: .shm-ls .shm-ls-grid | property: gap | default: 16px

**Dark tiles**

- Tile background | selector: .shm-ls .shm-ls-tile | property: background-color | default: #1A2036
- Tile text colour | selector: .shm-ls .shm-ls-tile | property: color | default: #F7F5EF
- Tile border | selector: .shm-ls .shm-ls-tile | property: border | default: 1px solid rgba(247,245,239,0.1)
- Tile corner radius | selector: .shm-ls .shm-ls-tile | property: border-radius | default: 20px
- Tile padding | selector: .shm-ls .shm-ls-tile | property: padding | default: 32px
- Wide tile padding | selector: .shm-ls .shm-ls-tile.is-wide | property: padding | default: 36px
- Wide tile minimum height | selector: .shm-ls .shm-ls-tile.is-wide | property: min-height | default: 280px
- Space between tile parts | selector: .shm-ls .shm-ls-tile | property: gap | default: 24px

**Accent tiles**

- Accent background | selector: .shm-ls .shm-ls-tile.is-accent | property: background-color | default: #D4F34A
- Accent text colour | selector: .shm-ls .shm-ls-tile.is-accent | property: color | default: #101423
- Accent padding | selector: .shm-ls .shm-ls-tile.is-accent | property: padding | default: 32px 36px
- Accent big text colour | selector: .shm-ls .shm-ls-tile.is-accent .shm-ls-number | property: color | default: #101423
- Accent big text size | selector: .shm-ls .shm-ls-tile.is-accent .shm-ls-number | property: font-size | default: clamp(40px, 4vw, 56px)
- Accent line of text colour | selector: .shm-ls .shm-ls-tile.is-accent .shm-ls-text | property: color | default: #101423
- Accent line of text size | selector: .shm-ls .shm-ls-tile.is-accent .shm-ls-text | property: font-size | default: 16px

**Numbers**

- Number font | selector: .shm-ls .shm-ls-number | property: font-family | default: Montserrat, sans-serif
- Number size | selector: .shm-ls .shm-ls-number | property: font-size | default: 64px
- Number weight | selector: .shm-ls .shm-ls-number | property: font-weight | default: 900
- Number italic (italic or normal) | selector: .shm-ls .shm-ls-number | property: font-style | default: italic
- Number colour | selector: .shm-ls .shm-ls-number | property: color | default: #F7F5EF
- Wide tile number size | selector: .shm-ls .shm-ls-tile.is-wide .shm-ls-number | property: font-size | default: clamp(72px, 8vw, 120px)
- Wide tile number letter spacing | selector: .shm-ls .shm-ls-tile.is-wide .shm-ls-number | property: letter-spacing | default: -0.04em
- Mark after the number colour | selector: .shm-ls .shm-ls-suffix | property: color | default: #D4F34A

**Labels and text**

- Label colour | selector: .shm-ls .shm-ls-label | property: color | default: #D4F34A
- Label size | selector: .shm-ls .shm-ls-label | property: font-size | default: 12px
- Label weight | selector: .shm-ls .shm-ls-label | property: font-weight | default: 700
- Label letter spacing | selector: .shm-ls .shm-ls-label | property: letter-spacing | default: 0.14em
- Label capitals (uppercase or none) | selector: .shm-ls .shm-ls-label | property: text-transform | default: uppercase
- Label line colour on wide tiles | selector: .shm-ls .shm-ls-tile.is-wide > .shm-ls-label::before | property: background-color | default: #D4F34A
- Line of text colour | selector: .shm-ls .shm-ls-text | property: color | default: #C9CCD6
- Line of text size | selector: .shm-ls .shm-ls-text | property: font-size | default: 15px
- Wide tile line of text size | selector: .shm-ls .shm-ls-tile.is-wide .shm-ls-text | property: font-size | default: 18px

**Button on dark tiles**

- Background | selector: .shm-ls .shm-ls-tile.is-dark .shm-ls-link | property: background-color | default: #D4F34A
- Text colour | selector: .shm-ls .shm-ls-tile.is-dark .shm-ls-link | property: color | default: #101423
- Border colour | selector: .shm-ls .shm-ls-tile.is-dark .shm-ls-link | property: border-color | default: #D4F34A
- Hover background | selector: .shm-ls .shm-ls-tile.is-dark .shm-ls-link:hover | property: background-color | default: #F7F5EF
- Hover text colour | selector: .shm-ls .shm-ls-tile.is-dark .shm-ls-link:hover | property: color | default: #101423

**Button on accent tiles**

- Background | selector: .shm-ls .shm-ls-tile.is-accent .shm-ls-link | property: background-color | default: #101423
- Text colour | selector: .shm-ls .shm-ls-tile.is-accent .shm-ls-link | property: color | default: #F7F5EF
- Border colour | selector: .shm-ls .shm-ls-tile.is-accent .shm-ls-link | property: border-color | default: #101423
- Hover background | selector: .shm-ls .shm-ls-tile.is-accent .shm-ls-link:hover | property: background-color | default: #3A4056
- Hover text colour | selector: .shm-ls .shm-ls-tile.is-accent .shm-ls-link:hover | property: color | default: #F7F5EF

**Button shape (both styles)**

- Corner radius | selector: .shm-ls .shm-ls-link | property: border-radius | default: 999px
- Padding | selector: .shm-ls .shm-ls-link | property: padding | default: 14px 32px
- Text size | selector: .shm-ls .shm-ls-link | property: font-size | default: 15px
- Text weight | selector: .shm-ls .shm-ls-link | property: font-weight | default: 700
