// @vitest-environment jsdom
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CARD_FIELDS, readSettings } from './settings';

const here = dirname(fileURLToPath(import.meta.url));
const read = (f: string) => readFileSync(join(here, f), 'utf8');
const manifest = JSON.parse(read('settings.json')) as { fields: Array<{ key: string; default: unknown }> };
const promptKeys = readdirSync(here)
  .filter((f) => /^duda-ai-prompt-[12]-.*\.md$/.test(f))
  .flatMap((f) => [...read(f).matchAll(/key: ([A-Za-z0-9]+)/g)].map((m) => m[1]));

describe('settings keys', () => {
  it('the manifest, the Content Editor prompts and the card fields list the same keys', () => {
    const manifestKeys = manifest.fields.map((f) => f.key).sort();
    const itemKeys = new Set<string>(CARD_FIELDS);
    expect([...new Set(promptKeys.filter((k) => !itemKeys.has(k)))].sort()).toEqual(manifestKeys);
    for (const k of CARD_FIELDS) expect(promptKeys).toContain(k);
  });

  it('empty settings give the documented defaults', () => {
    const s = readSettings({}, document.createElement('div'));
    const byKey: Record<string, unknown> = {
      flipStyle: s.flipStyle, flipSpeed: s.speedMs, flipOnHover: s.hoverFlip, headingTag: s.headingTag,
      columnsDesktop: s.breakpoints[0].columns, gapMobile: s.breakpoints[2].gap, heightModeMobile: s.breakpoints[2].mode,
      heightTablet: s.breakpoints[1].height, aspectDesktop: s.breakpoints[0].aspect, radiusBottomLeft: s.radius[3],
    };
    for (const f of manifest.fields.filter((x) => x.key in byKey)) expect(byKey[f.key]).toBe(f.default);
    expect(s.cards).toEqual([]);
  });

  it('accepts toggles as real booleans, the way Duda sends them', () => {
    const s = readSettings({ flipOnHover: false, openInNewTab: true, fillColumn: true }, document.createElement('div'));
    expect([s.hoverFlip, s.newTab, s.fillColumn]).toEqual([false, true, true]);
  });

  it('accepts a link or image given as an object', () => {
    const s = readSettings({ cards: [{ title: 'T', image: { url: 'https://e.com/a.jpg' }, link: { href: '/x' } }] }, document.createElement('div'));
    expect([s.cards[0].image, s.cards[0].link]).toEqual(['https://e.com/a.jpg', '/x']);
  });
});

describe('no-SDK widget', () => {
  it('opts out of the SDK and never imports it', () => {
    expect(existsSync(join(here, '.no-sdk'))).toBe(true);
    for (const f of readdirSync(here).filter((n) => n.endsWith('.ts') && !n.endsWith('.test.ts'))) {
      expect(read(f)).not.toMatch(/core\/(sdk|jobs)|window\.shazamme|__shazSDK/);
    }
  });
});
