Build the Content Editor for this widget. Create one tab, "Options". Keep the keys exactly as written. Toggles come through as true or false (the widget accepts a real boolean or the text).

**Tab: Options**

- Show tax options | key: showTaxOptions | type: toggle | default: true | help: Off hides the whole Tax options group. Tax is still worked out with no Scottish rate, no student loan and no pension.
- Show Scottish taxpayer option | key: showScottish | type: toggle | default: true | help: Off hides this option inside Tax options and ignores it.
- Show student loan option | key: showStudentLoan | type: toggle | default: true | help: Off hides this option inside Tax options and ignores it.
- Show pension option | key: showPension | type: toggle | default: true | help: Off hides this option inside Tax options and ignores it.
- Show tax breakdown | key: showTaxBreakdown | type: toggle | default: true | help: Off hides income tax, National Insurance, student loan and pension lines so only gross pay and take-home pay show.
- Starting pay amount | key: defaultAmount | type: number | default: (blank) | help: Leave blank to start empty. A number calculates as soon as the page loads.
- Starting pay period | key: defaultPeriod | type: dropdown | default: annual | options: hourly, daily, weekly, monthly, annual | help: Which period is selected first.
- Starting hours per week | key: defaultHours | type: number | default: 37.5 | help: Used for hourly pay.
- Starting days per week | key: defaultDays | type: number | default: 5 | help: Used for daily pay and the per-day figures.
