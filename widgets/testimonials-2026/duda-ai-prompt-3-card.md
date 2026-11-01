Add a tab called "Card" to the Content Editor of this widget. Add these fields to that tab only. Keep the keys exactly as written.

**Tab: Card**

What shows on each testimonial
- Show photo | key: showPhoto | type: toggle | default: true | help: Shows the person's photo, or their initials when there is no photo.
- Show quote mark | key: showQuoteMark | type: toggle | default: true | help: A large opening quote mark above the text.
- Show star rating | key: showRating | type: toggle | default: true | help: Only shows for testimonials that have a rating.
- Show job title | key: showPosition | type: toggle | default: true | help: The person's position.
- Show company | key: showCompany | type: toggle | default: true | help: The person's company.
- Show date | key: showDate | type: toggle | default: false | help: The date of the testimonial.
- Date style | key: dateFormat | type: dropdown | default: month-year | options: long, month-year, year | help: Long is 4 May 2023. Month-year is May 2023.
- Show consultant | key: showConsultant | type: toggle | default: false | help: Shows which consultant the testimonial is about.
- Consultant label | key: consultantLabel | type: text | default: Consultant | help: Words before the consultant's name. Empty shows just the name.
- Link consultant name | key: linkConsultant | type: toggle | default: true | help: Links the name to the consultant's page.

Long quotes
- Lines to show | key: quoteLines | type: number | default: 6 | help: Longer quotes are cut off after this many lines. 0 shows the whole quote.
- Read more | key: readMore | type: dropdown | default: dialog | options: dialog, expand, off | help: Dialog opens the full quote in a pop-up. Expand opens it in place. Off shows the whole quote with no button.
- Read more text | key: readMoreText | type: text | default: Read more | help: The label on the button.
- Read less text | key: readLessText | type: text | default: Read less | help: The label after a quote is expanded in place.
