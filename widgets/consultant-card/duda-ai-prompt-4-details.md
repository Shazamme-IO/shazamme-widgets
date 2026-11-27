Add a tab called "Photo and details" to the Content Editor of this widget. Add these fields to that tab only. Keep the keys exactly as written. Every field has a default that keeps today's card (initials, name, job title, live roles).

**Tab: Photo and details**

Picture
- Picture | key: avatar | type: dropdown | default: initials | options: initials, photo, photo-with-initials-fallback | help: Initials shows a badge with the consultant's initials. Photo shows the photo from the Shazamme console (a plain placeholder when there is none). Photo with initials fallback shows the photo, or the initials when there is no photo or it cannot load.
- Card layout | key: itemLayout | type: dropdown | default: stacked | options: stacked, side, portrait | help: Stacked puts the picture above the name. Side puts it beside the name. Portrait makes the picture the full width of the card.
- Alignment | key: align | type: dropdown | default: left | options: left, center | help: Lines up the picture and text on the left or in the centre of the card.

More about the consultant
- Show location | key: showLocation | type: toggle | default: false | help: The consultant's office or location from the Shazamme console.
- Show a pin icon before the location | key: showLocationIcon | type: toggle | default: false | help: Only used when Show location is on.
- Show sector | key: showSector | type: toggle | default: false | help: The consultant's sector (classification) from the Shazamme console.
- Show short description | key: showDescription | type: toggle | default: false | help: The short description from the Shazamme console.
- Description lines | key: descriptionLines | type: number | default: 3 | help: Longer descriptions are cut after this many lines. 0 shows all of it.

Profile button and links
- Show a profile button | key: showButton | type: toggle | default: false | help: A button on each card that opens the consultant's profile page.
- Button text | key: buttonText | type: text | default: View profile | help: The words on the button.
- Profile page | key: profilePage | type: text | default: (empty) | help: Leave empty to use each consultant's own page. Type a page path such as consultant to send the name and the button to that page plus the consultant's name.
- Open the profile in a new tab | key: newTab | type: toggle | default: false | help: Applies to the name link and the button.
