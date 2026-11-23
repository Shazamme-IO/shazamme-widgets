/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build a92292c0bc78. Registers window.ShazammeWidget["<name>"].
 */
(function(){
  if (typeof document === 'undefined') return;
  if (document.getElementById("shm-css-salary-calculator-uk")) return;
  var s = document.createElement('style');
  s.id = "shm-css-salary-calculator-uk";
  s.textContent = ".shm-salary-uk { position: relative; box-sizing: border-box; width: 100%; color: #101920; font-family: inherit; font-size: 16px; line-height: 1.5; }\n.shm-salary-uk *, .shm-salary-uk *::before, .shm-salary-uk *::after { box-sizing: border-box; }\n.shm-salary-uk [hidden] { display: none !important; }\n.shm-salary-uk .shm-sc-disclaimer { display: block !important; }\n\n.shm-salary-uk .shm-sc-card { padding: 24px; background-color: #ffffff; border: 1px solid #d5dde3; border-radius: 8px; }\n.shm-salary-uk .shm-sc-title { margin: 0 0 8px; color: #101920; font-family: inherit; font-size: 28px; font-weight: 700; line-height: 1.2; text-align: left; }\n.shm-salary-uk .shm-sc-intro { margin: 0 0 20px; color: #4a5560; font-size: 16px; text-align: left; }\n.shm-salary-uk .shm-sc-subtitle { margin: 0 0 12px; color: #101920; font-family: inherit; font-size: 20px; font-weight: 700; line-height: 1.3; text-align: left; }\n\n.shm-salary-uk .shm-sc-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }\n.shm-salary-uk .shm-sc-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }\n.shm-salary-uk .shm-sc-label { color: #101920; font-size: 14px; font-weight: 600; }\n.shm-salary-uk .shm-sc-input { width: 100%; min-height: 44px; margin: 0; padding: 10px 12px; color: #101920; font-family: inherit; font-size: 16px; line-height: 1.3; background-color: #ffffff; border: 1px solid #8a97a3; border-radius: 6px; }\n.shm-salary-uk .shm-sc-input:focus-visible, .shm-salary-uk .shm-sc-check input:focus-visible { outline: 2px solid #0b6e8a; outline-offset: 2px; }\n.shm-salary-uk .shm-sc-help { display: block; margin-top: 6px; color: #4a5560; font-size: 13px; }\n\n.shm-salary-uk .shm-sc-options { display: grid; gap: 16px; min-width: 0; margin: 24px 0 0; padding: 16px; background-color: #f4f7f9; border: 1px solid #d5dde3; border-radius: 8px; }\n.shm-salary-uk .shm-sc-legend { padding: 0 8px; color: #101920; font-size: 16px; font-weight: 700; }\n.shm-salary-uk .shm-sc-opt { min-width: 0; }\n.shm-salary-uk .shm-sc-check { display: flex; align-items: center; gap: 10px; min-height: 44px; cursor: pointer; }\n.shm-salary-uk .shm-sc-check input { flex: 0 0 auto; width: 20px; height: 20px; margin: 0; accent-color: #0b6e8a; }\n.shm-salary-uk .shm-sc-checktext { color: #101920; font-size: 16px; }\n\n.shm-salary-uk .shm-sc-error { margin: 16px 0 0; padding: 10px 12px; color: #8a1c1c; font-size: 14px; background-color: #fdeeee; border: 1px solid #e7b4b4; border-radius: 6px; }\n\n.shm-salary-uk .shm-sc-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; margin: 24px 0 0; padding: 14px 32px; color: #ffffff; font-family: inherit; font-size: 16px; font-weight: 700; line-height: 1.2; text-align: center; text-decoration: none; background-color: #0b6e8a; border: 2px solid #0b6e8a; border-radius: 6px; cursor: pointer; }\n.shm-salary-uk .shm-sc-btn:hover { color: #ffffff; background-color: #085569; border-color: #085569; }\n.shm-salary-uk .shm-sc-btn:focus-visible { outline: 2px solid #101920; outline-offset: 2px; }\n\n.shm-salary-uk .shm-sc-results { margin-top: 28px; padding-top: 24px; border-top: 1px solid #d5dde3; }\n.shm-salary-uk .shm-sc-tiles-heading { margin: 0 0 8px; color: #4a5560; font-size: 14px; font-weight: 600; text-align: left; }\n.shm-salary-uk .shm-sc-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 0 0 20px; }\n.shm-salary-uk .shm-sc-tile { display: flex; flex-direction: column; gap: 4px; min-width: 0; padding: 14px; background-color: #eaf5f8; border-radius: 8px; }\n.shm-salary-uk .shm-sc-tile-label { color: #4a5560; font-size: 13px; font-weight: 600; }\n.shm-salary-uk .shm-sc-tile-value { color: #0b6e8a; font-size: 20px; font-weight: 700; line-height: 1.2; overflow-wrap: anywhere; }\n\n.shm-salary-uk .shm-sc-tablewrap { width: 100%; overflow-x: auto; }\n.shm-salary-uk .shm-sc-table { width: 100%; border-collapse: collapse; font-size: 15px; }\n.shm-salary-uk .shm-sc-table th, .shm-salary-uk .shm-sc-table td { padding: 10px 8px; color: #101920; text-align: right; white-space: nowrap; border-bottom: 1px solid #d5dde3; }\n.shm-salary-uk .shm-sc-table th[scope=\"row\"], .shm-salary-uk .shm-sc-table thead td { text-align: left; white-space: normal; }\n.shm-salary-uk .shm-sc-table thead th { font-weight: 700; }\n.shm-salary-uk .shm-sc-table th[scope=\"row\"] { font-weight: 400; }\n.shm-salary-uk .shm-sc-table .shm-sc-total th, .shm-salary-uk .shm-sc-table .shm-sc-total td { font-weight: 700; border-top: 2px solid #101920; }\n\n.shm-salary-uk .shm-sc-note { margin: 16px 0 0; color: #4a5560; font-size: 13px; text-align: left; }\n.shm-salary-uk .shm-sc-disclaimer { margin: 8px 0 0; color: #4a5560; font-size: 13px; line-height: 1.5; text-align: left; }\n\n.shm-salary-uk .shm-sc-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }\n\n@media (min-width: 768px) {\n.shm-salary-uk .shm-sc-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }\n.shm-salary-uk .shm-sc-options { grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: start; }\n\n}\n@media (max-width: 767px) {\n.shm-salary-uk .shm-sc-card { padding: 16px; }\n.shm-salary-uk .shm-sc-title { font-size: 24px; }\n.shm-salary-uk .shm-sc-grid { grid-template-columns: minmax(0, 1fr); }\n.shm-salary-uk .shm-sc-btn { width: 100%; padding: 14px 24px; }\n.shm-salary-uk .shm-sc-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n.shm-salary-uk .shm-sc-table { font-size: 13px; }\n.shm-salary-uk .shm-sc-table th, .shm-salary-uk .shm-sc-table td { padding: 8px 6px; }\n\n}";
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

  // widgets/salary-calculator-uk/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => salaryCalculatorUk
  });

  // widgets/salary-calculator-uk/tax.ts
  var TAX_CONFIG = {
    taxYear: "2026/27",
    currency: "GBP",
    locale: "en-GB",
    weeksPerYear: 52,
    monthsPerYear: 12,
    // Sources, all fetched 16 Nov 2026:
    //   Income tax rates and PA taper: https://www.gov.uk/income-tax-rates
    //   Scottish bands: https://www.mygov.scot/scottish-income-tax/current-income-tax-rates
    //     (limits there include the 12,570 allowance; the bands below are on taxable income, so each is that limit minus 12,570,
    //      matching https://www.gov.scot/publications/scottish-rate-resolution-2026-2027-draft-motion-explanatory-note/pages/2/)
    //   NI and student loans: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
    personalAllowance: 12570,
    // https://www.gov.uk/income-tax-rates
    taperStart: 1e5,
    // PA drops GBP 1 for every GBP 2 above this; zero at 125,140. https://www.gov.uk/income-tax-rates
    taperRate: 0.5,
    // England, Wales and Northern Ireland. upTo is taxable income (after the allowance). https://www.gov.uk/income-tax-rates
    rUKBands: [
      { upTo: 37700, rate: 0.2 },
      // basic 12,571 to 50,270
      { upTo: 125140, rate: 0.4 },
      // higher 50,271 to 125,140
      { upTo: Infinity, rate: 0.45 }
      // additional over 125,140
    ],
    // Scotland. https://www.mygov.scot/scottish-income-tax/current-income-tax-rates
    scotlandBands: [
      { upTo: 3967, rate: 0.19 },
      // starter, to 16,537
      { upTo: 16956, rate: 0.2 },
      // basic, to 29,526
      { upTo: 31092, rate: 0.21 },
      // intermediate, to 43,662
      { upTo: 62430, rate: 0.42 },
      // higher, to 75,000
      { upTo: 125140, rate: 0.45 },
      // advanced, to 125,140
      { upTo: Infinity, rate: 0.48 }
      // top
    ],
    // Employee Class 1 NI, category A. https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
    ni: { primaryThreshold: 12570, upperEarningsLimit: 50270, mainRate: 0.08, upperRate: 0.02 },
    // https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
    studentLoans: {
      plan1: { threshold: 26900, rate: 0.09 },
      plan2: { threshold: 29385, rate: 0.09 },
      plan4: { threshold: 33795, rate: 0.09 },
      plan5: { threshold: 25e3, rate: 0.09 },
      postgrad: { threshold: 21e3, rate: 0.06 }
    },
    // An undergraduate plan repaid alongside a Postgraduate loan: each is worked out on its own and added.
    combinedLoans: {
      plan1pg: ["plan1", "postgrad"],
      plan2pg: ["plan2", "postgrad"],
      plan4pg: ["plan4", "postgrad"],
      plan5pg: ["plan5", "postgrad"]
    }
  };
  var LOAN_CHOICES = ["none", "plan1", "plan2", "plan4", "plan5", "postgrad", "plan1pg", "plan2pg", "plan4pg", "plan5pg"];
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
      week: annual / config.weeksPerYear,
      day: annual / (config.weeksPerYear * daysPerWeek)
    };
  }
  function loanPlans(loan, config) {
    return Object.prototype.hasOwnProperty.call(config.combinedLoans, loan) ? config.combinedLoans[loan] : [loan];
  }
  function calculateUkTax(input, config = TAX_CONFIG) {
    const gross = Math.max(0, Number(input.annualGross) || 0);
    const pensionPct = clampNum(Number(input.pensionPercent) || 0, 0, 100);
    const pension = round2(gross * pensionPct / 100);
    const pay = gross - pension;
    let allowance = config.personalAllowance;
    if (pay > config.taperStart) allowance = Math.max(0, allowance - (pay - config.taperStart) * config.taperRate);
    const taxable = Math.max(0, pay - allowance);
    const incomeTax = round2(applyBands(taxable, input.scottish ? config.scotlandBands : config.rUKBands));
    const n = config.ni;
    const ni = round2(
      Math.max(0, Math.min(pay, n.upperEarningsLimit) - n.primaryThreshold) * n.mainRate + Math.max(0, pay - n.upperEarningsLimit) * n.upperRate
    );
    let studentLoan = 0;
    for (const name of loanPlans(String(input.loan || "none"), config)) {
      const plan = Object.prototype.hasOwnProperty.call(config.studentLoans, name) ? config.studentLoans[name] : null;
      if (plan) studentLoan += round2(Math.max(0, pay - plan.threshold) * plan.rate);
    }
    studentLoan = round2(studentLoan);
    return {
      gross: round2(gross),
      pension,
      incomeTax,
      ni,
      studentLoan,
      net: round2(gross - pension - incomeTax - ni - studentLoan),
      personalAllowance: round2(allowance)
    };
  }

  // widgets/salary-calculator-uk/settings.ts
  var DEFAULT_LABELS = {
    title: "UK Salary Calculator",
    intro: "Work out your take-home pay. Rates are for the {taxYear} tax year.",
    payHeading: "Your pay",
    payAmountLabel: "Pay amount (\xA3)",
    payPeriodLabel: "Pay period",
    periodHourly: "Hourly",
    periodDaily: "Daily",
    periodWeekly: "Weekly",
    periodMonthly: "Monthly",
    periodAnnual: "Annual",
    hoursLabel: "Hours per week",
    daysLabel: "Days per week",
    taxOptionsTitle: "Tax options",
    scottishLabel: "I pay Scottish income tax",
    studentLoanLabel: "Student loan",
    loanNone: "None",
    loanPlan1: "Plan 1",
    loanPlan2: "Plan 2",
    loanPlan4: "Plan 4",
    loanPlan5: "Plan 5",
    loanPostgrad: "Postgraduate",
    loanPlan1Pg: "Plan 1 and Postgraduate",
    loanPlan2Pg: "Plan 2 and Postgraduate",
    loanPlan4Pg: "Plan 4 and Postgraduate",
    loanPlan5Pg: "Plan 5 and Postgraduate",
    pensionLabel: "Pension contribution (% of salary)",
    pensionHelp: "Taken from your pay before tax and National Insurance (salary sacrifice).",
    calcButton: "Calculate",
    resultsHeading: "Your estimated pay",
    tilesHeading: "Take-home pay",
    colYear: "Year",
    colMonth: "Month",
    colWeek: "Week",
    colDay: "Day",
    rowGross: "Gross pay",
    rowPension: "Pension",
    rowIncomeTax: "Income tax",
    rowNI: "National Insurance",
    rowStudentLoan: "Student loan",
    rowTakeHome: "Take-home pay",
    errorAmount: "Enter a pay amount greater than zero.",
    errorHours: "Enter hours per week between 1 and 168.",
    errorDays: "Enter days per week between 1 and 7.",
    taxYearNote: "Based on {taxYear} tax rates.",
    disclaimerText: "This calculator is a guide only. It estimates take-home pay from the standard {taxYear} UK rates and does not allow for your tax code, other income, benefits or other deductions. Your actual pay may differ. It is not tax or financial advice."
  };
  var MAX_AMOUNT = 1e9;
  var MIN_HOURS = 1;
  var MAX_HOURS = 168;
  var MIN_DAYS = 1;
  var MAX_DAYS = 7;
  var DEFAULT_HOURS = 37.5;
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
    return text.split("{taxYear}").join(TAX_CONFIG.taxYear);
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
      showScottish: toBool(config.showScottish, true),
      showLoan: toBool(config.showStudentLoan, true),
      showPension: toBool(config.showPension, true),
      showBreakdown: toBool(config.showTaxBreakdown, true),
      defaultPeriod: PAY_PERIODS.includes(period) ? period : "annual",
      defaultHours: toNum(config.defaultHours, DEFAULT_HOURS, MIN_HOURS, MAX_HOURS),
      defaultDays: toNum(config.defaultDays, DEFAULT_DAYS, MIN_DAYS, MAX_DAYS),
      defaultAmount: toNum(config.defaultAmount, 0, 0, MAX_AMOUNT)
    };
  }

  // widgets/salary-calculator-uk/index.ts
  var COLUMNS = ["year", "month", "week", "day"];
  var ROW_KEYS = ["gross", "pension", "incomeTax", "ni", "studentLoan", "net"];
  var INPUT_DELAY_MS = 300;
  var MIN_HOURS2 = 1;
  var MAX_HOURS2 = 168;
  var MIN_DAYS2 = 1;
  var MAX_DAYS2 = 7;
  var MAX_PENSION_PERCENT = 100;
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
      return (n) => "\xA3" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
  function inRange(n, min, max) {
    return n >= min && n <= max;
  }
  function salaryCalculatorUk(ctx) {
    var _a;
    const { element } = ctx;
    const root = element.querySelector(".shm-salary-uk");
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
    const scottishEl = field("scottish");
    const loanEl = field("loan");
    const pensionEl = field("pension");
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
    const uid = `shm-sc-uk-${++instanceCount}`;
    errorEl.id = `${uid}-error`;
    root.querySelectorAll("[data-t]").forEach((node) => {
      var _a2;
      node.textContent = (_a2 = s.labels[node.getAttribute("data-t")]) != null ? _a2 : node.textContent;
    });
    if (noteEl) noteEl.textContent = s.labels.taxYearNote;
    disclaimerEl.textContent = s.labels.disclaimerText;
    disclaimerEl.hidden = false;
    const showOpt = { scottish: s.showScottish, loan: s.showLoan, pension: s.showPension };
    if (groupEl) groupEl.hidden = !(s.showGroup && (s.showScottish || s.showLoan || s.showPension));
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
        scottish: allowed && s.showScottish && !!(scottishEl == null ? void 0 : scottishEl.checked),
        loan: allowed && s.showLoan && loanEl && LOAN_CHOICES.includes(loanEl.value) ? loanEl.value : "none",
        pension: allowed && s.showPension && pensionEl ? clampNum(parseFloat(pensionEl.value) || 0, 0, MAX_PENSION_PERCENT) : 0
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
      setRowVisible("pension", s.showBreakdown && inp.pension > 0);
      setRowVisible("incomeTax", s.showBreakdown);
      setRowVisible("ni", s.showBreakdown);
      setRowVisible("studentLoan", s.showBreakdown && inp.loan !== "none");
      resultsEl.hidden = false;
      return series;
    };
    const announce = (net, daysOk) => {
      if (!liveEl) return;
      const l = s.labels;
      const parts = [`${l.colYear} ${money(net.year)}`, `${l.colMonth} ${money(net.month)}`, `${l.colWeek} ${money(net.week)}`];
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
      const series = render(inp, calculateUkTax({ annualGross: annual, scottish: inp.scottish, loan: inp.loan, pensionPercent: inp.pension }, TAX_CONFIG));
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
    window.ShazammeWidget["salary-calculator-uk"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
