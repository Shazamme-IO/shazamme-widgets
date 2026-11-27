Build the Content Editor for this widget. Create one tab called "Results". Keep the keys exactly as written.

**Pages**

- Jobs per page | key: pageSize | type: number | default: 12 | help: Between 3 and 60.
- How more jobs are shown | key: paging | type: dropdown | default: pages | options: pages, loadmore | help: Numbered pages, or one button that adds the next jobs underneath.
- Load more button | key: loadMoreText | type: text | default: Load more jobs
- Previous page button | key: prevText | type: text | default: Previous
- Next page button | key: nextText | type: text | default: Next
- Page list name for screen readers | key: pagerLabel | type: text | default: Job pages
- Page button name for screen readers | key: pageAriaText | type: text | default: Page {count} | help: {count} becomes the page number.

**Sorting**

- Show the sort menu | key: showSort | type: toggle | default: true
- Sort when the page loads | key: defaultSort | type: dropdown | default: newest | options: newest, salary-high, salary-low | help: Salary sorting compares hourly, daily and yearly pay as yearly amounts.
- Sort menu label | key: sortLabel | type: text | default: Sort by
- Newest option | key: sortNewest | type: text | default: Newest
- Highest salary option | key: sortSalaryHigh | type: text | default: Highest salary
- Lowest salary option | key: sortSalaryLow | type: text | default: Lowest salary

**Result count**

- Count for one job | key: countOne | type: text | default: {count} job | help: {count} becomes the number.
- Count for many jobs | key: countMany | type: text | default: {count} jobs | help: {count} becomes the number.
