// The buildHref leading-slash guard has already been deleted once by drive-by web
// edits (119633d, 7ec7c84, 8082f0c) and survived only in the committed dist, so a
// rebuild shipped https://clientsite.comregister. These guards fail loudly if it
// goes missing again — from the source or from the built bundle.

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
  it('keeps the leading-slash guard in source', () => {
    const src = readFileSync(join(here, widget, 'legacy.js'), 'utf8');
    expect(src).toContain("charAt(0) !== '/'");
  });

  it('keeps it in the built bundle', () => {
    const bundle = join(here, '..', 'dist', widget, VERSION, 'widget.min.js');
    expect(readFileSync(bundle, 'utf8')).toContain('charAt(0)!=="/"');
  });
});

describe('site-config toPath', () => {
  const src = readFileSync(join(here, 'site-config', 'legacy.js'), 'utf8');

  it('normalizes the leading slash on _site:path* values', () => {
    expect(src).toMatch(/replace\(\/\^\\\/\+\/, '\/'\)/);
  });

  it('falls back to the default rather than to "/" when the path is empty', () => {
    expect(src).toMatch(/joined \?[^:]+: d;/);
    expect(src).toMatch(/p\?\.href \?[^:]+: d;/);
  });
});
