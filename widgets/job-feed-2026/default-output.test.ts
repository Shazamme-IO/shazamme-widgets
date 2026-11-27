// @vitest-environment jsdom
// Fleet safety guard: Job Feed 2026 is on hundreds of live sites. The chip card is opt-in
// (cardStyle = "chips"), so with the setting absent, blank or "standard" the cards the widget
// draws must be byte-for-byte what they were before the chip card existed. The golden files in
// __golden__ were generated from the untouched legacy.js before the chip card was added.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONFIGS, render } from './harness';

const here = dirname(fileURLToPath(import.meta.url));

describe('job-feed-2026 default output is unchanged', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-06-01T00:00:00Z')); });
  afterEach(() => { vi.useRealTimers(); });

  for (const name of Object.keys(CONFIGS)) {
    for (const style of [undefined, '', 'standard', 'unknown-value'] as const) {
      it(`${name} with cardStyle ${JSON.stringify(style)} matches the pre-chip-card golden`, async () => {
        const cfg = style === undefined ? CONFIGS[name] : { ...CONFIGS[name], cardStyle: style };
        const html = await render(cfg);
        expect(html.length).toBeGreaterThan(500);
        expect(html).not.toContain('shm-cc-');
        const golden = readFileSync(join(here, '__golden__', `${name}.html`), 'utf8');
        expect(html).toBe(golden);
      });
    }
  }
});
