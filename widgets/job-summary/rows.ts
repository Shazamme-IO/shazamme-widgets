// The ten rows of the At a glance card: key, default label, and how each value is read off the job.

import { currencyCode, locationLine, profession, role, salaryRange, text, toBool, type JobRow } from '../_job-page/job';

export type RowKey =
  | 'profession' | 'role' | 'workType' | 'workModel' | 'location'
  | 'salaryType' | 'salary' | 'package' | 'currency' | 'reference';

interface RowDef {
  key: RowKey;
  label: string;
  value: (job: JobRow) => string;
}

/** In display order. The Content Editor keys are `show<Key>` and `label<Key>` (Key = the key with a capital). */
export const ROW_DEFS: readonly RowDef[] = [
  { key: 'profession', label: 'Profession', value: profession },
  { key: 'role', label: 'Role', value: role },
  { key: 'workType', label: 'Work type', value: (j) => text(j.workType) },
  { key: 'workModel', label: 'Work model', value: (j) => text(j.workModel) },
  { key: 'location', label: 'Location', value: locationLine },
  { key: 'salaryType', label: 'Salary type', value: (j) => text(j.salaryType) },
  { key: 'salary', label: 'Salary', value: salaryRange },
  { key: 'package', label: 'Package', value: (j) => text(j.salaryText) },
  { key: 'currency', label: 'Currency', value: currencyCode },
  { key: 'reference', label: 'Reference', value: (j) => text(j.referenceNumber) },
];

const cap = (k: string): string => k.charAt(0).toUpperCase() + k.slice(1);
export const showKey = (k: RowKey): string => `show${cap(k)}`;
export const labelKey = (k: RowKey): string => `label${cap(k)}`;

export interface Row { key: RowKey; label: string; value: string }

/** Rows that are switched on and have a value. A package that only repeats the salary row is dropped. */
export function buildRows(job: JobRow, config: Record<string, unknown>): Row[] {
  const rows: Row[] = [];
  for (const def of ROW_DEFS) {
    if (!toBool(config[showKey(def.key)], true)) continue;
    const value = def.value(job);
    if (!value) continue;
    rows.push({ key: def.key, label: text(config[labelKey(def.key)]) || def.label, value });
  }
  const salary = rows.find((r) => r.key === 'salary');
  return rows.filter((r) => !(r.key === 'package' && salary && salary.value === r.value));
}
