// AU Salary Calculator. Runs inside the generated legacyController(ctx), which binds element and
// data the way Duda's function(element, data, api) wrapper does. Needs no Shazamme SDK (.no-sdk).
// The tax maths is the block between the TAX MODULE markers: pure functions, no DOM, unit tested
// by extracting that block (salary-calculator-au/port.test.ts). Update TAX_CONFIG every 1 July.

// ---- TAX MODULE START ----
var TAX_CONFIG = {
  taxYear: '2026-27',
  currency: 'AUD',
  locale: 'en-AU',
  weeksPerYear: 52,
  fortnightsPerYear: 26,
  monthsPerYear: 12,
  // Resident rates 2026-27 (0 to 18,200 nil; 15c to 45,000; 30c to 135,000; 37c to 190,000; 45c over).
  // https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents (updated 13 Aug 2026)
  residentBands: [
    { upTo: 18200, rate: 0 },
    { upTo: 45000, rate: 0.15 },
    { upTo: 135000, rate: 0.3 },
    { upTo: 190000, rate: 0.37 },
    { upTo: Infinity, rate: 0.45 }
  ],
  // UNCONFIRMED for 2026-27 (rechecked 16 Nov 2026): the ATO annual foreign resident table still ends at 2025-26
  // (0 to 135,000 at 30c, 37c to 190,000, 45c over). The 1 July 2026 cut applies only to the resident first band, and
  // the 2026-27 weekly withholding table keeps the same 30c first band.
  // https://www.ato.gov.au/tax-rates-and-codes/tax-rates-foreign-residents
  // https://www.ato.gov.au/tax-rates-and-codes/tax-table-weekly
  foreignResidentBands: [
    { upTo: 135000, rate: 0.3 },
    { upTo: 190000, rate: 0.37 },
    { upTo: Infinity, rate: 0.45 }
  ],
  // Working holiday makers 2026-27 (Schedule 15 Table A: 15c to 45,000; 30c to 135,000; 37c to 190,000; 45c over).
  // https://www.ato.gov.au/tax-rates-and-codes/schedule-15-tax-table-for-working-holiday-makers
  workingHolidayBands: [
    { upTo: 45000, rate: 0.15 },
    { upTo: 135000, rate: 0.3 },
    { upTo: 190000, rate: 0.37 },
    { upTo: Infinity, rate: 0.45 }
  ],
  // Low income tax offset, residents only, not refundable. The ATO page names no income year.
  // https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/low-income-tax-offset
  lito: { max: 700, firstEnd: 37500, firstRate: 0.05, midStart: 45000, midValue: 325, midRate: 0.015, end: 66667 },
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
    firstRate: 0.15, // 15c per $1 over 69,528 up to 129,717
    secondStart: 129717,
    secondBase: 9028,
    secondRate: 0.17, // 9,028 plus 17c per $1 over 129,717 up to 186,050
    topStart: 186050,
    topRate: 0.1 // 10% of total repayment income above 186,050
  },
  // Super guarantee 12% from 1 July 2025 (still 12.00 for 1 July 2026 to 30 June 2027).
  // https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee
  superRate: 0.12,
  maxSuperBase: 270830 // maximum contribution base 2026-27, annual. Same page, Table 23.
};

function round2(n) { return Math.round((n + 1e-9) * 100) / 100; }
function clampNum(n, min, max) { return Math.min(max, Math.max(min, n)); }

function applyBands(taxable, bands) {
  var tax = 0, lower = 0;
  for (var i = 0; i < bands.length && taxable > lower; i++) {
    tax += (Math.min(taxable, bands[i].upTo) - lower) * bands[i].rate;
    lower = bands[i].upTo;
  }
  return tax;
}

function annualFromPay(amount, period, hoursPerWeek, daysPerWeek, config) {
  var a = Math.max(0, Number(amount) || 0);
  var weeks = config.weeksPerYear;
  if (period === 'hourly') { return a * hoursPerWeek * weeks; }
  if (period === 'daily') { return a * daysPerWeek * weeks; }
  if (period === 'weekly') { return a * weeks; }
  if (period === 'monthly') { return a * config.monthsPerYear; }
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
  var l = c.lito;
  if (income <= l.firstEnd) { return l.max; }
  if (income <= l.midStart) { return l.max - (income - l.firstEnd) * l.firstRate; }
  if (income <= l.end) { return l.midValue - (income - l.midStart) * l.midRate; }
  return 0;
}

function medicareFor(income, c) {
  var m = c.medicare;
  if (income <= m.lowerThreshold) { return 0; }
  return Math.min(income * m.rate, (income - m.lowerThreshold) * m.phaseInRate);
}

