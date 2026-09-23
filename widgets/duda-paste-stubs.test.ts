// The paste stubs' entire content is a widget name and two URLs built from it. A typo
// there cannot be caught by the URL probe (a 404 is indistinguishable from a widget
// that has not shipped yet), so check the invariants directly.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const stubs = readdirSync(here)
  .filter((w) => existsSync(join(here, w, 'duda-paste.js')))
  .map((w) => [w, readFileSync(join(here, w, 'duda-paste.js'), 'utf8')] as const);

it('every widget ships a paste stub', () => {
  const widgets = readdirSync(here).filter((w) => existsSync(join(here, w, 'legacy.js')) || existsSync(join(here, w, 'index.ts')));
  expect(stubs.map(([w]) => w).sort()).toEqual(widgets.sort());
});

describe.each(stubs)('%s duda-paste.js', (widget, src) => {
  it('names the widget it lives next to', () => {
    expect(src).toContain(`var NAME = "${widget}"`);
  });

  it('builds the bundle URL from NAME, so it cannot drift from the deploy path', () => {
    expect(src).toContain('"https://sdk.shazamme.io/js/widget/" + NAME + "/widget.min.js"');
  });

  it('pins the SDK all widgets share', () => {
    expect(src).toContain('https://sdk.shazamme.io/js/shazamme-1.0.3.min.js');
  });

  it('parses inside Duda\'s function(element, data, api) wrapper', () => {
    expect(() => new Function('element', 'data', 'api', src)).not.toThrow();
  });
});

// The jsDelivr stubs serve a widget straight from this repo's dist/ at a pinned
// tag — the delivery path for widgets that never reached CloudFront. Same failure
// class as above: a wrong path or a mutable ref is invisible to a URL probe.
const cdnStubs = readdirSync(here)
  .filter((w) => existsSync(join(here, w, 'duda-paste-jsdelivr.js')))
  .map((w) => [w, readFileSync(join(here, w, 'duda-paste-jsdelivr.js'), 'utf8')] as const);

describe.each(cdnStubs)('%s duda-paste-jsdelivr.js', (widget, src) => {
  it('names the widget it lives next to', () => {
    expect(src).toContain(`var NAME = "${widget}"`);
  });

  it('builds the bundle URL from NAME and TAG, so it cannot drift from the dist path', () => {
    expect(src).toContain(
      '"https://cdn.jsdelivr.net/gh/Shazamme-IO/shazamme-widgets@" + TAG + "/dist/" + NAME + "/0.1.0/widget.min.js"',
    );
  });

  it('pins an immutable tag, never a branch', () => {
    const tag = src.match(/var TAG = "([^"]+)"/)?.[1];
    expect(tag).toMatch(/^v\d+\.\d+\.\d+$/);
  });

  it('serves a bundle this repo actually built', () => {
    expect(existsSync(join(here, '..', 'dist', widget, '0.1.0', 'widget.min.js'))).toBe(true);
  });

  it("parses inside Duda's function(element, data, api) wrapper", () => {
    expect(() => new Function('element', 'data', 'api', src)).not.toThrow();
  });
});
