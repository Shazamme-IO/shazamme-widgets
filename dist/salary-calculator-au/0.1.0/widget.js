/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build b597e5e3ab95. Registers window.ShazammeWidget["<name>"].
 */
(function(){
  if (typeof document === 'undefined') return;
  if (document.getElementById("shm-css-salary-calculator-au")) return;
  var s = document.createElement('style');
  s.id = "shm-css-salary-calculator-au";
  s.textContent = ".shm-salary-au { position: relative; box-sizing: border-box; width: 100%; color: #101920; font-family: inherit; font-size: 16px; line-height: 1.5; }\n.shm-salary-au *, .shm-salary-au *::before, .shm-salary-au *::after { box-sizing: border-box; }\n.shm-salary-au [hidden] { display: none !important; }\n.shm-salary-au .shm-sc-disclaimer { display: block !important; }\n\n.shm-salary-au .shm-sc-card { padding: 24px; background-color: #ffffff; border: 1px solid #d5dde3; border-radius: 8px; }\n.shm-salary-au .shm-sc-title { margin: 0 0 8px; color: #101920; font-family: inherit; font-size: 28px; font-weight: 700; line-height: 1.2; text-align: left; }\n.shm-salary-au .shm-sc-intro { margin: 0 0 20px; color: #4a5560; font-size: 16px; text-align: left; }\n.shm-salary-au .shm-sc-subtitle { margin: 0 0 12px; color: #101920; font-family: inherit; font-size: 20px; font-weight: 700; line-height: 1.3; text-align: left; }\n\n.shm-salary-au .shm-sc-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }\n.shm-salary-au .shm-sc-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }\n.shm-salary-au .shm-sc-label { color: #101920; font-size: 14px; font-weight: 600; }\n.shm-salary-au .shm-sc-input { width: 100%; min-height: 44px; margin: 0; padding: 10px 12px; color: #101920; font-family: inherit; font-size: 16px; line-height: 1.3; background-color: #ffffff; border: 1px solid #8a97a3; border-radius: 6px; }\n.shm-salary-au .shm-sc-input:focus-visible, .shm-salary-au .shm-sc-check input:focus-visible { outline: 2px solid #0b6e8a; outline-offset: 2px; }\n.shm-salary-au .shm-sc-help { display: block; margin-top: 6px; color: #4a5560; font-size: 13px; }\n\n.shm-salary-au .shm-sc-options { display: grid; gap: 16px; min-width: 0; margin: 24px 0 0; padding: 16px; background-color: #f4f7f9; border: 1px solid #d5dde3; border-radius: 8px; }\n.shm-salary-au .shm-sc-legend { padding: 0 8px; color: #101920; font-size: 16px; font-weight: 700; }\n.shm-salary-au .shm-sc-opt { min-width: 0; }\n.shm-salary-au .shm-sc-check { display: flex; align-items: center; gap: 10px; min-height: 44px; cursor: pointer; }\n.shm-salary-au .shm-sc-check input { flex: 0 0 auto; width: 20px; height: 20px; margin: 0; accent-color: #0b6e8a; }\n.shm-salary-au .shm-sc-checktext { color: #101920; font-size: 16px; }\n\n.shm-salary-au .shm-sc-error { margin: 16px 0 0; padding: 10px 12px; color: #8a1c1c; font-size: 14px; background-color: #fdeeee; border: 1px solid #e7b4b4; border-radius: 6px; }\n\n.shm-salary-au .shm-sc-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; margin: 24px 0 0; padding: 14px 32px; color: #ffffff; font-family: inherit; font-size: 16px; font-weight: 700; line-height: 1.2; text-align: center; text-decoration: none; background-color: #0b6e8a; border: 2px solid #0b6e8a; border-radius: 6px; cursor: pointer; }\n.shm-salary-au .shm-sc-btn:hover { color: #ffffff; background-color: #085569; border-color: #085569; }\n.shm-salary-au .shm-sc-btn:focus-visible { outline: 2px solid #101920; outline-offset: 2px; }\n\n.shm-salary-au .shm-sc-results { margin-top: 28px; padding-top: 24px; border-top: 1px solid #d5dde3; }\n.shm-salary-au .shm-sc-tiles-heading { margin: 0 0 8px; color: #4a5560; font-size: 14px; font-weight: 600; text-align: left; }\n.shm-salary-au .shm-sc-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 0 0 20px; }\n.shm-salary-au .shm-sc-tile { display: flex; flex-direction: column; gap: 4px; min-width: 0; padding: 14px; background-color: #eaf5f8; border-radius: 8px; }\n.shm-salary-au .shm-sc-tile-label { color: #4a5560; font-size: 13px; font-weight: 600; }\n.shm-salary-au .shm-sc-tile-value { color: #0b6e8a; font-size: 20px; font-weight: 700; line-height: 1.2; overflow-wrap: anywhere; }\n\n.shm-salary-au .shm-sc-tablewrap { width: 100%; overflow-x: auto; }\n.shm-salary-au .shm-sc-table { width: 100%; border-collapse: collapse; font-size: 15px; }\n.shm-salary-au .shm-sc-table th, .shm-salary-au .shm-sc-table td { padding: 10px 8px; color: #101920; text-align: right; white-space: nowrap; border-bottom: 1px solid #d5dde3; }\n.shm-salary-au .shm-sc-table th[scope=\"row\"], .shm-salary-au .shm-sc-table thead td { text-align: left; white-space: normal; }\n.shm-salary-au .shm-sc-table thead th { font-weight: 700; }\n.shm-salary-au .shm-sc-table th[scope=\"row\"] { font-weight: 400; }\n.shm-salary-au .shm-sc-table .shm-sc-total th, .shm-salary-au .shm-sc-table .shm-sc-total td { font-weight: 700; border-top: 2px solid #101920; }\n\n.shm-salary-au .shm-sc-note { margin: 16px 0 0; color: #4a5560; font-size: 13px; text-align: left; }\n.shm-salary-au .shm-sc-disclaimer { margin: 8px 0 0; color: #4a5560; font-size: 13px; line-height: 1.5; text-align: left; }\n.shm-salary-au .shm-sc-table .shm-sc-super th, .shm-salary-au .shm-sc-table .shm-sc-super td { color: #4a5560; font-style: italic; border-top: 1px dashed #8a97a3; }\n\n.shm-salary-au .shm-sc-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }\n\n@media (min-width: 768px) {\n.shm-salary-au .shm-sc-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }\n.shm-salary-au .shm-sc-options { grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: start; }\n\n}\n@media (max-width: 767px) {\n.shm-salary-au .shm-sc-card { padding: 16px; }\n.shm-salary-au .shm-sc-title { font-size: 24px; }\n.shm-salary-au .shm-sc-grid { grid-template-columns: minmax(0, 1fr); }\n.shm-salary-au .shm-sc-btn { width: 100%; padding: 14px 24px; }\n.shm-salary-au .shm-sc-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n.shm-salary-au .shm-sc-table { font-size: 13px; }\n.shm-salary-au .shm-sc-table th, .shm-salary-au .shm-sc-table td { padding: 8px 6px; }\n\n}";
  (document.head || document.documentElement).appendChild(s);
})();
"use strict";
var __shazWidgetExport = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // widgets/salary-calculator-au/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => salaryCalculatorAu
  });

  // widgets/salary-calculator-au/tax.ts
  var TAX_CONFIG = {
    taxYear: "2026-27",
    currency: "AUD",
    locale: "en-AU",
    weeksPerYear: 52,
    fortnightsPerYear: 26,
    monthsPerYear: 12,
    // Resident rates 2026-27 (0 to 18,200 nil; 15c to 45,000; 30c to 135,000; 37c to 190,000; 45c over).
    // https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents (updated 13 Aug 2026)
    residentBands: [
      { upTo: 18200, rate: 0 },
      { upTo: 45e3, rate: 0.15 },
      { upTo: 135e3, rate: 0.3 },
      { upTo: 19e4, rate: 0.37 },
      { upTo: Infinity, rate: 0.45 }
    ],
    // UNCONFIRMED for 2026-27 (rechecked 16 Nov 2026): the ATO annual foreign resident table still ends at 2025-26
    // (0 to 135,000 at 30c, 37c to 190,000, 45c over). The 1 July 2026 cut applies only to the resident first band, and
    // the 2026-27 weekly withholding table keeps the same 30c first band.
    // https://www.ato.gov.au/tax-rates-and-codes/tax-rates-foreign-residents
    // https://www.ato.gov.au/tax-rates-and-codes/tax-table-weekly
    foreignResidentBands: [
      { upTo: 135e3, rate: 0.3 },
      { upTo: 19e4, rate: 0.37 },
      { upTo: Infinity, rate: 0.45 }
    ],
    // Working holiday makers 2026-27 (Schedule 15 Table A: 15c to 45,000; 30c to 135,000; 37c to 190,000; 45c over).
    // https://www.ato.gov.au/tax-rates-and-codes/schedule-15-tax-table-for-working-holiday-makers
    workingHolidayBands: [
      { upTo: 45e3, rate: 0.15 },
      { upTo: 135e3, rate: 0.3 },
      { upTo: 19e4, rate: 0.37 },
      { upTo: Infinity, rate: 0.45 }
    ],
    // Low income tax offset, residents only, not refundable. The ATO page names no income year.
    // https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/low-income-tax-offset
    lito: { max: 700, firstEnd: 37500, firstRate: 0.05, midStart: 45e3, midValue: 325, midRate: 0.015, end: 66667 },
    // Medicare levy 2%: https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
    // Foreign residents do not pay it: https://www.ato.gov.au/tax-rates-and-codes/tax-rates-foreign-residents
    // UNCONFIRMED for 2026-27 (rechecked 16 Nov 2026): 28,011 is the singles threshold announced in the 12 May 2026
    // Budget; the ATO notes the measure was not yet law when it published the figure. Update if the final figure differs.
    // https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy/medicare-levy-reduction/medicare-levy-reduction-for-low-income-earners
    // The 10c phase-in rate is the ATO's published shade-in (not on the fetched page; consistent with upper = lower x 1.25).
    medicare: { rate: 0.02, lowerThreshold: 28011, upperThreshold: 35013, phaseInRate: 0.1 },
    // HELP and other study loans, marginal repayments from 2025-26, 2026-27 thresholds.
    // https://www.ato.gov.au/tax-rates-and-codes/study-and-training-support-loans-rates-and-repayment-thresholds
    help: {
      minThreshold: 69528,
      firstRate: 0.15,
      // 15c per $1 over 69,528 up to 129,717
      secondStart: 129717,
      secondBase: 9028,
      secondRate: 0.17,
      // 9,028 plus 17c per $1 over 129,717 up to 186,050
      topStart: 186050,
      topRate: 0.1
      // 10% of total repayment income above 186,050
    },
    // Super guarantee 12% from 1 July 2025 (still 12.00 for 1 July 2026 to 30 June 2027).
    // https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee
    superRate: 0.12,
    maxSuperBase: 270830
    // maximum contribution base 2026-27, annual. Same page, Table 23.
  };
  var RESIDENCIES = ["resident", "foreign", "whm"];
  var PAY_PERIODS = ["hourly", "daily", "weekly", "monthly", "annual"];
  function round2(n) {
    return Math.round((n + 1e-9) * 100) / 100;
  }
  function clampNum(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }
  function applyBands(taxable, bands) {
    let tax = 0;
    let lower = 0;
    for (let i = 0; i < bands.length && taxable > lower; i++) {
      tax += (Math.min(taxable, bands[i].upTo) - lower) * bands[i].rate;
      lower = bands[i].upTo;
    }
    return tax;
  }
  function annualFromPay(amount, period, hoursPerWeek, daysPerWeek, config) {
    const a = Math.max(0, Number(amount) || 0);
    const weeks = config.weeksPerYear;
    if (period === "hourly") return a * hoursPerWeek * weeks;
    if (period === "daily") return a * daysPerWeek * weeks;
    if (period === "weekly") return a * weeks;
    if (period === "monthly") return a * config.monthsPerYear;
    return a;
  }
  function perPeriod(annual, daysPerWeek, config) {
    return {
      year: annual,
      month: annual / config.monthsPerYear,
      fortnight: annual / config.fortnightsPerYear,
      day: annual / (config.weeksPerYear * daysPerWeek)
    };
  }
  function litoFor(income, c) {
    const l = c.lito;
    if (income <= l.firstEnd) return l.max;
    if (income <= l.midStart) return l.max - (income - l.firstEnd) * l.firstRate;
    if (income <= l.end) return l.midValue - (income - l.midStart) * l.midRate;
    return 0;
  }
  function medicareFor(income, c) {
    const m = c.medicare;
    if (income <= m.lowerThreshold) return 0;
    return Math.min(income * m.rate, (income - m.lowerThreshold) * m.phaseInRate);
  }
  function helpFor(income, c) {
    const h = c.help;
    if (income <= h.minThreshold) return 0;
    if (income <= h.secondStart) return (income - h.minThreshold) * h.firstRate;
    if (income <= h.topStart) return h.secondBase + (income - h.secondStart) * h.secondRate;
    return income * h.topRate;
  }
  function calculateAuTax(input, config = TAX_CONFIG) {
    const amount = Math.max(0, Number(input.annualAmount) || 0);
    const rate = config.superRate;
    const cap = config.maxSuperBase;
    let salary = amount;
    if (input.packageIncludesSuper) {
      salary = amount / (1 + rate);
      if (salary > cap) salary = amount - rate * cap;
    }
    const superAmount = round2(Math.min(salary, cap) * rate);
    const residency = input.residency === "foreign" || input.residency === "whm" ? input.residency : "resident";
    const bands = residency === "foreign" ? config.foreignResidentBands : residency === "whm" ? config.workingHolidayBands : config.residentBands;
    let tax = applyBands(salary, bands);
    if (residency === "resident") tax = Math.max(0, tax - litoFor(salary, config));
    const incomeTax = round2(tax);
    const medicare = residency === "resident" ? round2(medicareFor(salary, config)) : 0;
    const help = input.help ? round2(helpFor(salary, config)) : 0;
    return {
      gross: round2(salary),
      totalPackage: round2(salary + superAmount),
      superAmount,
      incomeTax,
      medicare,
      help,
      net: round2(salary - incomeTax - medicare - help)
    };
  }

  // widgets/salary-calculator-au/settings.ts
  var DEFAULT_LABELS = {
    title: "AU Salary Calculator",
    intro: "Work out your take-home pay. Rates are for the {taxYear} financial year.",
    payHeading: "Your pay",
    payAmountLabel: "Pay amount ($)",
    payPeriodLabel: "Pay period",
    periodHourly: "Hourly",
    periodDaily: "Daily",
    periodWeekly: "Weekly",
    periodMonthly: "Monthly",
    periodAnnual: "Annual",
    hoursLabel: "Hours per week",
    daysLabel: "Days per week",
    taxOptionsTitle: "Tax options",
    residencyLabel: "Tax residency",
    residencyResident: "Australian resident",
    residencyForeign: "Foreign resident",
    residencyWhm: "Working holiday maker",
    helpLabel: "I have a HELP or study loan",
    superIncludedLabel: "My package includes super",
    superIncludedHelp: "The amount I entered already includes employer super. It is taken out before tax.",
    calcButton: "Calculate",
    resultsHeading: "Your estimated pay",
    tilesHeading: "Take-home pay",
    colYear: "Year",
    colMonth: "Month",
    colFortnight: "Fortnight",
    colDay: "Day",
    rowGross: "Gross salary",
    rowIncomeTax: "Income tax",
    rowMedicare: "Medicare levy",
    rowHelp: "HELP or study loan repayment",
    rowTakeHome: "Take-home pay",
    rowSuper: "Employer super ({superRate}, paid on top)",
    rowPackage: "Total package (including super)",
    errorAmount: "Enter a pay amount greater than zero.",
    errorHours: "Enter hours per week between 1 and 168.",
    errorDays: "Enter days per week between 1 and 7.",
    taxYearNote: "Based on {taxYear} tax rates.",
    disclaimerText: "This calculator is a guide only. It estimates take-home pay from the standard {taxYear} Australian rates and does not allow for the Medicare levy surcharge, family or senior thresholds, other offsets, salary sacrifice, bonuses or other income. Your actual pay may differ. Some {taxYear} thresholds are still awaiting final legislation. It is not tax or financial advice."
  };
  var MAX_AMOUNT = 1e9;
  var MIN_HOURS = 1;
  var MAX_HOURS = 168;
  var MIN_DAYS = 1;
  var MAX_DAYS = 7;
  var DEFAULT_HOURS = 38;
  var DEFAULT_DAYS = 5;
  function toBool(value, fallback) {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return fallback;
  }
  function toNum(value, fallback, min, max) {
    const n = typeof value === "number" ? value : parseFloat(String(value));
    return Number.isNaN(n) ? fallback : clampNum(n, min, max);
  }
  function label(config, key) {
    const value = config[key];
    const text = typeof value === "string" && value.trim() ? value : DEFAULT_LABELS[key];
    return text.split("{taxYear}").join(TAX_CONFIG.taxYear).split("{superRate}").join(`${Math.round(TAX_CONFIG.superRate * 1e4) / 100}%`);
  }
  function readSettings(data) {
    var _a, _b;
    const config = (_a = data == null ? void 0 : data.config) != null ? _a : {};
    const labels = {};
    for (const key of Object.keys(DEFAULT_LABELS)) labels[key] = label(config, key);
    const period = String((_b = config.defaultPeriod) != null ? _b : "").toLowerCase();
    return {
      labels,
      showGroup: toBool(config.showTaxOptions, true),
      showResidency: toBool(config.showResidency, true),
      showHelp: toBool(config.showHelp, true),
      showSuperIncluded: toBool(config.showSuperIncluded, true),
      showSuper: toBool(config.showSuper, true),
      showBreakdown: toBool(config.showTaxBreakdown, true),
      defaultPeriod: PAY_PERIODS.includes(period) ? period : "annual",
      defaultHours: toNum(config.defaultHours, DEFAULT_HOURS, MIN_HOURS, MAX_HOURS),
      defaultDays: toNum(config.defaultDays, DEFAULT_DAYS, MIN_DAYS, MAX_DAYS),
      defaultAmount: toNum(config.defaultAmount, 0, 0, MAX_AMOUNT)
    };
  }

  // widgets/salary-calculator-au/index.ts
  var COLUMNS = ["year", "month", "fortnight", "day"];
  var ROW_KEYS = ["gross", "totalPackage", "superAmount", "incomeTax", "medicare", "help", "net"];
  var INPUT_DELAY_MS = 300;
  var MIN_HOURS2 = 1;
  var MAX_HOURS2 = 168;
  var MIN_DAYS2 = 1;
  var MAX_DAYS2 = 7;
  var EN_DASH = "\u2013";
  var ERROR_FIELD = { errorAmount: "amount", errorHours: "hours", errorDays: "days" };
  var running = /* @__PURE__ */ new WeakMap();
  var instanceCount = 0;
  function makeMoney() {
    try {
      const fmt = new Intl.NumberFormat(TAX_CONFIG.locale, {
        style: "currency",
        currency: TAX_CONFIG.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return (n) => fmt.format(n);
    } catch (e) {
      return (n) => "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
  function inRange(n, min, max) {
    return n >= min && n <= max;
  }
  function salaryCalculatorAu(ctx) {
    var _a;
    const { element } = ctx;
    const root = element.querySelector(".shm-salary-au");
    if (!root) return;
    (_a = running.get(element)) == null ? void 0 : _a();
    running.delete(element);
    const s = readSettings(ctx.data);
    const money = makeMoney();
    const q = (sel) => root.querySelector(sel);
    const field = (name) => q(`[data-f="${name}"]`);
    const amountEl = field("amount");
    const periodEl = field("period");
    const hoursEl = field("hours");
    const daysEl = field("days");
    const residencyEl = field("residency");
    const helpEl = field("help");
    const superIncludedEl = field("superIncluded");
    const resultsEl = q("[data-shm-results]");
    const errorEl = q("[data-shm-error]");
    const liveEl = q("[data-shm-live]");
    const groupEl = q("[data-shm-options]");
    const disclaimerEl = q("[data-shm-disclaimer]");
    const noteEl = q("[data-shm-note]");
    if (!amountEl || !periodEl || !hoursEl || !daysEl || !resultsEl || !errorEl || !disclaimerEl) return;
    const off = [];
    const stop = () => {
      off.splice(0).forEach((fn) => fn());
      clearTimeout(inputTimer);
    };
    running.set(element, stop);
    const uid = `shm-sc-au-${++instanceCount}`;
    errorEl.id = `${uid}-error`;
    root.querySelectorAll("[data-t]").forEach((node) => {
      var _a2;
      node.textContent = (_a2 = s.labels[node.getAttribute("data-t")]) != null ? _a2 : node.textContent;
    });
    if (noteEl) noteEl.textContent = s.labels.taxYearNote;
    disclaimerEl.textContent = s.labels.disclaimerText;
    disclaimerEl.hidden = false;
    const showOpt = { residency: s.showResidency, help: s.showHelp, superIncluded: s.showSuperIncluded };
    if (groupEl) groupEl.hidden = !(s.showGroup && (s.showResidency || s.showHelp || s.showSuperIncluded));
    root.querySelectorAll("[data-opt]").forEach((node) => {
      var _a2;
      node.hidden = !showOpt[(_a2 = node.getAttribute("data-opt")) != null ? _a2 : ""];
    });
    const setRowVisible = (name, visible) => {
      root.querySelectorAll(`[data-row="${name}"]`).forEach((row) => {
        row.hidden = !visible;
      });
    };
    periodEl.value = s.defaultPeriod;
    hoursEl.value = String(s.defaultHours);
    daysEl.value = String(s.defaultDays);
    amountEl.value = s.defaultAmount > 0 ? String(s.defaultAmount) : "";
    const readInputs = () => {
      const period = periodEl.value;
      const allowed = s.showGroup;
      return {
        amount: parseFloat(amountEl.value),
        period: PAY_PERIODS.includes(period) ? period : "annual",
        hours: parseFloat(hoursEl.value),
        days: parseFloat(daysEl.value),
        residency: allowed && s.showResidency && residencyEl && RESIDENCIES.includes(residencyEl.value) ? residencyEl.value : "resident",
        help: allowed && s.showHelp && !!(helpEl == null ? void 0 : helpEl.checked),
        superIncluded: allowed && s.showSuperIncluded && !!(superIncludedEl == null ? void 0 : superIncludedEl.checked)
      };
    };
    const validate = (inp) => {
      if (!(inp.amount > 0 && inp.amount <= MAX_AMOUNT)) return "errorAmount";
      if (inp.period === "hourly" && !inRange(inp.hours, MIN_HOURS2, MAX_HOURS2)) return "errorHours";
      if (inp.period === "daily" && !inRange(inp.days, MIN_DAYS2, MAX_DAYS2)) return "errorDays";
      return "";
    };
    const clearFieldErrors = () => {
      for (const name of Object.values(ERROR_FIELD)) {
        const el = field(name);
        el == null ? void 0 : el.removeAttribute("aria-invalid");
        el == null ? void 0 : el.removeAttribute("aria-describedby");
      }
    };
    const showError = (key) => {
      clearFieldErrors();
      const el = field(ERROR_FIELD[key]);
      el == null ? void 0 : el.setAttribute("aria-invalid", "true");
      el == null ? void 0 : el.setAttribute("aria-describedby", errorEl.id);
      errorEl.textContent = s.labels[key];
      errorEl.hidden = false;
      resultsEl.hidden = true;
      if (liveEl) liveEl.textContent = "";
    };
    const clearError = () => {
      clearFieldErrors();
      errorEl.hidden = true;
      errorEl.textContent = "";
    };
    const setCell = (row, col, value) => {
      const cell = q(`[data-row="${row}"] [data-col="${col}"]`);
      if (cell) cell.textContent = value;
    };
    const render = (inp, result) => {
      const series = {};
      for (const key of ROW_KEYS) {
        series[key] = perPeriod(result[key], inp.days, TAX_CONFIG);
        for (const col of COLUMNS) setCell(key, col, money(series[key][col]));
      }
      for (const col of COLUMNS) {
        const tile = q(`[data-tile="${col}"]`);
        if (tile) tile.textContent = money(series.net[col]);
      }
      setRowVisible("incomeTax", s.showBreakdown);
      setRowVisible("medicare", s.showBreakdown && inp.residency === "resident");
      setRowVisible("help", s.showBreakdown && inp.help);
      setRowVisible("superAmount", s.showBreakdown && s.showSuper);
      setRowVisible("totalPackage", s.showBreakdown && s.showSuper && inp.superIncluded);
      resultsEl.hidden = false;
      return series;
    };
    const announce = (net, daysOk) => {
      if (!liveEl) return;
      const l = s.labels;
      const parts = [`${l.colYear} ${money(net.year)}`, `${l.colMonth} ${money(net.month)}`, `${l.colFortnight} ${money(net.fortnight)}`];
      if (daysOk) parts.push(`${l.colDay} ${money(net.day)}`);
      const text = `${l.rowTakeHome}: ${parts.join(", ")}.`;
      liveEl.textContent = liveEl.textContent === text ? text + "\xA0" : text;
    };
    const blankDayColumn = () => {
      root.querySelectorAll('[data-col="day"], [data-tile="day"]').forEach((node) => {
        node.textContent = EN_DASH;
      });
    };
    const on = (type, handler) => {
      root.addEventListener(type, handler);
      off.push(() => root.removeEventListener(type, handler));
    };
    let attempted = false;
    let lastInputs = "";
    let inputTimer;
    const calculate = (announceResult = true) => {
      attempted = true;
      const inp = readInputs();
      lastInputs = JSON.stringify(inp);
      const err = validate(inp);
      if (err) return showError(err);
      const daysOk = inRange(inp.days, MIN_DAYS2, MAX_DAYS2);
      if (!daysOk) inp.days = s.defaultDays;
      const annual = annualFromPay(inp.amount, inp.period, inp.hours, inp.days, TAX_CONFIG);
      if (!(annual <= MAX_AMOUNT)) return showError("errorAmount");
      clearError();
      const series = render(inp, calculateAuTax({ annualAmount: annual, packageIncludesSuper: inp.superIncluded, residency: inp.residency, help: inp.help }, TAX_CONFIG));
      if (!daysOk) blankDayColumn();
      if (announceResult) announce(series.net, daysOk);
    };
    const flushInput = () => {
      clearTimeout(inputTimer);
      inputTimer = void 0;
      calculate();
    };
    on("click", (ev) => {
      var _a2, _b;
      if ((_b = (_a2 = ev.target) == null ? void 0 : _a2.closest) == null ? void 0 : _b.call(_a2, "[data-shm-calc]")) {
        ev.preventDefault();
        flushInput();
      }
    });
    on("keydown", (ev) => {
      const t = ev.target;
      if (ev.key === "Enter" && !ev.isComposing && (t == null ? void 0 : t.tagName) === "INPUT" && t.type !== "checkbox") {
        ev.preventDefault();
        flushInput();
      }
    });
    on("input", () => {
      if (!attempted) return;
      clearTimeout(inputTimer);
      inputTimer = setTimeout(flushInput, INPUT_DELAY_MS);
    });
    on("change", (ev) => {
      const t = ev.target;
      if (!attempted || !t) return;
      const isTextBox = t.tagName === "INPUT" && t.type !== "checkbox";
      if (isTextBox && inputTimer === void 0 && JSON.stringify(readInputs()) === lastInputs) return;
      flushInput();
    });
    resultsEl.hidden = true;
    clearError();
    if (liveEl) liveEl.textContent = "";
    if (amountEl.value) calculate(false);
  }
  return __toCommonJS(index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["salary-calculator-au"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
