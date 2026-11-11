// @vitest-environment jsdom
// Runs the real installApplyLoader/setSubmitting bodies against a DOM with real
// jQuery: the button must lock and show its spinner while submitting, and give
// the label back afterwards, even after jQuery's inline .show() has touched it.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, it, expect, beforeEach } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'legacy.js'), 'utf8');
const JQUERY = readFileSync(createRequire(import.meta.url).resolve('jquery/dist/jquery.js'), 'utf8');

function body(marker: string): string {
  const start = src.indexOf(marker);
  if (start < 0) throw new Error(`marker not found: ${marker}`);
  let depth = 0;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  throw new Error(`unbalanced braces after ${marker}`);
}

type Api = { install: () => void; set: (on: boolean) => void; busy: () => boolean };

function mount(buttonHtml: string, config: Record<string, unknown> = {}): { api: Api; root: HTMLElement } {
  document.head.innerHTML = '';
  document.body.innerHTML = `<div id="w">${buttonHtml}<div class="fcLoader"></div></div>`;
  // eslint-disable-next-line no-new-func
  new Function(JQUERY)();
  const $ = (window as unknown as { jQuery: unknown }).jQuery;
  const root = document.getElementById('w') as HTMLElement;
  const code = [body('function installApplyLoader() {'), body('function setSubmitting(on) {'), body('function isSubmitting() {')].join('\n');
  // eslint-disable-next-line no-new-func
  const api = new Function('$', 'element', 'data', 'document', `${code}; return { install: installApplyLoader, set: setSubmitting, busy: isSubmitting };`)(
    $, root, { config }, document,
  ) as Api;
  return { api, root };
}

const NESCO_BUTTON = '<div class="submitApplicationBtn"><div class="applyText"><span class="text">QUICK APPLY</span></div> <span class="loaderSpinner"><i class="fa fa-circle-o-notch fa-spin"></i> Submiting application...</span></div>';

describe('apply button loader behaviour', () => {
  let api: Api; let root: HTMLElement;
  beforeEach(() => { ({ api, root } = mount(NESCO_BUTTON)); api.install(); });

  it('installs one stylesheet even when called twice', () => {
    api.install();
    expect(document.querySelectorAll('#shm-apply-loader-style').length).toBe(1);
  });

  it('locks the button, shows the spinner with the typo fixed, and mirrors the legacy overlay class', () => {
    api.set(true);
    const btn = root.querySelector('.submitApplicationBtn') as HTMLElement;
    expect(btn.classList.contains('shm-submitting')).toBe(true);
    expect(api.busy()).toBe(true);
    expect(btn.querySelector('.loaderSpinner')?.textContent?.trim()).toBe('Submitting application...');
    expect(btn.querySelector('.loaderSpinner i')).not.toBeNull();
    expect(root.querySelector('.fcLoader')?.classList.contains('fcLoadingSeek')).toBe(true);
  });

  it('releases everything on setSubmitting(false)', () => {
    api.set(true); api.set(false);
    expect(api.busy()).toBe(false);
    expect(root.querySelector('.submitApplicationBtn')?.classList.contains('shm-submitting')).toBe(false);
    expect(root.querySelector('.fcLoader')?.classList.contains('fcLoadingSeek')).toBe(false);
  });

  it('hides the label with !important so an earlier inline .show() cannot bring it back mid-submit', () => {
    const css = document.getElementById('shm-apply-loader-style')?.textContent ?? '';
    expect(css).toContain('.submitApplicationBtn.shm-submitting .applyText{display:none!important}');
    expect(css).toContain('.submitApplicationBtn.shm-submitting{pointer-events:none');
  });

  it('adds a spinner to a template that has none, and honours submittingText', () => {
    ({ api, root } = mount('<div class="submitApplicationBtn"><div class="applyText">APPLY</div></div>', { submittingText: 'Sending…' }));
    api.install(); api.set(true);
    expect(root.querySelector('.submitApplicationBtn .loaderSpinner')?.textContent?.trim()).toBe('Sending…');
  });
});
