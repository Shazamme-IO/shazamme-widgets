/* shazamme-widgets — shazamme-widgets v0.1.0
 * Build 269e3002187e. Registers window.ShazammeWidget["<name>"].
 */

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

  // dist/.gen/salary-calculator-uk.index.js
  var salary_calculator_uk_index_exports = {};
  __export(salary_calculator_uk_index_exports, {
    default: () => legacyController
  });

  // core/script-loader.ts
  var CANONICAL_SDK_URL = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  var SDK_URL_RE = /shazamme(-1\.0\.\d+(-test)?)?\.min\.js/;
  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      (document.head || document.documentElement).appendChild(s);
    });
  }
  function loadSdk() {
    if (window.__shazSDKPromise) return window.__shazSDKPromise;
    const p = window.shazamme ? Promise.resolve() : injectScript(CANONICAL_SDK_URL);
    window.__shazSDKPromise = p;
    return p;
  }
  function loadOther(src) {
    const cache = window.__shazScriptCache = window.__shazScriptCache || {};
    const existing = cache[src];
    if (existing) return existing;
    const p = injectScript(src).catch((err) => {
      delete cache[src];
      throw err;
    });
    cache[src] = p;
    return p;
  }
  function installScriptLoader() {
    if (typeof window === "undefined" || window.__shazLoadScript) return;
    window.__shazLoadScript = (src) => SDK_URL_RE.test(src) ? loadSdk() : loadOther(src);
  }
  function ensureScriptLoader() {
    installScriptLoader();
  }

  // dist/.gen/salary-calculator-uk.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    var TAX_CONFIG = {
      taxYear: "2026/27",
      effectiveFrom: "2026-04-06",
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
      }
    };
    function round2(n) {
      return Math.round((n + 1e-9) * 100) / 100;
    }
    function clampNum(n, min, max) {
      return Math.min(max, Math.max(min, n));
    }
    function applyBands(taxable, bands) {
      var tax = 0, lower = 0;
      for (var i2 = 0; i2 < bands.length && taxable > lower; i2++) {
        tax += (Math.min(taxable, bands[i2].upTo) - lower) * bands[i2].rate;
        lower = bands[i2].upTo;
      }
      return tax;
    }
    function annualFromPay(amount, period, hoursPerWeek, daysPerWeek, config) {
      var a = Math.max(0, Number(amount) || 0);
      var weeks = config.weeksPerYear;
      if (period === "hourly") {
        return a * hoursPerWeek * weeks;
      }
      if (period === "daily") {
        return a * daysPerWeek * weeks;
      }
      if (period === "weekly") {
        return a * weeks;
      }
      if (period === "monthly") {
        return a * config.monthsPerYear;
      }
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
    function calculateUkTax(input, config) {
      var gross = Math.max(0, Number(input.annualGross) || 0);
      var pensionPct = clampNum(Number(input.pensionPercent) || 0, 0, 100);
      var pension = round2(gross * pensionPct / 100);
      var pay = gross - pension;
      var allowance = config.personalAllowance;
      if (pay > config.taperStart) {
        allowance = Math.max(0, allowance - (pay - config.taperStart) * config.taperRate);
      }
      var taxable = Math.max(0, pay - allowance);
      var incomeTax = round2(applyBands(taxable, input.scottish ? config.scotlandBands : config.rUKBands));
      var n = config.ni;
      var ni = round2(
        Math.max(0, Math.min(pay, n.upperEarningsLimit) - n.primaryThreshold) * n.mainRate + Math.max(0, pay - n.upperEarningsLimit) * n.upperRate
      );
      var plan = config.studentLoans[input.loan];
      var studentLoan = plan ? round2(Math.max(0, pay - plan.threshold) * plan.rate) : 0;
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
    var cfg = data && data.config || {};
    var root = element.querySelector(".shm-salary-uk");
    if (!root) {
      return;
    }
    if (typeof root.__shmStop === "function") {
      root.__shmStop();
    }
    var DEFAULTS = {
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
    var PERIODS = ["hourly", "daily", "weekly", "monthly", "annual"];
    var LOANS = ["none", "plan1", "plan2", "plan4", "plan5", "postgrad"];
    function toBool(v, fallback) {
      if (v === true || v === "true") {
        return true;
      }
      if (v === false || v === "false") {
        return false;
      }
      return fallback;
    }
    function toNum(v, fallback, min, max) {
      var n = parseFloat(v);
      if (isNaN(n)) {
        return fallback;
      }
      return clampNum(n, min, max);
    }
    function text(key) {
      var v = cfg[key];
      var s = typeof v === "string" && v.trim() ? v : DEFAULTS[key];
      return s.split("{taxYear}").join(TAX_CONFIG.taxYear);
    }
    function q(sel) {
      return root.querySelector(sel);
    }
    function qa(sel) {
      return root.querySelectorAll(sel);
    }
    var showGroup = toBool(cfg.showTaxOptions, true);
    var showOpt = {
      scottish: toBool(cfg.showScottish, true),
      loan: toBool(cfg.showStudentLoan, true),
      pension: toBool(cfg.showPension, true)
    };
    var showBreakdown = toBool(cfg.showTaxBreakdown, true);
    var fmt;
    try {
      fmt = new Intl.NumberFormat(TAX_CONFIG.locale, { style: "currency", currency: TAX_CONFIG.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (e) {
      fmt = { format: function(n) {
        return "\xA3" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      } };
    }
    function money(n) {
      return fmt.format(n);
    }
    var labels = qa("[data-t]");
    for (var i = 0; i < labels.length; i++) {
      labels[i].textContent = text(labels[i].getAttribute("data-t"));
    }
    var amountEl = q('[data-f="amount"]');
    var periodEl = q('[data-f="period"]');
    var hoursEl = q('[data-f="hours"]');
    var daysEl = q('[data-f="days"]');
    var scottishEl = q('[data-f="scottish"]');
    var loanEl = q('[data-f="loan"]');
    var pensionEl = q('[data-f="pension"]');
    var resultsEl = q("[data-shm-results]");
    var errorEl = q("[data-shm-error]");
    var groupEl = q("[data-shm-options]");
    var disclaimerEl = q("[data-shm-disclaimer]");
    var noteEl = q("[data-shm-note]");
    if (!amountEl || !periodEl || !hoursEl || !daysEl || !resultsEl || !errorEl || !disclaimerEl) {
      return;
    }
    var anyOption = showOpt.scottish || showOpt.loan || showOpt.pension;
    if (groupEl) {
      groupEl.hidden = !(showGroup && anyOption);
    }
    var optEls = qa("[data-opt]");
    for (var o = 0; o < optEls.length; o++) {
      optEls[o].hidden = !showOpt[optEls[o].getAttribute("data-opt")];
    }
    var rowEls = qa("[data-row]");
    function setRowVisible(name, visible) {
      for (var r = 0; r < rowEls.length; r++) {
        if (rowEls[r].getAttribute("data-row") === name) {
          rowEls[r].hidden = !visible;
        }
      }
    }
    var defaultPeriod = String(cfg.defaultPeriod || "").toLowerCase();
    if (PERIODS.indexOf(defaultPeriod) === -1) {
      defaultPeriod = "annual";
    }
    periodEl.value = defaultPeriod;
    hoursEl.value = String(toNum(cfg.defaultHours, 37.5, 1, 168));
    daysEl.value = String(toNum(cfg.defaultDays, 5, 1, 7));
    var startAmount = toNum(cfg.defaultAmount, 0, 0, 1e9);
    amountEl.value = startAmount > 0 ? String(startAmount) : "";
    function showDisclaimer() {
      disclaimerEl.textContent = text("disclaimerText");
      disclaimerEl.hidden = false;
    }
    showDisclaimer();
    if (noteEl) {
      noteEl.textContent = text("taxYearNote");
    }
    var calculated = false;
    function readInputs() {
      var period = periodEl.value;
      return {
        amount: parseFloat(amountEl.value),
        period: PERIODS.indexOf(period) > -1 ? period : "annual",
        hours: parseFloat(hoursEl.value),
        days: parseFloat(daysEl.value),
        scottish: showGroup && showOpt.scottish && !!(scottishEl && scottishEl.checked),
        loan: showGroup && showOpt.loan && loanEl && LOANS.indexOf(loanEl.value) > -1 ? loanEl.value : "none",
        pension: showGroup && showOpt.pension && pensionEl ? clampNum(parseFloat(pensionEl.value) || 0, 0, 100) : 0
      };
    }
    function validate(inp) {
      if (!(inp.amount > 0)) {
        return "errorAmount";
      }
      if (inp.period === "hourly" && !(inp.hours >= 1 && inp.hours <= 168)) {
        return "errorHours";
      }
      if (!(inp.days >= 1 && inp.days <= 7)) {
        return "errorDays";
      }
      return "";
    }
    function setCell(row, col, value) {
      var el = q('[data-row="' + row + '"] [data-col="' + col + '"]');
      if (el) {
        el.textContent = value;
      }
    }
    function render(inp, result) {
      var cols = ["year", "month", "week", "day"];
      var series = {
        gross: perPeriod(result.gross, inp.days, TAX_CONFIG),
        pension: perPeriod(result.pension, inp.days, TAX_CONFIG),
        incomeTax: perPeriod(result.incomeTax, inp.days, TAX_CONFIG),
        ni: perPeriod(result.ni, inp.days, TAX_CONFIG),
        studentLoan: perPeriod(result.studentLoan, inp.days, TAX_CONFIG),
        net: perPeriod(result.net, inp.days, TAX_CONFIG)
      };
      var rowFor = { gross: "gross", pension: "pension", incomeTax: "incomeTax", ni: "ni", studentLoan: "studentLoan", net: "net" };
      for (var key in rowFor) {
        for (var c = 0; c < cols.length; c++) {
          setCell(rowFor[key], cols[c], money(series[key][cols[c]]));
        }
      }
      for (var t = 0; t < cols.length; t++) {
        var tile = q('[data-tile="' + cols[t] + '"]');
        if (tile) {
          tile.textContent = money(series.net[cols[t]]);
        }
      }
      setRowVisible("pension", showBreakdown && inp.pension > 0);
      setRowVisible("incomeTax", showBreakdown);
      setRowVisible("ni", showBreakdown);
      setRowVisible("studentLoan", showBreakdown && inp.loan !== "none");
      resultsEl.hidden = false;
    }
    function calculate() {
      var inp = readInputs();
      var err = validate(inp);
      if (err) {
        errorEl.textContent = text(err);
        errorEl.hidden = false;
        resultsEl.hidden = true;
        calculated = false;
        return;
      }
      errorEl.hidden = true;
      errorEl.textContent = "";
      var annual = annualFromPay(inp.amount, inp.period, inp.hours, inp.days, TAX_CONFIG);
      render(inp, calculateUkTax({ annualGross: annual, scottish: inp.scottish, loan: inp.loan, pensionPercent: inp.pension }, TAX_CONFIG));
      showDisclaimer();
      calculated = true;
    }
    function onClick(ev) {
      var t = ev.target;
      if (t && t.closest && t.closest("[data-shm-calc]")) {
        ev.preventDefault();
        calculate();
      }
    }
    function onKey(ev) {
      if (ev.key === "Enter" && ev.target && ev.target.tagName === "INPUT" && ev.target.type !== "checkbox") {
        ev.preventDefault();
        calculate();
      }
    }
    function onChange() {
      if (calculated) {
        calculate();
      }
    }
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKey);
    root.addEventListener("input", onChange);
    root.addEventListener("change", onChange);
    root.__shmStop = function() {
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
      root.removeEventListener("input", onChange);
      root.removeEventListener("change", onChange);
    };
    if (amountEl.value) {
      calculate();
    }
    root.classList.add("is-ready");
  }
  return __toCommonJS(salary_calculator_uk_index_exports);
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
