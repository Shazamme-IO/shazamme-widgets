# Google Reviews: Duda AI prompt (Content Editor + Design options)

Paste everything below the line into Duda's AI in Widget Builder. It creates
the settings panel. Every key must match exactly: the widget reads
`data.config.<key>`. Leave a field empty to use its default.

---

Create a Content Editor for this widget with these tabs and fields, in this
order. Use the key exactly as written. Dropdown values are the text before
the "=" (show the text after it as the label).

## Tab 1: Source
- Google Place ID | key: placeId | type: text | default: (empty) | help: Use the business finder shown above the widget in the editor: type the company name, pick it, then paste the Place ID it shows here.
- Or business name and suburb | key: businessSearch | type: text | default: (empty) | help: Only if you have no Place ID, e.g. "Acme Recruitment, Sydney NSW". Google picks the closest match.
- Review language | key: language | type: text | default: en | help: e.g. en, en-GB.

## Tab 2: Layout
- Layout | key: layout | type: dropdown | default: carousel | options: carousel=Carousel, slider=Slider, grid=Grid, list=List, masonry=Masonry, cardBadge=Badge
- Columns | key: carouselColumnsMode | type: dropdown | default: auto | options: auto=Auto, custom=Custom
- Columns, large desktop | key: carouselColumnsDesktopLarge | type: number | default: 4
- Columns, desktop | key: carouselColumnsDesktopMedium | type: number | default: 3
- Columns, small desktop | key: carouselColumnsDesktopSmall | type: number | default: 3
- Columns, tablet | key: carouselColumnsTablet | type: number | default: 2
- Columns, mobile | key: carouselColumnsMobile | type: number | default: 1
- Space between cards (px) | key: carouselItemSpacing | type: number | default: 20
- Autoplay | key: carouselAutoplay | type: toggle | default: off
- Autoplay speed (ms) | key: carouselAutoplayInterval | type: number | default: 5000
- Pause on hover | key: carouselAutoplayPauseOnHover | type: toggle | default: on
- Show arrows | key: carouselArrowsEnable | type: toggle | default: on
- Show arrows on mobile | key: carouselArrowsOnMobileEnable | type: toggle | default: on
- Show dots | key: carouselPagination | type: toggle | default: on
- Grid/masonry columns | key: gridColumnsMode | type: dropdown | default: auto | options: auto=Auto, custom=Custom
- Grid columns, desktop | key: gridColumnsDesktopLarge | type: number | default: 5
- Grid rows before "Load more" | key: gridRows | type: number | default: 3
- Reviews per page (list and masonry) | key: listItemsPerPage | type: number | default: 8
- Show "Load more" button | key: showLoadMoreButton | type: toggle | default: on
- Maximum width (px, empty = full width) | key: widgetMaxWidth | type: number | default: (empty)

## Tab 3: Header
- Show title | key: widgetTitle | type: toggle | default: off
- Title | key: widgetTitleTitle | type: text | default: What Our Customers Say
- Subtitle | key: widgetTitleCaption | type: text | default: (empty)
- Show overall rating header | key: showOverallRating | type: toggle | default: on
- Header style | key: headerLayout | type: dropdown | default: header1 | options: header1=Google Reviews bar, header2=Excellent on Google, header4=Compact row, header7=Centred row, header9=Centred stack
- Header shows | key: headerElements | type: text | default: title, rating, reviewsNumber | help: Any of: title, rating, reviewsNumber (comma separated).
- Show "Review us on Google" button | key: showWriteReviewButton | type: toggle | default: on

## Tab 4: Reviews
- Card style | key: reviewLayout | type: dropdown | default: classic | options: classic=Classic, balloon=Speech bubble, spotlight=Spotlight (centred)
- Google logo style | key: reviewSourceStyle | type: dropdown | default: text | options: text=“on Google” text, logo=“on” + Google logo, icon=G on photo, logoBottom=Google logo at bottom, iconBottom=“Posted on Google” at bottom
- Show reviewer photo | key: reviewDisplayAuthorPicture | type: toggle | default: on
- Show reviewer name | key: reviewDisplayAuthorName | type: toggle | default: on
- Name format | key: reviewAuthorNameFormat | type: dropdown | default: fullName | options: fullName=Full name, firstName=First name, firstNameLastInitial=First name + initial
- Show verified badge | key: reviewDisplayVerifiedBadge | type: toggle | default: on
- Show date | key: reviewDisplayDate | type: toggle | default: on
- Show stars | key: reviewDisplayRating | type: toggle | default: on
- Show Google source | key: reviewDisplaySource | type: toggle | default: on
- Show owner replies (in popup) | key: reviewDisplayOwnerReply | type: toggle | default: on
- Text | key: reviewTextDisplayMode | type: dropdown | default: short | options: short=Short with “Read more”, full=Full text
- Lines before “Read more” | key: reviewPreviewLinesNumber | type: number | default: 4
- Equal card heights | key: reviewHeightNormalization | type: toggle | default: on

