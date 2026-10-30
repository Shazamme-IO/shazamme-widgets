Build the Content Editor for this widget. Create two tabs, "Text" and "Behaviour". Keep the keys exactly as written.

**Tab: Text (required)**

- Lead text | key: lead | type: textarea | help: The fixed words before the cycling word. A new line breaks the heading onto two lines. Default on one line, if the block below is misread: Bringing together / experts in (each " / " is a new line). | default (two lines, type them as two lines):
```
Bringing together
experts in
```
- Words | key: words | type: textarea (tall, at least 8 rows) | help: One word or phrase per line. They type out and delete in turn. The first line shows on load and is what search engines read. Default on one line, if the block below is misread: Change Management & Transformation / Cloud & DevOps / Data & Business Intelligence (each " / " is a new line). | default (three lines, type them as three lines):
```
Change Management & Transformation
Cloud & DevOps
Data & Business Intelligence
```
- Heading level | key: headingTag | type: dropdown | default: h2 | options: h1, h2, h3, h4 | help: Use h1 only once per page.
- Font size on desktop (px) | key: fontSizeDesktop | type: number | default: 52 | help: Numbers only, for screens 768px wide and up.
- Font size on mobile (px) | key: fontSizeMobile | type: number | default: 36 | help: Numbers only, for screens up to 767px wide.

**Tab: Behaviour**

- Keep looping | key: loop | type: toggle | default: true | help: Off: stops on the last word.
- Typing speed (ms per letter) | key: typeSpeed | type: number | default: 50 | help: Lower is faster.
- Deleting speed (ms per letter) | key: deleteSpeed | type: number | default: 25 | help: Lower is faster. 0 clears the word instantly.
- Pause on each word (ms) | key: pauseMs | type: number | default: 1500 | help: How long a finished word stays before it is deleted.
- Show cursor | key: showCursor | type: toggle | default: true | help: A blinking bar after the word.
- Cursor colour | key: cursorColor | type: text | default: (blank) | help: Any colour such as #1ba9cc. Blank uses the word colour.
- Show pause button | key: showPauseButton | type: toggle | default: true | help: A Pause animation button that appears when a keyboard user tabs to it. Leave on so keyboard visitors can stop the movement.
- Outlined words | key: outlined | type: toggle | default: false | help: On: the cycling words are drawn as an outline instead of solid. Set the outline colour and width in the Design Editor.
- Hold the heading height steady | key: reserveSpace | type: toggle | default: true | help: Stops the content below jumping when a long word wraps onto a second line.