function helpFor(income, c) {
  var h = c.help;
  if (income <= h.minThreshold) { return 0; }
  if (income <= h.secondStart) { return (income - h.minThreshold) * h.firstRate; }
  if (income <= h.topStart) { return h.secondBase + (income - h.secondStart) * h.secondRate; }
  return income * h.topRate;
}

// input: { annualAmount, packageIncludesSuper, residency (resident|foreign|whm), help (boolean) }
function calculateAuTax(input, config) {
  var amount = Math.max(0, Number(input.annualAmount) || 0);
  var rate = config.superRate;
  var cap = config.maxSuperBase;
  var salary = amount;
  if (input.packageIncludesSuper) {
    salary = amount / (1 + rate);
    if (salary > cap) { salary = amount - rate * cap; }
  }
  var superAmount = round2(Math.min(salary, cap) * rate);
  var residency = input.residency === 'foreign' || input.residency === 'whm' ? input.residency : 'resident';
  var bands = residency === 'foreign' ? config.foreignResidentBands : residency === 'whm' ? config.workingHolidayBands : config.residentBands;
  var tax = applyBands(salary, bands);
  if (residency === 'resident') { tax = Math.max(0, tax - litoFor(salary, config)); }
  var incomeTax = round2(tax);
  var medicare = residency === 'resident' ? round2(medicareFor(salary, config)) : 0;
  var help = input.help ? round2(helpFor(salary, config)) : 0;
  return {
    gross: round2(salary),
    totalPackage: round2(salary + superAmount),
    superAmount: superAmount,
    incomeTax: incomeTax,
    medicare: medicare,
    help: help,
    net: round2(salary - incomeTax - medicare - help)
  };
}
// ---- TAX MODULE END ----

var cfg = (data && data.config) || {};
var root = element.querySelector('.shm-salary-au');
if (!root) { return; }
if (typeof root.__shmStop === 'function') { root.__shmStop(); }

var DEFAULTS = {
  title: 'AU Salary Calculator',
  intro: 'Work out your take-home pay. Rates are for the {taxYear} financial year.',
  payHeading: 'Your pay',
  payAmountLabel: 'Pay amount ($)',
  payPeriodLabel: 'Pay period',
  periodHourly: 'Hourly',
  periodDaily: 'Daily',
  periodWeekly: 'Weekly',
  periodMonthly: 'Monthly',
  periodAnnual: 'Annual',
  hoursLabel: 'Hours per week',
  daysLabel: 'Days per week',
  taxOptionsTitle: 'Tax options',
  residencyLabel: 'Tax residency',
  residencyResident: 'Australian resident',
  residencyForeign: 'Foreign resident',
  residencyWhm: 'Working holiday maker',
  helpLabel: 'I have a HELP or study loan',
  superIncludedLabel: 'My package includes super',
  superIncludedHelp: 'The amount I entered already includes employer super. It is taken out before tax.',
  calcButton: 'Calculate',
  resultsHeading: 'Your estimated pay',
  tilesHeading: 'Take-home pay',
  colYear: 'Year',
  colMonth: 'Month',
  colFortnight: 'Fortnight',
  colDay: 'Day',
  rowGross: 'Gross salary',
  rowIncomeTax: 'Income tax',
  rowMedicare: 'Medicare levy',
  rowHelp: 'HELP or study loan repayment',
  rowTakeHome: 'Take-home pay',
  rowSuper: 'Employer super ({superRate}, paid on top)',
  rowPackage: 'Total package (including super)',
  errorAmount: 'Enter a pay amount greater than zero.',
  errorHours: 'Enter hours per week between 1 and 168.',
  errorDays: 'Enter days per week between 1 and 7.',
  taxYearNote: 'Based on {taxYear} tax rates.',
  disclaimerText: 'This calculator is a guide only. It estimates take-home pay from the standard {taxYear} Australian rates and does not allow for the Medicare levy surcharge, family or senior thresholds, other offsets, salary sacrifice, bonuses or other income. Your actual pay may differ. Some {taxYear} thresholds are still awaiting final legislation. It is not tax or financial advice.'
};
var PERIODS = ['hourly', 'daily', 'weekly', 'monthly', 'annual'];
var RESIDENCIES = ['resident', 'foreign', 'whm'];

