Build the Content Editor for a widget called "Job Hero Chips". It shows small pills (chips) with the key facts of a job under the job title on the job details page. Create these fields exactly as listed, in this order, under the headings. Keep every key exactly as written. All values arrive as text.

**Job (required)**

- Job ID | key: jobID | type: text | default: (empty) | help: Required. Bind this to the job's ID on the job details page, the same way as the Dynamic Application button. Leave blank only if the page address matches the job.

**Chips, in order, left to right**

- First chip | key: chip1 | type: dropdown | default: location | options: location, workType, workModel, salary, profession, role, none | help: The fact shown first. Choose none to leave it out.
- Second chip | key: chip2 | type: dropdown | default: workType | options: location, workType, workModel, salary, profession, role, none | help: The fact shown second.
- Third chip | key: chip3 | type: dropdown | default: workModel | options: location, workType, workModel, salary, profession, role, none | help: The fact shown third.
- Fourth chip | key: chip4 | type: dropdown | default: salary | options: location, workType, workModel, salary, profession, role, none | help: The fact shown fourth. The salary chip shows the pay text the recruiter wrote, or the from and to amounts with the currency symbol when there is no pay text.

**Options**

- Highlight the salary chip | key: highlightSalary | type: toggle | default: true | help: Gives the salary chip its own bright colour.
- Show a pin on the location chip | key: showLocationIcon | type: toggle | default: true | help: A small map pin before the location.
