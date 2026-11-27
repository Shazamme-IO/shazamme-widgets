Build the Design Editor for the "Job Hero Chips" widget. Every line is one style a site builder can change. Keep the selectors and properties exactly as written. Group under the headings. The defaults are made for a dark header.

**Chip row**

- Space between chips | selector: .shm-jc .shm-jc-list | property: gap | default: 10px
- Chip alignment | selector: .shm-jc .shm-jc-list | property: justify-content | default: flex-start
- Space kept free while the job loads | selector: .shm-jc:not(.is-ready):not(.is-empty) | property: min-height | default: 40px

**Chips**

- Chip background | selector: .shm-jc .shm-jc-chip | property: background-color | default: rgba(247, 245, 239, 0.12)
- Chip text colour | selector: .shm-jc .shm-jc-chip | property: color | default: #F7F5EF
- Chip text size | selector: .shm-jc .shm-jc-chip | property: font-size | default: 15px
- Chip text weight | selector: .shm-jc .shm-jc-chip | property: font-weight | default: 600
- Chip font | selector: .shm-jc .shm-jc-chip | property: font-family | default: inherit
- Chip height | selector: .shm-jc .shm-jc-chip | property: min-height | default: 40px
- Chip inner space | selector: .shm-jc .shm-jc-chip | property: padding | default: 0 16px
- Chip corner radius | selector: .shm-jc .shm-jc-chip | property: border-radius | default: 999px
- Chip border | selector: .shm-jc .shm-jc-chip | property: border | default: 0
- Space between pin and text | selector: .shm-jc .shm-jc-chip | property: gap | default: 8px
- Pin colour | selector: .shm-jc .shm-jc-icon | property: color | default: #D4F34A

**Highlighted salary chip**

- Highlight background | selector: .shm-jc .shm-jc-chip.is-highlight | property: background-color | default: #D4F34A
- Highlight text colour | selector: .shm-jc .shm-jc-chip.is-highlight | property: color | default: #101423
- Highlight text weight | selector: .shm-jc .shm-jc-chip.is-highlight | property: font-weight | default: 700
