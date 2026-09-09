// Text-matching the guard proves it is present, not that it works: a guard wrapped in
// `data.inEditor &&` would pass, and an equivalent `!path.startsWith('/')` rewrite
// would fail. This extracts each widget's real buildHref and calls it.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
// Derived, not hardcoded: a newly ported widget with an unguarded buildHref must fail
// here rather than quietly sit outside the list.
const WIDGETS = readdirSync(here)
  .filter((w) => existsSync(join(here, w, 'legacy.js')))
  .filter((w) => readFileSync(join(here, w, 'legacy.js'), 'utf8').includes('this.buildHref ='));

function extractBuildHref(
  widget: string,
  inEditor = false,
): (path: string, query?: string) => string {
  const src = readFileSync(join(here, widget, 'legacy.js'), 'utf8');
  const start = src.indexOf('this.buildHref = (path, query) => {');
  expect(start, `${widget}: buildHref not found`).toBeGreaterThan(-1);

  // walk braces to the end of the arrow function body
  let depth = 0;
  let end = start;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) { end = i + 1; break; }
  }
  const body = src.slice(src.indexOf('{', start), end);

  const make = new Function(
    'data',
    'window',
    `return (path, query) => ${body};`,
  ) as (d: unknown, w: unknown) => (p: string, q?: string) => string;

  return make({ inEditor, siteId: 'site1' }, { location: { hostname: 'clientsite.com' } });
}

describe.each(WIDGETS)('%s buildHref', (widget) => {
  const buildHref = extractBuildHref(widget);

  it('adds the missing leading slash', () => {
    expect(buildHref('register')).toBe('https://clientsite.com/register');
  });

  it('leaves an already-rooted path alone', () => {
    expect(buildHref('/job-results')).toBe('https://clientsite.com/job-results');
  });

  it('never concatenates host and path', () => {
    expect(buildHref('register')).not.toContain('clientsite.comregister');
  });

  it('passes an absolute href straight through', () => {
    expect(buildHref('https://careers.example.com/register')).toBe('https://careers.example.com/register');
    expect(buildHref('https://careers.example.com/register')).not.toContain('clientsite.com/https');
  });

  it('collapses a doubled slash instead of going off-site', () => {
    expect(buildHref('//jobs', 'keyword=x')).toBe('https://clientsite.com/jobs?keyword=x');
  });

  it('keeps a query out of the fragment on an absolute href', () => {
    expect(buildHref('https://x.com/apply#form', 'jobID=1')).toBe('https://x.com/apply?jobID=1#form');
  });

  it('keeps a query out of the fragment on a relative path', () => {
    expect(buildHref('/job-application#apply-form', 'jobID=123'))
      .toBe('https://clientsite.com/job-application?jobID=123#apply-form');
  });

  it('merges with a query the configured path already carries', () => {
    expect(buildHref('/job-application?src=web', 'jobID=123'))
      .toBe('https://clientsite.com/job-application?src=web&jobID=123');
  });

  it('adds the slash in the Duda editor branch too', () => {
    const inEditor = extractBuildHref(widget, true);

    expect(inEditor('register')).toContain('/site/site1/register');
    expect(inEditor('register')).not.toContain('site1register');
  });
});
