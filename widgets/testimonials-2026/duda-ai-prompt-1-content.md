Build the Content Editor for this widget. Create five tabs: "Content", "Layout", "Card", "Slider" and "SEO". This prompt is for the first tab only, "Content". Keep the keys exactly as written. Every field has a default, so the widget works with nothing filled in.

**Tab: Content**

Heading and text (these are written into the page, so search engines read them)
- Heading | key: heading | type: text | default: (empty) | help: Shown above the testimonials. Leave empty for no heading.
- Intro text | key: intro | type: textarea | default: (empty) | help: A short line under the heading. Leave empty for none.
- Heading level | key: headingLevel | type: dropdown | default: 2 | options: 1, 2, 3, 4, 5, 6 | help: Use 1 only if this is the main heading of the page.

Which testimonials
- Only show these tags | key: tags | type: text | default: (empty) | help: Separate tags with commas, for example Candidate, Client. Capital letters and spaces do not matter. Empty shows every testimonial.
- Only this consultant | key: consultantID | type: text | default: (empty) | help: Paste a Consultant ID to show only that consultant's testimonials. Empty shows everyone.
- Order | key: sortOrder | type: dropdown | default: newest | options: newest, oldest, random, manual | help: Manual keeps the order of the Testimonials collection.
- Maximum to show | key: maxTestimonials | type: number | default: 0 | help: 0 shows all of them.
- Site ID | key: siteId | type: text | default: (empty) | help: Leave empty. Only needed to show another site's testimonials.
