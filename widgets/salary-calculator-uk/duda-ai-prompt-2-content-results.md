Build the Content Editor for this widget. Create one tab, "Text: results and statement". Keep the keys exactly as written. Every field is optional: a blank field uses its default.

**Tab: Text: results and statement**

- Results heading | key: resultsHeading | type: text | default: Your estimated pay
- Take-home summary heading | key: tilesHeading | type: text | default: Take-home pay | help: Shown above the four take-home boxes.
- Column: year | key: colYear | type: text | default: Year
- Column: month | key: colMonth | type: text | default: Month
- Column: week | key: colWeek | type: text | default: Week
- Column: day | key: colDay | type: text | default: Day
- Row: gross pay | key: rowGross | type: text | default: Gross pay
- Row: pension | key: rowPension | type: text | default: Pension
- Row: income tax | key: rowIncomeTax | type: text | default: Income tax
- Row: National Insurance | key: rowNI | type: text | default: National Insurance
- Row: student loan | key: rowStudentLoan | type: text | default: Student loan
- Row: take-home pay | key: rowTakeHome | type: text | default: Take-home pay
- Message: amount missing | key: errorAmount | type: text | default: Enter a pay amount greater than zero.
- Message: hours not valid | key: errorHours | type: text | default: Enter hours per week between 1 and 168.
- Message: days not valid | key: errorDays | type: text | default: Enter days per week between 1 and 7.
- Tax year note | key: taxYearNote | type: text | default: Based on {taxYear} tax rates. | help: Small line under the results. Type {taxYear} to show the tax year automatically.
- Guide-only statement | key: disclaimerText | type: textarea | default: This calculator is a guide only. It estimates take-home pay from the standard {taxYear} UK rates and does not allow for your tax code, other income, benefits or other deductions. Your actual pay may differ. It is not tax or financial advice. | help: Always shown under the results and cannot be switched off. Blank uses the default wording. Type {taxYear} to show the tax year automatically.
