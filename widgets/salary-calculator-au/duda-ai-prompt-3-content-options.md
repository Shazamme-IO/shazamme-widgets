Build the Content Editor for this widget. Create one tab, "Options". Keep the keys exactly as written. Toggles come through as true or false (the widget accepts a real boolean or the text).

**Tab: Options**

- Show tax options | key: showTaxOptions | type: toggle | default: true | help: Off hides the whole Tax options group. Tax is still worked out as an Australian resident with no study loan and super not included.
- Show residency option | key: showResidency | type: toggle | default: true | help: Off hides this option inside Tax options and ignores it.
- Show study loan option | key: showHelp | type: toggle | default: true | help: Off hides this option inside Tax options and ignores it.
- Show package includes super option | key: showSuperIncluded | type: toggle | default: true | help: Off hides this option inside Tax options and ignores it.
- Show tax breakdown | key: showTaxBreakdown | type: toggle | default: true | help: Off hides income tax, Medicare levy, study loan and super lines so only gross salary and take-home pay show.
- Show employer super line | key: showSuper | type: toggle | default: true | help: Employer super is shown on its own line under take-home pay. Only used while the tax breakdown is on.
- Starting pay amount | key: defaultAmount | type: number | default: (blank) | help: Leave blank to start empty. A number calculates as soon as the page loads.
- Starting pay period | key: defaultPeriod | type: dropdown | default: annual | options: hourly, daily, weekly, monthly, annual | help: Which period is selected first.
- Starting hours per week | key: defaultHours | type: number | default: 38 | help: Used for hourly pay.
- Starting days per week | key: defaultDays | type: number | default: 5 | help: Used for daily pay and the per-day figures.
