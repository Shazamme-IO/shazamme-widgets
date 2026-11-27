Build the Content Editor for this widget, part 1 of 2. Create two tabs: "Content" and "Card". This prompt is for the first tab only, "Content". Keep the keys exactly as written. Every field has a default, so the widget works with nothing filled in.

**Tab: Content**

What it shows
- Show | key: mode | type: dropdown | default: team | options: team, job | help: Team shows a grid of your consultants (home page, team page). Job shows the one consultant who owns the job on a job page.
- Job ID | key: jobID | type: text | default: (empty) | help: Job pages only. Connect this field to the job's ID on the dynamic job page. Not needed for team.

Which consultants (team only)
- Only this classification | key: classification | type: text | default: (empty) | help: Show only consultants in this classification, for example Technology. Capital letters do not matter. Empty shows everyone.
- Order | key: sortBy | type: dropdown | default: default | options: default, name | help: Default keeps the order set in the Shazamme console. Name sorts A to Z.
- Maximum to show | key: maxConsultants | type: number | default: 0 | help: 0 shows all of them.
- Site ID | key: siteId | type: text | default: (empty) | help: Leave empty. Only needed to show another site's consultants.

Job page message
- Message when the job has no consultant | key: noConsultantMessage | type: text | default: (empty) | help: Shown on the live site when no consultant is assigned to the job. Empty hides the card completely.
