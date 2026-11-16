Build the Content Editor for this widget, part 1 of 2. Create two tabs: "Cards" and "Flip and links". Keep the keys exactly as written.

**Tab: Cards**

**Required (every site fills these in)**

- Cards | key: cards | type: list (repeatable items) | default: one empty item | help: One item per card. Add, remove and reorder them.
  - Photo | key: image | type: image | default: (blank) | help: The picture on the front of the card.
  - Photo description | key: alt | type: text | default: (blank) | help: Describes the photo for people who cannot see it. Leave blank if the photo is only decoration.
  - Title | key: title | type: text | default: (blank) | help: Shown on the front in the label over the photo. Also the card's name for screen readers.
  - Front line | key: frontLine | type: text | default: (blank) | help: Optional short line under the title on the front.
  - Back heading | key: backHeading | type: text | default: (blank) | help: Heading on the back of the card.
  - Back text | key: backText | type: textarea | default: (blank) | help: The text on the back. Long text is fine: the card grows or scrolls, depending on the Height settings.
  - Link | key: link | type: link | default: (blank) | help: Where the card goes on the second tap or click. Leave blank for a card with no link.
  - Button text | key: buttonText | type: text | default: (blank) | help: Optional. Shows a button on the back. Needs a link.

**Tab: Flip and links**

- Card effect | key: flipStyle | type: dropdown | default: flip | options: flip, fade, none | help: Flip turns the card over. Fade crossfades between sides. None shows only the front, and a card with a link goes straight to it.
- Flip direction | key: flipDirection | type: dropdown | default: horizontal | options: horizontal, vertical | help: Which way the card turns. Only used when the effect is Flip.
- Flip speed in milliseconds | key: flipSpeed | type: number | default: 600 | help: 0 to 3000. Lower is faster.
- Flip when the mouse is over a card | key: flipOnHover | type: toggle | default: true | help: On: a mouse hover flips the card. Off: a click flips it. Touch always uses tap.
- Heading level | key: headingTag | type: dropdown | default: h3 | options: h2, h3, h4, h5, p, div | help: Use the level that fits the page outline. Text size is set in the Design Editor.
- Open links in a new tab | key: openInNewTab | type: toggle | default: false | help: On: card links open in a new tab.
