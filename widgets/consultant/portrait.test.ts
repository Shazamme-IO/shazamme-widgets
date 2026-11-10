// @vitest-environment jsdom
// Runtime check for the Consultant portrait fix (Freshdesk 14329, issue #54): the portrait is
// sized inline but its shape is not, and the default circle is a single <style> first in <head>.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const body = readFileSync(join(here, 'legacy.js'), 'utf8');

describe('consultant portrait shape', () => {
  it('at runtime sizes the portrait without touching its border-radius, and injects the default style once', () => {
    const setImportant = body.match(/function setImportant\(el, props\)\{[\s\S]*?\n\}/)![0];
    const fluidPortraits = body.match(/function fluidPortraits\(\)\{[\s\S]*?\n\}/)![0];
    const ensure = body.match(/var PORTRAIT_STYLE_ID = [^\n]+\n\nfunction ensurePortraitStyle\(\)\{[\s\S]*?\n\}/)![0];
    document.head.innerHTML = '<link id="site-css">';
    document.body.innerHTML = '<div id="w"><div class="consultList-consultant"><div class="consultList-consultImg"></div></div></div>';
    const element = document.getElementById('w')!;
    element.querySelector<HTMLElement>('.consultList-consultant')!.getBoundingClientRect = () => ({ width: 300 } as DOMRect);
    const $ = (root: Element) => ({
      find: (sel: string) => ({ each: (fn: (this: Element) => void) => root.querySelectorAll(sel).forEach((el) => fn.call(el)) }),
    });
    const run = new Function('element', '$', 'document', 'PORTRAIT_SHARE', 'PORTRAIT_MAX',
      `${setImportant}; ${fluidPortraits}; ${ensure}; ensurePortraitStyle(); ensurePortraitStyle(); fluidPortraits();`);
    run(element, $, document, 0.8, 230);
    const img = element.querySelector<HTMLElement>('.consultList-consultImg')!;
    expect(img.style.getPropertyValue('width')).toBe('230px');
    expect(img.style.getPropertyValue('border-radius')).toBe('');
    const styles = document.head.querySelectorAll('#shm-consultant-portrait-default');
    expect(styles.length).toBe(1);
    expect(styles[0].textContent).toBe('.consultList-consultImg{border-radius:50%}');
    expect(document.head.firstElementChild).toBe(styles[0]);
  });
});
