// The buildHref path normalization has already been deleted once by drive-by web edits
// (119633d, 7ec7c84, 8082f0c) and survived only in the committed dist, so a rebuild
// shipped https://clientsite.comregister. legacy-url-guards.behaviour.test.ts asserts
// what it *does*; this file asserts it survives into the shipped bundle, which cannot
// be executed here.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
// build.mjs writes to dist/<name>/<pkg.version>/ and never prunes old versions, so
// pinning a literal version here would silently read a stale bundle after a bump.
const VERSION = JSON.parse(
  readFileSync(join(here, '..', 'package.json'), 'utf8'),
).version as string;
// Derived, not hardcoded: a newly ported widget with an unguarded buildHref must fail
// here rather than quietly sit outside the list.
const WIDGETS = readdirSync(here)
  .filter((w) => existsSync(join(here, w, 'legacy.js')))
  .filter((w) => readFileSync(join(here, w, 'legacy.js'), 'utf8').includes('this.buildHref ='));

describe.each(WIDGETS)('%s normalizes hrefs', (widget) => {
  it('normalizes the path inside buildHref in the built bundle', () => {
    // Scoped to buildHref: site-config also normalizes in rootPath, so a bare
    // whole-file match would pass on a bundle whose buildHref lost the guard.
    const built = readFileSync(join(here, '..', 'dist', widget, VERSION, 'widget.min.js'), 'utf8');
    const at = built.indexOf('buildHref=');

    expect(at, `${widget}: buildHref not found in bundle`).toBeGreaterThan(-1);
    expect(built.slice(at, at + 600)).toContain('replace(/^\\/+/,"/")');
  });
});

describe('site-config toPath', () => {
  const src = readFileSync(join(here, 'site-config', 'legacy.js'), 'utf8');

  it('normalizes the leading slash on _site:path* values', () => {
    expect(src).toContain("replace(/^\\/+/, '/')");
  });

  it('falls back to the default rather than to "/" when the path is empty', () => {
    expect(src).toMatch(/joined \?[^:]+: d;/);
    expect(src).toMatch(/p\?\.href \?[^:]+: d;/);
  });
});
