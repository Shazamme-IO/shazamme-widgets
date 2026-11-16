Build the Content Editor for this widget. Create one tab, "Text: results and statement". Keep the keys exactly as written. Every field is optional: a blank field uses its default.

**Tab: Text: results and statement**

- Results heading | key: resultsHeading | type: text | default: Your estimated pay
- Take-home summary heading | key: tilesHeading | type: text | default: Take-home pay | help: Shown above the four take-home boxes.
- Column: year | key: colYear | type: text | default: Year
- Column: month | key: colMonth | type: text | default: Month
- Column: fortnight | key: colFortnight | type: text | default: Fortnight
- Column: day | key: colDay | type: text | default: Day
- Row: total package | key: rowPackage | type: text | default: Total package (including super) | help: Only shown when "My package includes super" is ticked.
- Row: gross salary | key: rowGross | type: text | default: Gross salary
- Row: income tax | key: rowIncomeTax | type: text | default: Income tax
- Row: Medicare levy | key: rowMedicare | type: text | default: Medicare levy
- Row: study loan repayment | key: rowHelp | type: text | default: HELP or study loan repayment
- Row: take-home pay | key: rowTakeHome | type: text | default: Take-home pay
- Row: employer super | key: rowSuper | type: text | default: Employer super ({superRate}, paid on top) | help: Type {superRate} to show the super rate automatically.
- Message: amount missing | key: errorAmount | type: text | default: Enter a pay amount greater than zero.
- Message: hours not valid | key: errorHours | type: text | default: Enter hours per week between 1 and 168.
- Message: days not valid | key: errorDays | type: text | default: Enter days per week between 1 and 7.
- Tax year note | key: taxYearNote | type: text | default: Based on {taxYear} tax rates. | help: Small line under the results. Type {taxYear} to show the tax year automatically.
- Guide-only statement | key: disclaimerText | type: textarea | default: This calculator is a guide only. It estimates take-home pay from the standard {taxYear} Australian rates and does not allow for the Medicare levy surcharge, family or senior thresholds, other offsets, salary sacrifice, bonuses or other income. Your actual pay may differ. It is not tax or financial advice. | help: Always shown under the results and cannot be switched off. Blank uses the default wording. Type {taxYear} to show the tax year automatically.
