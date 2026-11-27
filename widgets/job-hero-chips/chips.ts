// The chips of the job page header: which facts, in which order, and how each is written.

import { locationLine, profession, role, salaryLine, text, toBool, toChoice, type JobRow } from '../_job-page/job';

export type ChipKind = 'location' | 'workType' | 'workModel' | 'salary' | 'profession' | 'role';

export const CHIP_KINDS: readonly ChipKind[] = ['location', 'workType', 'workModel', 'salary', 'profession', 'role'];
export const SLOT_KEYS = ['chip1', 'chip2', 'chip3', 'chip4'] as const;
export const SLOT_DEFAULTS: Readonly<Record<(typeof SLOT_KEYS)[number], ChipKind>> = {
  chip1: 'location', chip2: 'workType', chip3: 'workModel', chip4: 'salary',
};

const READERS: Readonly<Record<ChipKind, (job: JobRow) => string>> = {
  location: locationLine,
  workType: (j) => text(j.workType),
  workModel: (j) => text(j.workModel),
  salary: salaryLine,
  profession,
  role,
};

export interface Chip { kind: ChipKind; value: string; highlight: boolean; icon: boolean }

export interface ChipSettings { slots: Array<ChipKind | null>; highlightSalary: boolean; locationIcon: boolean }

export function readChipSettings(config: Record<string, unknown>): ChipSettings {
  const allowed = [...CHIP_KINDS, 'none'] as const;
  return {
    slots: SLOT_KEYS.map((k) => {
      const choice = toChoice(config[k], allowed, SLOT_DEFAULTS[k]);
      return choice === 'none' ? null : choice;
    }),
    highlightSalary: toBool(config.highlightSalary, true),
    locationIcon: toBool(config.showLocationIcon, true),
  };
}

/** Chips in slot order. A fact the job has no value for is skipped, and a fact chosen twice shows once. */
export function buildChips(job: JobRow, config: Record<string, unknown>): Chip[] {
  const s = readChipSettings(config);
  const seen = new Set<ChipKind>();
  const chips: Chip[] = [];
  for (const kind of s.slots) {
    if (!kind || seen.has(kind)) continue;
    seen.add(kind);
    const value = READERS[kind](job);
    if (!value) continue;
    chips.push({ kind, value, highlight: kind === 'salary' && s.highlightSalary, icon: kind === 'location' && s.locationIcon });
  }
  return chips;
}
