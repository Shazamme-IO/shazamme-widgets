Build the Content Editor for this widget. Create one tab, "Text: pay and tax options". Keep the keys exactly as written. Every field is optional: a blank field uses its default.

**Tab: Text: pay and tax options**

- Title | key: title | type: text | default: AU Salary Calculator | help: The heading above the calculator.
- Intro text | key: intro | type: textarea | default: Work out your take-home pay. Rates are for the {taxYear} financial year. | help: Short line under the title. Type {taxYear} to show the tax year automatically.
- Pay section heading | key: payHeading | type: text | default: Your pay
- Pay amount label | key: payAmountLabel | type: text | default: Pay amount ($) | help: Include the currency symbol.
- Pay period label | key: payPeriodLabel | type: text | default: Pay period
- Period option: hourly | key: periodHourly | type: text | default: Hourly
- Period option: daily | key: periodDaily | type: text | default: Daily
- Period option: weekly | key: periodWeekly | type: text | default: Weekly
- Period option: monthly | key: periodMonthly | type: text | default: Monthly
- Period option: annual | key: periodAnnual | type: text | default: Annual
- Hours per week label | key: hoursLabel | type: text | default: Hours per week
- Days per week label | key: daysLabel | type: text | default: Days per week
- Tax options heading | key: taxOptionsTitle | type: text | default: Tax options
- Residency label | key: residencyLabel | type: text | default: Tax residency
- Residency option: resident | key: residencyResident | type: text | default: Australian resident
- Residency option: foreign resident | key: residencyForeign | type: text | default: Foreign resident
- Residency option: working holiday maker | key: residencyWhm | type: text | default: Working holiday maker
- Study loan label | key: helpLabel | type: text | default: I have a HELP or study loan
- Package includes super label | key: superIncludedLabel | type: text | default: My package includes super
- Package includes super help text | key: superIncludedHelp | type: textarea | default: The amount I entered already includes employer super. It is taken out before tax. | help: Small text under the option.
- Calculate button text | key: calcButton | type: text | default: Calculate
