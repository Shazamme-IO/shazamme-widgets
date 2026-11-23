// AU Salary Calculator. Registered by the build as window.ShazammeWidget["salary-calculator-au"];
// the loader stub calls the default export with { element, data }. Needs no Shazamme SDK, so it
// never waits for one. Everything is scoped to `element`, and a re-run (Duda re-runs the widget
// on every Content Editor change) tears the previous run's listeners and timer down first.

import type { DudaData } from '../../core/config';
import { readSettings, MAX_AMOUNT, type LabelKey, type Settings } from './settings';
import {
  annualFromPay,
  calculateAuTax,
  PAY_PERIODS,
  perPeriod,
  RESIDENCIES,
  TAX_CONFIG,
  type AuTaxResult,
  type PayPeriod,
  type PeriodAmounts,
} from './tax';

interface WidgetContext {
  element: HTMLElement;
  data?: DudaData;
  $?: unknown;
  shazamme?: unknown;
}

interface Inputs {
  amount: number;
  period: PayPeriod;
  hours: number;
  days: number;
  residency: string;
  help: boolean;
  superIncluded: boolean;
}

type ErrorKey = 'errorAmount' | 'errorHours' | 'errorDays';
type Column = 'year' | 'month' | 'fortnight' | 'day';

const COLUMNS: readonly Column[] = ['year', 'month', 'fortnight', 'day'];
const ROW_KEYS = ['gross', 'totalPackage', 'superAmount', 'incomeTax', 'medicare', 'help', 'net'] as const;
const INPUT_DELAY_MS = 300;
const MIN_HOURS = 1;
const MAX_HOURS = 168;
const MIN_DAYS = 1;
const MAX_DAYS = 7;
const EN_DASH = '–';
const ERROR_FIELD: Record<ErrorKey, string> = { errorAmount: 'amount', errorHours: 'hours', errorDays: 'days' };

const running = new WeakMap<HTMLElement, () => void>();
let instanceCount = 0;