function toBool(v, fallback) {
  if (v === true || v === 'true') { return true; }
  if (v === false || v === 'false') { return false; }
  return fallback;
}
function toNum(v, fallback, min, max) {
  var n = parseFloat(v);
  if (isNaN(n)) { return fallback; }
  return clampNum(n, min, max);
}
function text(key) {
  var v = cfg[key];
  var s = (typeof v === 'string' && v.trim()) ? v : DEFAULTS[key];
  return s.split('{taxYear}').join(TAX_CONFIG.taxYear).split('{superRate}').join(Math.round(TAX_CONFIG.superRate * 10000) / 100 + '%');
}
function q(sel) { return root.querySelector(sel); }
function qa(sel) { return root.querySelectorAll(sel); }

var showGroup = toBool(cfg.showTaxOptions, true);
var showOpt = {
  residency: toBool(cfg.showResidency, true),
  help: toBool(cfg.showHelp, true),
  superIncluded: toBool(cfg.showSuperIncluded, true)
};
var showBreakdown = toBool(cfg.showTaxBreakdown, true);
var showSuper = toBool(cfg.showSuper, true);

var fmt;
try {
  fmt = new Intl.NumberFormat(TAX_CONFIG.locale, { style: 'currency', currency: TAX_CONFIG.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
} catch (e) {
  fmt = { format: function (n) { return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); } };
}
function money(n) { return fmt.format(n); }

var labels = qa('[data-t]');
for (var i = 0; i < labels.length; i++) { labels[i].textContent = text(labels[i].getAttribute('data-t')); }

var amountEl = q('[data-f="amount"]');
var periodEl = q('[data-f="period"]');
var hoursEl = q('[data-f="hours"]');
var daysEl = q('[data-f="days"]');
var residencyEl = q('[data-f="residency"]');
var helpEl = q('[data-f="help"]');
var superIncludedEl = q('[data-f="superIncluded"]');
var resultsEl = q('[data-shm-results]');
var errorEl = q('[data-shm-error]');
var groupEl = q('[data-shm-options]');
var disclaimerEl = q('[data-shm-disclaimer]');
var noteEl = q('[data-shm-note]');
if (!amountEl || !periodEl || !hoursEl || !daysEl || !resultsEl || !errorEl || !disclaimerEl) { return; }

var anyOption = showOpt.residency || showOpt.help || showOpt.superIncluded;
if (groupEl) { groupEl.hidden = !(showGroup && anyOption); }
var optEls = qa('[data-opt]');
for (var o = 0; o < optEls.length; o++) { optEls[o].hidden = !showOpt[optEls[o].getAttribute('data-opt')]; }

var rowEls = qa('[data-row]');
function setRowVisible(name, visible) {
  for (var r = 0; r < rowEls.length; r++) {
    if (rowEls[r].getAttribute('data-row') === name) { rowEls[r].hidden = !visible; }
  }
}

var defaultPeriod = String(cfg.defaultPeriod || '').toLowerCase();
if (PERIODS.indexOf(defaultPeriod) === -1) { defaultPeriod = 'annual'; }
periodEl.value = defaultPeriod;
hoursEl.value = String(toNum(cfg.defaultHours, 38, 1, 168));
var DEFAULT_DAYS = toNum(cfg.defaultDays, 5, 1, 7);
daysEl.value = String(DEFAULT_DAYS);
var startAmount = toNum(cfg.defaultAmount, 0, 0, 1e9);
amountEl.value = startAmount > 0 ? String(startAmount) : '';

// The disclaimer has no switch: it is always on the page, and an empty wording falls back to the default.
function showDisclaimer() {
  disclaimerEl.textContent = text('disclaimerText');
  disclaimerEl.hidden = false;
}
showDisclaimer();
if (noteEl) { noteEl.textContent = text('taxYearNote'); }

var MAX_AMOUNT = 1e9;
// Once the visitor has pressed Calculate (or Enter), edits recalculate live, including after an error.
var attempted = false;
var lastInputs = '';

function readInputs() {
  var period = periodEl.value;
  return {
    amount: parseFloat(amountEl.value),
    period: PERIODS.indexOf(period) > -1 ? period : 'annual',
    hours: parseFloat(hoursEl.value),
    days: parseFloat(daysEl.value),
    residency: showGroup && showOpt.residency && residencyEl && RESIDENCIES.indexOf(residencyEl.value) > -1 ? residencyEl.value : 'resident',
    help: showGroup && showOpt.help && !!(helpEl && helpEl.checked),
    superIncluded: showGroup && showOpt.superIncluded && !!(superIncludedEl && superIncludedEl.checked)
  };
}

function validate(inp) {
  if (!(inp.amount > 0 && inp.amount <= MAX_AMOUNT)) { return 'errorAmount'; }
  if (inp.period === 'hourly' && !(inp.hours >= 1 && inp.hours <= 168)) { return 'errorHours'; }
  if (inp.period === 'daily' && !(inp.days >= 1 && inp.days <= 7)) { return 'errorDays'; }
  return '';
}

function setCell(row, col, value) {
  var el = q('[data-row="' + row + '"] [data-col="' + col + '"]');
  if (el) { el.textContent = value; }
}

function render(inp, result) {
  var cols = ['year', 'month', 'fortnight', 'day'];
  var keys = ['gross', 'totalPackage', 'superAmount', 'incomeTax', 'medicare', 'help', 'net'];
  var series = {};
  for (var k = 0; k < keys.length; k++) {
    series[keys[k]] = perPeriod(result[keys[k]], inp.days, TAX_CONFIG);
    for (var c = 0; c < cols.length; c++) { setCell(keys[k], cols[c], money(series[keys[k]][cols[c]])); }
  }
  for (var t = 0; t < cols.length; t++) {
    var tile = q('[data-tile="' + cols[t] + '"]');
    if (tile) { tile.textContent = money(series.net[cols[t]]); }
  }
  setRowVisible('incomeTax', showBreakdown);
  setRowVisible('medicare', showBreakdown && inp.residency === 'resident');
  setRowVisible('help', showBreakdown && inp.help);
  setRowVisible('superAmount', showBreakdown && showSuper);
  setRowVisible('totalPackage', showBreakdown && showSuper && inp.superIncluded);
  resultsEl.hidden = false;
}

function calculate() {
  attempted = true;
  var inp = readInputs();
  lastInputs = JSON.stringify(inp);
  var err = validate(inp);
  if (err) {
    errorEl.textContent = text(err);
    errorEl.hidden = false;
    resultsEl.hidden = true;
    return;
  }
  // Days only feed the Day column unless pay is daily; a bad value blanks that column instead of guessing.
  var daysOk = inp.days >= 1 && inp.days <= 7;
  if (!daysOk) { inp.days = DEFAULT_DAYS; }
  var annual = annualFromPay(inp.amount, inp.period, inp.hours, inp.days, TAX_CONFIG);
  if (!(annual <= MAX_AMOUNT)) { showError('errorAmount'); return; }
  errorEl.hidden = true;
  errorEl.textContent = '';
  render(inp, calculateAuTax({ annualAmount: annual, packageIncludesSuper: inp.superIncluded, residency: inp.residency, help: inp.help }, TAX_CONFIG));
  if (!daysOk) { blankDayColumn(); }
  showDisclaimer();
}
function showError(key) {
  errorEl.textContent = text(key);
  errorEl.hidden = false;
  resultsEl.hidden = true;
}
function blankDayColumn() {
  var cells = qa('[data-col="day"], [data-tile="day"]');
  for (var d = 0; d < cells.length; d++) { cells[d].textContent = '\u2013'; }
}

function onClick(ev) {
  var t = ev.target;
  if (t && t.closest && t.closest('[data-shm-calc]')) { ev.preventDefault(); flushInput(); }
}
function onKey(ev) {
  if (ev.key === 'Enter' && ev.target && ev.target.tagName === 'INPUT' && ev.target.type !== 'checkbox') { ev.preventDefault(); flushInput(); }
}
// Typing recalculates once the visitor pauses, so the results region is not re-announced on every keystroke.
// Calculate, Enter, a select, a checkbox or a text box's change all run any waiting recalculation now, once.
var INPUT_DELAY = 300;
var inputTimer = null;
function flushInput() {
  clearTimeout(inputTimer);
  inputTimer = null;
  calculate();
}
function onInput() {
  if (!attempted) { return; }
  clearTimeout(inputTimer);
  inputTimer = setTimeout(flushInput, INPUT_DELAY);
}
function onChange(ev) {
  var t = ev.target;
  if (!attempted || !t) { return; }
  var isTextBox = t.tagName === 'INPUT' && t.type !== 'checkbox';
  // A text box's change only matters if its value moved without an input event (autofill, script).
  if (isTextBox && inputTimer === null && JSON.stringify(readInputs()) === lastInputs) { return; }
  flushInput();
}

root.addEventListener('click', onClick);
root.addEventListener('keydown', onKey);
root.addEventListener('input', onInput);
root.addEventListener('change', onChange);
root.__shmStop = function () {
  root.removeEventListener('click', onClick);
  root.removeEventListener('keydown', onKey);
  clearTimeout(inputTimer);
  root.removeEventListener('input', onInput);
  root.removeEventListener('change', onChange);
};

resultsEl.hidden = true;
errorEl.hidden = true;
errorEl.textContent = '';
if (amountEl.value) { calculate(); }
