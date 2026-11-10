# Job Results: company line under the job title (Duda AI prompt)

Added in v0.1.31 (PR #36). It shows a job field (default Vinyl `customField6`)
under the title on the standard, simple and modern cards. It is **off by
default**: the widget renders it only when `showCompany` is on, so sites that
never add the toggle are unchanged.

First live site: NGO Recruitment (`472ec671`, ngorecruitment.com) with
Show Company on and Company Field = `customField6`. Verified 2026-10-27.

## Prompt for Duda's widget AI

Paste everything below the line into Duda's AI in Widget Builder on the Job
Results widget.

---

In the Job Results widget, add two new settings to the Content panel and one CSS rule. Do not change the JavaScript tab or any existing settings, HTML or CSS.

1. Add a Toggle setting.
   - Label: Show Company
   - Variable name: showCompany
   - Default: OFF

2. Directly under it, add a Dropdown (select) setting.
   - Label: Company Field
   - Variable name: companyField
   - Default: customField6
   - Only show this setting when "Show Company" is ON (if conditional display is supported).
   - Options (label → value). The values must be exactly as written, case-sensitive:
     Custom Field 1 → customField1
     Custom Field 2 → customField2
     Custom Field 3 → customField3
     Custom Field 4 → customField4
     Custom Field 5 → customField5
     Custom Field 6 → customField6
     Custom Field 7 → customField7
     Custom Field 8 → customField8
     Custom Field 9 → customField9
     Custom Field 10 → customField10
     Custom Field 11 → customField11
     Custom Field 12 → customField12
     Advertiser Name → advertiserName

3. Add this rule to the end of the widget's CSS tab, unchanged:
   .shmJobtitle .shmCompany { font-size: .62em; font-weight: 600; line-height: 1.3; margin-top: 8px; }

---

## After the AI runs

1. Check the keys are exactly `showCompany` and `companyField` and the option
   values exactly `customField1`…`customField12` / `advertiserName`. A renamed
   toggle does nothing, and a renamed dropdown silently falls back to
   `customField6`.
2. Publish the widget version. Click **Update Widget** on any instance that
   asks, then republish that page.
3. On the site, turn Show Company on and pick the field.
4. The field must have data in Vinyl. Empty values render nothing.
