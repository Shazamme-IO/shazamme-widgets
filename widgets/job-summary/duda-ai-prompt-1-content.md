Build the Content Editor for a widget called "Job Summary". It shows an "At a glance" card for a job on the job details page. Create these fields exactly as listed, in this order, under the headings. Keep every key exactly as written. All values arrive as text.

**Job (required)**

- Job ID | key: jobID | type: text | default: (empty) | help: Required. Bind this to the job's ID on the job details page, the same way as the Dynamic Application button. Leave blank only if the page address matches the job.
- Heading | key: heading | type: text | default: At a glance | help: The title of the card. Leave blank for no title.

**Rows shown**

- Show Profession | key: showProfession | type: toggle | default: true | help: The job's profession (industry).
- Show Role | key: showRole | type: toggle | default: true | help: The job's role.
- Show Work type | key: showWorkType | type: toggle | default: true | help: For example Permanent or Contract.
- Show Work model | key: showWorkModel | type: toggle | default: true | help: For example Hybrid or Onsite.
- Show Location | key: showLocation | type: toggle | default: true | help: City, state and country.
- Show Salary type | key: showSalaryType | type: toggle | default: true | help: For example Annual or Hourly.
- Show Salary | key: showSalary | type: toggle | default: true | help: The from and to amounts with the currency symbol.
- Show Package | key: showPackage | type: toggle | default: true | help: The pay text the recruiter wrote, for example "plus super". Hidden when it only repeats the salary.
- Show Currency | key: showCurrency | type: toggle | default: true | help: The currency code, for example AUD.
- Show Reference | key: showReference | type: toggle | default: true | help: The job's reference number.

**Row labels**

- Profession label | key: labelProfession | type: text | default: Profession | help: Wording on the left of the row.
- Role label | key: labelRole | type: text | default: Role | help: Wording on the left of the row.
- Work type label | key: labelWorkType | type: text | default: Work type | help: Wording on the left of the row.
- Work model label | key: labelWorkModel | type: text | default: Work model | help: Wording on the left of the row.
- Location label | key: labelLocation | type: text | default: Location | help: Wording on the left of the row.
- Salary type label | key: labelSalaryType | type: text | default: Salary type | help: Wording on the left of the row.
- Salary label | key: labelSalary | type: text | default: Salary | help: Wording on the left of the row.
- Package label | key: labelPackage | type: text | default: Package | help: Wording on the left of the row.
- Currency label | key: labelCurrency | type: text | default: Currency | help: Wording on the left of the row.
- Reference label | key: labelReference | type: text | default: Reference | help: Wording on the left of the row.