function makeMoney(): (n: number) => string {
  try {
    const fmt = new Intl.NumberFormat(TAX_CONFIG.locale, {
      style: 'currency',
      currency: TAX_CONFIG.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return (n) => fmt.format(n);
  } catch {
    return (n) => '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

function inRange(n: number, min: number, max: number): boolean {
  return n >= min && n <= max;
}

export default function salaryCalculatorAu(ctx: WidgetContext): void {
  const { element } = ctx;
  const root = element.querySelector<HTMLElement>('.shm-salary-au');
  if (!root) return;
  running.get(element)?.();
  running.delete(element);

  const s: Settings = readSettings(ctx.data);
  const money = makeMoney();
  const q = <T extends HTMLElement = HTMLElement>(sel: string): T | null => root.querySelector<T>(sel);
  const field = <T extends HTMLElement = HTMLInputElement>(name: string): T | null => q<T>(`[data-f="${name}"]`);

  const amountEl = field('amount');
  const periodEl = field<HTMLSelectElement>('period');
  const hoursEl = field('hours');
  const daysEl = field('days');
  const residencyEl = field<HTMLSelectElement>('residency');
  const helpEl = field('help');
  const superIncludedEl = field('superIncluded');
  const resultsEl = q('[data-shm-results]');
  const errorEl = q('[data-shm-error]');
  const liveEl = q('[data-shm-live]');
  const groupEl = q('[data-shm-options]');
  const disclaimerEl = q('[data-shm-disclaimer]');
  const noteEl = q('[data-shm-note]');
  if (!amountEl || !periodEl || !hoursEl || !daysEl || !resultsEl || !errorEl || !disclaimerEl) return;

  const off: Array<() => void> = [];
  const stop = (): void => {
    off.splice(0).forEach((fn) => fn());
    clearTimeout(inputTimer);
  };
  running.set(element, stop);
  const uid = `shm-sc-au-${++instanceCount}`;
  errorEl.id = `${uid}-error`;

  root.querySelectorAll<HTMLElement>('[data-t]').forEach((node) => {
    node.textContent = s.labels[node.getAttribute('data-t') as LabelKey] ?? node.textContent;
  });
  if (noteEl) noteEl.textContent = s.labels.taxYearNote;
  // The disclaimer has no switch: it is always on the page, and an empty wording falls back to the default.
  disclaimerEl.textContent = s.labels.disclaimerText;
  disclaimerEl.hidden = false;

  const showOpt: Record<string, boolean> = { residency: s.showResidency, help: s.showHelp, superIncluded: s.showSuperIncluded };
  if (groupEl) groupEl.hidden = !(s.showGroup && (s.showResidency || s.showHelp || s.showSuperIncluded));
  root.querySelectorAll<HTMLElement>('[data-opt]').forEach((node) => {
    node.hidden = !showOpt[node.getAttribute('data-opt') ?? ''];
  });

  const setRowVisible = (name: string, visible: boolean): void => {
    root.querySelectorAll<HTMLElement>(`[data-row="${name}"]`).forEach((row) => {
      row.hidden = !visible;
    });
  };

  periodEl.value = s.defaultPeriod;
  hoursEl.value = String(s.defaultHours);
  daysEl.value = String(s.defaultDays);
  (amountEl as HTMLInputElement).value = s.defaultAmount > 0 ? String(s.defaultAmount) : '';

  const readInputs = (): Inputs => {
    const period = periodEl.value as PayPeriod;
    const allowed = s.showGroup;
    return {
      amount: parseFloat((amountEl as HTMLInputElement).value),
      period: PAY_PERIODS.includes(period) ? period : 'annual',
      hours: parseFloat((hoursEl as HTMLInputElement).value),
      days: parseFloat((daysEl as HTMLInputElement).value),
      residency:
        allowed && s.showResidency && residencyEl && (RESIDENCIES as readonly string[]).includes(residencyEl.value) ? residencyEl.value : 'resident',
      help: allowed && s.showHelp && !!(helpEl as HTMLInputElement | null)?.checked,
      superIncluded: allowed && s.showSuperIncluded && !!(superIncludedEl as HTMLInputElement | null)?.checked,
    };
  };

  const validate = (inp: Inputs): ErrorKey | '' => {
    if (!(inp.amount > 0 && inp.amount <= MAX_AMOUNT)) return 'errorAmount';
    if (inp.period === 'hourly' && !inRange(inp.hours, MIN_HOURS, MAX_HOURS)) return 'errorHours';
    if (inp.period === 'daily' && !inRange(inp.days, MIN_DAYS, MAX_DAYS)) return 'errorDays';
    return '';
  };

  const clearFieldErrors = (): void => {
    for (const name of Object.values(ERROR_FIELD)) {
      const el = field(name);
      el?.removeAttribute('aria-invalid');
      el?.removeAttribute('aria-describedby');
    }
  };

  const showError = (key: ErrorKey): void => {
    clearFieldErrors();
    const el = field(ERROR_FIELD[key]);
    el?.setAttribute('aria-invalid', 'true');
    el?.setAttribute('aria-describedby', errorEl.id);
    errorEl.textContent = s.labels[key];
    errorEl.hidden = false;
    resultsEl.hidden = true;
    if (liveEl) liveEl.textContent = '';
  };

  const clearError = (): void => {
    clearFieldErrors();
    errorEl.hidden = true;
    errorEl.textContent = '';
  };

  const setCell = (row: string, col: string, value: string): void => {
    const cell = q(`[data-row="${row}"] [data-col="${col}"]`);
    if (cell) cell.textContent = value;
  };

  const render = (inp: Inputs, result: AuTaxResult): Record<string, PeriodAmounts> => {
    const series: Record<string, PeriodAmounts> = {};
    for (const key of ROW_KEYS) {
      series[key] = perPeriod(result[key], inp.days, TAX_CONFIG);
      for (const col of COLUMNS) setCell(key, col, money(series[key][col]));
    }
    for (const col of COLUMNS) {
      const tile = q(`[data-tile="${col}"]`);
      if (tile) tile.textContent = money(series.net[col]);
    }
    setRowVisible('incomeTax', s.showBreakdown);
    setRowVisible('medicare', s.showBreakdown && inp.residency === 'resident');
    setRowVisible('help', s.showBreakdown && inp.help);
    setRowVisible('superAmount', s.showBreakdown && s.showSuper);
    setRowVisible('totalPackage', s.showBreakdown && s.showSuper && inp.superIncluded);
    resultsEl.hidden = false;
    return series;
  };

  const announce = (net: PeriodAmounts, daysOk: boolean): void => {
    if (!liveEl) return;
    const l = s.labels;
    const parts = [`${l.colYear} ${money(net.year)}`, `${l.colMonth} ${money(net.month)}`, `${l.colFortnight} ${money(net.fortnight)}`];
    if (daysOk) parts.push(`${l.colDay} ${money(net.day)}`);
    // A repeat of the same text is not announced, so alternate a trailing no-break space.
    const text = `${l.rowTakeHome}: ${parts.join(', ')}.`;
    liveEl.textContent = liveEl.textContent === text ? text + '\u00A0' : text;
  };

  const blankDayColumn = (): void => {
    root.querySelectorAll<HTMLElement>('[data-col="day"], [data-tile="day"]').forEach((node) => {
      node.textContent = EN_DASH;
    });
  };

  // addEventListener's { signal } option is missing from older browsers, so removal is explicit.
  const on = <K extends keyof HTMLElementEventMap>(type: K, handler: (ev: HTMLElementEventMap[K]) => void): void => {
    root.addEventListener(type, handler);
    off.push(() => root.removeEventListener(type, handler));
  };

  // Once the visitor has pressed Calculate (or Enter), edits recalculate live, including after an error.
  let attempted = false;
  let lastInputs = '';
  let inputTimer: ReturnType<typeof setTimeout> | undefined;

  const calculate = (announceResult = true): void => {
    attempted = true;
    const inp = readInputs();
    lastInputs = JSON.stringify(inp);
    const err = validate(inp);
    if (err) return showError(err);
    // Days only feed the Day column unless pay is daily; a bad value blanks that column instead of guessing.
    const daysOk = inRange(inp.days, MIN_DAYS, MAX_DAYS);
    if (!daysOk) inp.days = s.defaultDays;
    const annual = annualFromPay(inp.amount, inp.period, inp.hours, inp.days, TAX_CONFIG);
    if (!(annual <= MAX_AMOUNT)) return showError('errorAmount');
    clearError();
    const series = render(inp, calculateAuTax({ annualAmount: annual, packageIncludesSuper: inp.superIncluded, residency: inp.residency, help: inp.help }, TAX_CONFIG));
    if (!daysOk) blankDayColumn();
    if (announceResult) announce(series.net, daysOk);
  };

  // Typing recalculates once the visitor pauses, so the results are not re-announced on every keystroke.
  // Calculate, Enter, a select, a checkbox or a text box's change all run any waiting recalculation now, once.
  const flushInput = (): void => {
    clearTimeout(inputTimer);
    inputTimer = undefined;
    calculate();
  };

  on('click', (ev) => {
    if ((ev.target as Element | null)?.closest?.('[data-shm-calc]')) {
      ev.preventDefault();
      flushInput();
    }
  });
  on('keydown', (ev) => {
    const t = ev.target as HTMLInputElement | null;
    if (ev.key === 'Enter' && !ev.isComposing && t?.tagName === 'INPUT' && t.type !== 'checkbox') {
      ev.preventDefault();
      flushInput();
    }
  });
  on('input', () => {
    if (!attempted) return;
    clearTimeout(inputTimer);
    inputTimer = setTimeout(flushInput, INPUT_DELAY_MS);
  });
  on('change', (ev) => {
    const t = ev.target as HTMLInputElement | null;
    if (!attempted || !t) return;
    const isTextBox = t.tagName === 'INPUT' && t.type !== 'checkbox';
    // A text box's change only matters if its value moved without an input event (autofill, script).
    if (isTextBox && inputTimer === undefined && JSON.stringify(readInputs()) === lastInputs) return;
    flushInput();
  });

  resultsEl.hidden = true;
  clearError();
  if (liveEl) liveEl.textContent = '';
  if ((amountEl as HTMLInputElement).value) calculate(false);
}