## Tab 5: Filters
- Minimum stars | key: filterMinRating | type: dropdown | default: 4 | options: 1=1+, 2=2+, 3=3+, 4=4+, 5=5 only
- Only reviews with text | key: displayReviewsOnlyWithText | type: toggle | default: on
- Only reviews mentioning | key: includeKeywords | type: text | default: (empty) | help: Comma separated, e.g. a consultant's name.
- Hide reviews mentioning | key: excludeKeywords | type: text | default: (empty) | help: Comma separated.
- Sort by | key: sorting | type: dropdown | default: date | options: date=Newest first, rating=Highest rated, random=Random
- Limit number of reviews | key: limitTotalNumberOfItems | type: toggle | default: off
- Maximum reviews | key: totalNumberOfItems | type: number | default: 100

## Tab 6: Badge (Badge layout only)
- Badge position | key: badgeDisplayMode | type: dropdown | default: singleInline | options: singleInline=In the page, singleFloating=Floating corner
- Floating corner | key: badgeFloatingPosition | type: dropdown | default: bottom-left | options: bottom-left=Bottom left, bottom-right=Bottom right, top-left=Top left, top-right=Top right
- Alignment (in the page) | key: badgeInlinePosition | type: dropdown | default: center | options: left=Left, center=Centre, right=Right
- Size | key: badgeSize | type: dropdown | default: medium | options: small=Small, medium=Medium, large=Large
- Label | key: badgeLabelCustomText | type: text | default: Google Rating
- Show number of reviews | key: badgeDisplayNumberOfReviews | type: toggle | default: on
- Show close button | key: badgeCloseButton | type: toggle | default: on
- On click | key: badgeClickAction | type: dropdown | default: openPopup | options: openPopup=Open reviews popup, openLink=Open Google, none=Nothing

## Tab 7: Style
- Font (Google Font name, empty = site font) | key: fontFamily | type: text | default: (empty)
- Widget background | key: widgetBackgroundColor | type: colour | default: transparent
- Title colour | key: widgetTitleTitleColor | type: colour | default: #111111
- Title size (px) | key: widgetTitleFontSize | type: number | default: 24
- Card background | key: reviewBackgroundColor | type: colour | default: #f8f8f8
- Card border | key: reviewOutlineColor | type: colour | default: rgba(17,17,17,0.1)
- Card text | key: reviewTextColor | type: colour | default: #111111
- Card corner radius (px) | key: reviewCornerRadius | type: number | default: 8
- Review text size (px) | key: reviewTextFontSize | type: number | default: 16
- Star colour | key: ratingColor | type: colour | default: #fcbf02
- “Read more” colour | key: reviewReadMoreColor | type: colour | default: #006dff
- Verified badge colour | key: reviewVerifiedBadgeColor | type: colour | default: #006dff
- Header background | key: headerBackgroundColor | type: colour | default: transparent
- Header text | key: headerTextColor | type: colour | default: #111111
- Button colour | key: writeReviewButtonColor | type: colour | default: #006dff
- Button text colour | key: writeReviewButtonTextColor | type: colour | default: #ffffff
- Button corner radius (px) | key: writeReviewButtonRadius | type: number | default: 24
- Arrow background | key: carouselArrowBackgroundColor | type: colour | default: rgba(17,17,17,0.5)
- Arrow colour | key: carouselArrowColor | type: colour | default: #ffffff
- Dots colour | key: carouselPaginationColor | type: colour | default: #111111
- Popup background | key: popupBackgroundColor | type: colour | default: #ffffff
- Popup text | key: popupTextColor | type: colour | default: #111111
- Badge background | key: badgeBackgroundColor | type: colour | default: #ffffff
- Badge text | key: badgeTextColor | type: colour | default: #111111

## Tab 8: Advanced
- Add Google review rich snippets (schema.org) | key: enableSchemaOrg | type: toggle | default: on
- Open links in a new tab | key: openLinksInNewTab | type: toggle | default: on
- Custom CSS | key: customCSS | type: textarea | default: (empty)
