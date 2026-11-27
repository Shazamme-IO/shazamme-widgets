Build the Content Editor for this widget. Create one tab called "Job cards". Keep the keys exactly as written.

**What each card shows**

- Small label above the title | key: cardLabel | type: dropdown | default: profession | options: profession, role, none
- Heading level of the job title | key: headingTag | type: dropdown | default: h3 | options: h2, h3, h4, p | help: Pick the level that fits the page outline. The size is set in the Design editor.
- Show salary | key: showSalary | type: toggle | default: true | help: The amount from the advert with its wording, for example $150,000 – $170,000 + super.
- Text when a job has no salary | key: noSalaryText | type: text | default: Competitive | help: Leave blank to show nothing.
- How a location is written | key: locationFormat | type: dropdown | default: city-state | options: city, city-state, city-country, city-state-country | help: city-state gives Sydney, NSW.
- Show work type | key: showWorkType | type: toggle | default: true | help: For example Permanent or Contract.
- Show work model | key: showWorkModel | type: toggle | default: false | help: For example Hybrid or Remote.

**When nothing matches**

- Heading when no jobs match | key: emptyTitle | type: text | default: No jobs match your search
- Text when no jobs match | key: emptyText | type: text | default: Try removing a filter or searching for something broader.
- Text when the site has no live jobs | key: noJobsText | type: text | default: There are no live jobs right now. Check back soon.
- Text when the jobs could not be loaded | key: loadErrorText | type: text | default: We couldn't load the jobs just now. Please try again.
- Retry button text | key: retryText | type: text | default: Try again
