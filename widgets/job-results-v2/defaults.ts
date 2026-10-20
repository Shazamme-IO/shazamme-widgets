// Legacy "Default Filters" panel: a fixed scope the site applies before any user
// filter (e.g. only G&D Chillers' Junction City jobs on a shared IR feed). Pure.

import type { Job } from '../../core/types';
import type { DefaultFilters } from '../../core/config';
import { matchKeyword, matchLocation } from '../../core/filters';

const norm = (v: unknown): string => (v == null ? '' : String(v)).trim().toLowerCase();

function fieldMatches(job: Job, field: string, values: readonly string[]): boolean {
  if (field === 'keyword') return values.some((v) => matchKeyword(job, v));
  if (field === 'location') return values.some((v) => matchLocation(job, v));

  const raw = (job as Record<string, unknown>)[field];
  const jobValues = field === 'tags' ? String(raw ?? '').split(',').map(norm) : [norm(raw)];
  return values.some((v) => jobValues.includes(norm(v)));
}

export function hasDefaults(defaults: DefaultFilters): boolean {
  return Object.keys(defaults).length > 0;
}

/** True when the job satisfies every default field (OR within a field's values). */
export function inDefaultScope(job: Job, defaults: DefaultFilters): boolean {
  return Object.entries(defaults).every(([field, values]) => fieldMatches(job, field, values));
}
