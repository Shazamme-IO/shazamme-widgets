Build the third part of the Design Editor for this widget: the proof wall layout. Every line is one style a site builder can change. Keep the selectors and properties exactly as written. Group under the headings. These styles only apply when the layout is wall. The defaults suit a dark navy section; on a light section change the card and text colours.

**Wall cards**

- Heading colour | selector: .shm-tm.is-layout-wall .shm-tm-heading | property: color | default: #f7f5ef
- Intro colour | selector: .shm-tm.is-layout-wall .shm-tm-intro | property: color | default: #c9ccd6
- Space between cards | selector: .shm-tm.is-layout-wall .shm-tm-grid | property: gap | default: 16px
- Card background | selector: .shm-tm.is-layout-wall .shm-tm-card | property: background-color | default: #1a2036
- Card border | selector: .shm-tm.is-layout-wall .shm-tm-card | property: border | default: 1px solid rgba(247, 245, 239, 0.1)
- Card corner radius | selector: .shm-tm.is-layout-wall .shm-tm-card | property: border-radius | default: 20px
- Card inner space | selector: .shm-tm.is-layout-wall .shm-tm-card | property: padding | default: 32px
- Space inside the card | selector: .shm-tm.is-layout-wall .shm-tm-card | property: gap | default: 28px
- Quote colour | selector: .shm-tm.is-layout-wall .shm-tm-quote | property: color | default: #f7f5ef
- Quote size | selector: .shm-tm.is-layout-wall .shm-tm-quote | property: font-size | default: 20px
- Quote style | selector: .shm-tm.is-layout-wall .shm-tm-quote | property: font-style | default: italic
- Quote line height | selector: .shm-tm.is-layout-wall .shm-tm-quote | property: line-height | default: 1.5
- Star colour | selector: .shm-tm.is-layout-wall .shm-tm-stars | property: color | default: #d4f34a
- Empty star colour | selector: .shm-tm.is-layout-wall .shm-tm-stars-off | property: color | default: #6b7080
- Read more colour | selector: .shm-tm.is-layout-wall .shm-tm-more | property: color | default: #d4f34a

**Initials badge and name**

- Badge size (width) | selector: .shm-tm.is-layout-wall .shm-tm-photo | property: width | default: 44px
- Badge size (height) | selector: .shm-tm.is-layout-wall .shm-tm-photo | property: height | default: 44px
- Badge shape | selector: .shm-tm.is-layout-wall .shm-tm-photo | property: border-radius | default: 50%
- Badge background | selector: .shm-tm.is-layout-wall .shm-tm-initials | property: background-color | default: #d4f34a
- Badge text colour | selector: .shm-tm.is-layout-wall .shm-tm-initials | property: color | default: #101423
- Badge text size | selector: .shm-tm.is-layout-wall .shm-tm-initials | property: font-size | default: 16px
- Badge text weight | selector: .shm-tm.is-layout-wall .shm-tm-initials | property: font-weight | default: 800
- Bold line colour | selector: .shm-tm.is-layout-wall .shm-tm-name | property: color | default: #f7f5ef
- Bold line size | selector: .shm-tm.is-layout-wall .shm-tm-name | property: font-size | default: 16px
- Bold line weight | selector: .shm-tm.is-layout-wall .shm-tm-name | property: font-weight | default: 700
- Second line colour | selector: .shm-tm.is-layout-wall .shm-tm-role | property: color | default: #aeb3c2
- Second line size | selector: .shm-tm.is-layout-wall .shm-tm-role | property: font-size | default: 14px
- Date colour | selector: .shm-tm.is-layout-wall .shm-tm-date | property: color | default: #aeb3c2
- Consultant colour | selector: .shm-tm.is-layout-wall .shm-tm-consultant | property: color | default: #aeb3c2
- Consultant link colour | selector: .shm-tm.is-layout-wall .shm-tm-consultant-link | property: color | default: #d4f34a

**Highlighted card**

- Highlight background | selector: .shm-tm.is-layout-wall .shm-tm-card.is-accent | property: background-color | default: #d4f34a
- Highlight border colour | selector: .shm-tm.is-layout-wall .shm-tm-card.is-accent | property: border-color | default: transparent
- Highlight quote colour | selector: .shm-tm.is-layout-wall .shm-tm-card.is-accent .shm-tm-quote | property: color | default: #101423
- Highlight bold line colour | selector: .shm-tm.is-layout-wall .shm-tm-card.is-accent .shm-tm-name | property: color | default: #101423
- Highlight second line colour | selector: .shm-tm.is-layout-wall .shm-tm-card.is-accent .shm-tm-role | property: color | default: #3a4a00
- Highlight badge background | selector: .shm-tm.is-layout-wall .shm-tm-card.is-accent .shm-tm-initials | property: background-color | default: #101423
- Highlight badge text colour | selector: .shm-tm.is-layout-wall .shm-tm-card.is-accent .shm-tm-initials | property: color | default: #f7f5ef
- Highlight star colour | selector: .shm-tm.is-layout-wall .shm-tm-card.is-accent .shm-tm-stars | property: color | default: #101423
- Highlight read more colour | selector: .shm-tm.is-layout-wall .shm-tm-card.is-accent .shm-tm-more | property: color | default: #101423

**Buttons**

- Filter button border | selector: .shm-tm.is-layout-wall .shm-tm-chip | property: border-color | default: rgba(247, 245, 239, 0.5)
- Filter button text | selector: .shm-tm.is-layout-wall .shm-tm-chip | property: color | default: #f7f5ef
- Selected filter background | selector: .shm-tm.is-layout-wall .shm-tm-chip[aria-pressed="true"] | property: background-color | default: #d4f34a
- Selected filter text | selector: .shm-tm.is-layout-wall .shm-tm-chip[aria-pressed="true"] | property: color | default: #101423
- Show more button border | selector: .shm-tm.is-layout-wall .shm-tm-loadmore | property: border-color | default: #f7f5ef
- Show more button text | selector: .shm-tm.is-layout-wall .shm-tm-loadmore | property: color | default: #f7f5ef
- Show more hover background | selector: .shm-tm.is-layout-wall .shm-tm-loadmore:hover | property: background-color | default: #d4f34a
- Show more hover text | selector: .shm-tm.is-layout-wall .shm-tm-loadmore:hover | property: color | default: #101423
- Focus outline | selector: .shm-tm.is-layout-wall :focus-visible | property: outline-color | default: #d4f34a
