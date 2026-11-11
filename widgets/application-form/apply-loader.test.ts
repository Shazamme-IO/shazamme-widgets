// The apply button must show a loader while the application submits (Rick,
// 2026-11-11: "all forms should start to have this"). The legacy flow already
// toggles .fcLoader.fcLoadingSeek; these tests pin the stylesheet that makes it
// visible and the guard that stops a second click mid-submit.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'legacy.js'), 'utf8');

function body(marker: string): string {
  const start = src.indexOf(marker);
  expect(start, `marker not found: ${marker}`).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  throw new Error(`unbalanced braces after ${marker}`);
}

describe('apply button loader', () => {
  it('is installed at widget start, after the typed-resume setup', () => {
    expect(src.indexOf('setupTypedResume();\ninstallApplyLoader();')).toBeGreaterThan(-1);
  });

  it('injects one stylesheet that shows the in-button spinner only while submitting', () => {
    const fn = body('function installApplyLoader() {');
    expect(fn).toContain("document.getElementById('shm-apply-loader-style')");
    expect(fn).toContain('.submitApplicationBtn .loaderSpinner{display:none}');
    expect(fn).toContain('.submitApplicationBtn.shm-submitting .applyText{display:none!important}');
    expect(fn).toContain('.submitApplicationBtn.shm-submitting .loaderSpinner{display:inline-block');
    expect(fn).toContain('@keyframes shmApplySpin');
  });

  it('blocks clicks on the button while submitting', () => {
    const fn = body('function installApplyLoader() {');
    expect(fn).toContain('.submitApplicationBtn.shm-submitting{pointer-events:none');
    const click = body("$(element).find('.submitApplicationBtn').click(function() {");
    expect(click.indexOf('if (isSubmitting())')).toBeLessThan(click.indexOf('getJobID()'));
  });

  it('setSubmitting drives the button spinner and the legacy overlay together, adding the spinner when a template lacks it', () => {
    const fn = body('function setSubmitting(on) {');
    expect(fn).toContain("button.toggleClass('shm-submitting', on)");
    expect(fn).toContain("el.find('.fcLoader').toggleClass('fcLoadingSeek', on)");
    expect(fn).toContain("if (on && !button.find('.loaderSpinner').length)");
  });

  it('every start and stop in the submit flow goes through setSubmitting', () => {
    const click = body("$(element).find('.submitApplicationBtn').click(function() {");
    expect((click.match(/setSubmitting\(true\)/g) ?? []).length).toBe(1);
    expect((click.match(/setSubmitting\(false\)/g) ?? []).length).toBeGreaterThanOrEqual(8);
    expect(src).not.toMatch(/\.(addClass|removeClass)\('fcLoadingSeek'\)/);
  });
});
