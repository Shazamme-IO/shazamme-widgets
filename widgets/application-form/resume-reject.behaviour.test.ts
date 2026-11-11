// @vitest-environment jsdom
// A rejected resume file must be visible two ways: a red line under the field
// and the site dialog (site-config's alertDialog returns a detached element
// that the caller has to append), falling back to alert() when there is none.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, it, expect, vi } from 'vitest';

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

type Api = { reject: (input: HTMLInputElement, message: string, title: string) => void; show: (input: HTMLInputElement, message: string) => void };

function mount(alertDialog?: (o: { title: string; message: string }) => unknown) {
  document.head.innerHTML = '';
  document.body.innerHTML = '<div id="w"><div class="radioBtnContainer"><div class="fileUploadContainer" style="display:flex"><input type="file" id="resume" name="resume"></div></div></div>';
  // eslint-disable-next-line no-new-func
  new Function(JQUERY)();
  const w = window as unknown as { jQuery: unknown; shazamme?: unknown };
  w.shazamme = alertDialog ? { bag: (n: string) => (n === 'site-config' ? { alertDialog } : undefined) } : undefined;
  const alert = vi.fn();
  const code = [body('function showFieldError(input, message) {'), body('function notify(message, title) {'), body('function rejectUpload(input, message, title) {')].join('\n');
  // eslint-disable-next-line no-new-func
  const api = new Function('$', 'element', 'document', 'window', 'alert', `${code}; return { reject: rejectUpload, show: showFieldError };`)(
    w.jQuery, document.getElementById('w'), document, window, alert,
  ) as Api;
  return { api, alert, input: document.getElementById('resume') as HTMLInputElement };
}

describe('rejected resume file', () => {
  it('puts a red line after the field container, keeps line breaks, and clears it', () => {
    const { api, input } = mount();
    api.reject(input, 'Not supported.\n\nTry typing it.', 'File not supported');
    const line = document.querySelector('.fileUploadContainer + .shm-field-error') as HTMLElement;
    expect(line.textContent).toBe('Not supported.\n\nTry typing it.');
    expect(line.getAttribute('data-for')).toBe('resume');
    expect(document.getElementById('shm-field-error-style')?.textContent).toContain('white-space:pre-line');
    api.show(input, '');
    expect(document.querySelector('.shm-field-error')).toBeNull();
  });

  it('appends the site dialog to the widget (alertDialog returns a detached element) with the message escaped', () => {
    const $ = (window as unknown as { jQuery: (s: string) => { appendTo: (t: unknown) => unknown; attr: (n: string, v: string) => unknown } }).jQuery;
    let got: { title: string; message: string } | null = null;
    const { api, alert, input } = mount((o) => { got = o; return $('<div class="dialog shazamme-dialog alert"></div>').attr('data-msg', o.message); });
    api.reject(input, 'Upload <b>PDF</b> & co.\nOr type it.', 'File not supported');
    expect(got).toEqual({ title: 'File not supported', message: 'Upload &lt;b&gt;PDF&lt;/b&gt; &amp; co.<br>Or type it.' });
    expect(document.querySelector('#w .dialog.shazamme-dialog')).not.toBeNull();
    expect(alert).not.toHaveBeenCalled();
  });

  it('falls back to alert() when there is no site dialog', () => {
    const { api, alert, input } = mount();
    api.reject(input, 'Nope', 'File not supported');
    expect(alert).toHaveBeenCalledWith('Nope');
  });
});
