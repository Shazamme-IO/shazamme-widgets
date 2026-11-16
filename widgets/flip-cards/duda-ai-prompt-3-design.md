Build the Design Editor for this widget. Every line is one style a site builder can change. Keep the selectors and properties exactly as written. Group under the headings.

**Front of the card**

- Photo overlay colour and strength (use a colour with transparency, for example rgba(0,0,0,0.4)) | selector: .shm-flip-cards .shm-fc-overlay | property: background-color | default: rgba(0, 0, 0, 0.25)
- Colour behind the photo | selector: .shm-flip-cards .shm-fc-front | property: background-color | default: #d9dde3
- Caption position, up or down (flex-start, center, flex-end) | selector: .shm-flip-cards .shm-fc-front | property: justify-content | default: flex-end
- Caption position, left or right (flex-start, center, flex-end) | selector: .shm-flip-cards .shm-fc-caption | property: align-self | default: flex-start
- Space around the caption | selector: .shm-flip-cards .shm-fc-front | property: padding | default: 16px
- Caption label background | selector: .shm-flip-cards .shm-fc-caption | property: background-color | default: #ffffff
- Caption label text colour | selector: .shm-flip-cards .shm-fc-caption | property: color | default: #101920
- Caption label corner radius | selector: .shm-flip-cards .shm-fc-caption | property: border-radius | default: 8px
- Caption label padding | selector: .shm-flip-cards .shm-fc-caption | property: padding | default: 8px 14px
- Title text size | selector: .shm-flip-cards .shm-fc-title | property: font-size | default: 18px
- Title text weight | selector: .shm-flip-cards .shm-fc-title | property: font-weight | default: 700
- Front line text size | selector: .shm-flip-cards .shm-fc-line | property: font-size | default: 14px
- Front line text weight | selector: .shm-flip-cards .shm-fc-line | property: font-weight | default: 400

**Back of the card**

- Back background | selector: .shm-flip-cards .shm-fc-back | property: background-color | default: #1f2a37
- Back text colour | selector: .shm-flip-cards .shm-fc-back | property: color | default: #ffffff
- Space inside the back | selector: .shm-flip-cards .shm-fc-back-body | property: padding | default: 24px
- Back text alignment (left, center, right) | selector: .shm-flip-cards .shm-fc-back-body | property: text-align | default: left
- Back heading size | selector: .shm-flip-cards .shm-fc-back-heading | property: font-size | default: 22px
- Back heading weight | selector: .shm-flip-cards .shm-fc-back-heading | property: font-weight | default: 700
- Back heading colour | selector: .shm-flip-cards .shm-fc-back-heading | property: color | default: inherit
- Space under back heading | selector: .shm-flip-cards .shm-fc-back-heading | property: margin-bottom | default: 12px
- Back text size | selector: .shm-flip-cards .shm-fc-back-text | property: font-size | default: 16px
- Back text line height | selector: .shm-flip-cards .shm-fc-back-text | property: line-height | default: 1.5
- Back text weight | selector: .shm-flip-cards .shm-fc-back-text | property: font-weight | default: 400

**Button on the back**

- Button background | selector: .shm-flip-cards .shm-fc-button | property: background-color | default: #ffffff
- Button text colour | selector: .shm-flip-cards .shm-fc-button | property: color | default: #1f2a37
- Button border colour | selector: .shm-flip-cards .shm-fc-button | property: border-color | default: #ffffff
- Button border width | selector: .shm-flip-cards .shm-fc-button | property: border-width | default: 2px
- Button corner radius | selector: .shm-flip-cards .shm-fc-button | property: border-radius | default: 999px
- Button text size | selector: .shm-flip-cards .shm-fc-button | property: font-size | default: 16px
- Button text weight | selector: .shm-flip-cards .shm-fc-button | property: font-weight | default: 600
- Button padding | selector: .shm-flip-cards .shm-fc-button | property: padding | default: 14px 32px
- Button hover background | selector: .shm-flip-cards .shm-fc-button:hover | property: background-color | default: transparent
- Button hover text colour | selector: .shm-flip-cards .shm-fc-button:hover | property: color | default: #ffffff
- Button hover border colour | selector: .shm-flip-cards .shm-fc-button:hover | property: border-color | default: #ffffff

**Keyboard focus**

- Focus ring colour | selector: .shm-flip-cards .shm-fc-card:focus-visible | property: outline-color | default: #101920
- Focus ring outer colour (a halo so the ring shows on dark and light backgrounds) | selector: .shm-flip-cards .shm-fc-card:focus-visible | property: box-shadow | default: 0 0 0 6px #ffffff
