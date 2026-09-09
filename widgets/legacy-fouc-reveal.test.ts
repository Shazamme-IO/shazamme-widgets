// The legacy ports run inside Duda, whose widget CSS tab hides the shell until first
// paint (`:not(.shm-ready){visibility:hidden!important}`). A bundle that never lifts
// that hide renders every job and shows none of them — the devdemo2 regression.
// These are source-level guards: the legacy files are Duda-scoped scripts (they close
// over `element`/`data`), so they cannot be imported and mounted like the v2 widgets.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const read = (name: string): string =>
  readFileSync(join(here, name, 'legacy.js'), 'utf8');

describe.each([
  ['job-results', '[data-shm-main]'],
  ['job-search', '.job-search-root'],
])('%s legacy port lifts the FOUC hide', (widget, selector) => {
  const src = read(widget);

  it('defines a reveal that targets the hidden container', () => {
    expect(src).toContain(`this.reveal = () =>`);
    expect(src).toContain(selector);
    expect(src).toContain(`addClass('shm-ready')`);
  });

  it('sets visibility inline with !important so a Duda class reset cannot re-hide it', () => {
    expect(src).toContain(`setProperty('visibility', 'visible', 'important')`);
  });

  it('reveals on the failure path, not only on success', () => {
    expect(src).toMatch(/\.catch\([^)]*=>\s*\{[^}]*ux\.reveal\(\)/);
  });

  it('wires the reveal on every exit path — success, failure and fail-safe', () => {
    expect(src.match(/ux\.reveal\(\)/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
  });

  it('reveals from a fail-safe timer if the render never completes', () => {
    expect(src).toMatch(/setTimeout\(\s*\(\)\s*=>\s*ux\.reveal\(\),\s*\d+\s*\)/);
  });
});
