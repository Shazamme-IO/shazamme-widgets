// @vitest-environment jsdom
// Chrome/Edge pair a formless password field with any formless text input on the page.
// The login dialog sits hidden on every page, so a saved login was autofilled into the
// job-results keyword filter (SHK, every Shazamme site). These mount the built bundle
// in jsdom against the live template and check the browser's form ownership directly.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'login-dialog', VERSION, 'widget.min.js'), 'utf8');
const JQUERY = readFileSync(createRequire(import.meta.url).resolve('jquery/dist/jquery.js'), 'utf8');

// Trimmed from the live login-dialog template on shk.com.au/jobs, with the job-results
// keyword filter exactly as that page renders it.
const PAGE = `
<div class="shmFiltersContainer">
  <input class="filter-field" data-rel="job-result-filter-keyword" data-keyword-field="keyword" autocomplete="no" placeholder="Search...">
</div>
<div id="widget">
  <div class="dialog-overlay hidden">
    <div class="dialog hidden" data-rel="dialog" data-dialog="login">
      <div class="dialog-title" data-rel="dialog-title">Sample Title</div>
      <div class="field-set" data-rel="collection-fields">
        <div class="field-separator"></div>
        <div class="button-set">
          <button class="button-submit" data-rel="button-submit"><span class="text">Login</span></button>
          <button class="button-dismiss" data-rel="button-dismiss"><span>Cancel</span></button>
        </div>
        <div class="button-set">
          <button class="button-icon hidden fab fa-google" data-rel="button-provider" data-provider="googleProvider"></button>
        </div>
      </div>
    </div>
  </div>
</div>`;

const FIELDS = [
  { fieldName: 'uid', fieldPlaceholder: 'Email' },
  { fieldName: 'secret', fieldPlaceholder: 'Password' },
  { fieldName: 'code', fieldPlaceholder: 'Access code' },
  { fieldName: 'toString', fieldPlaceholder: 'Inherited key' },
  { fieldName: 'button', fieldLabel: 'Forgot password?', buttonLink: '/forgot-password' },
];

// $(html, { attr: value }) calls $.fn[attr](value) whenever a plugin of that name is
// loaded. Live sites load jQuery UI, whose $.fn.autocomplete threw on 'username' and left
// the dialog with no fields. Record every element built that way, from every mount path,
// and keep a jQuery UI-style autocomplete on the page as the live sites have it.
const propsBagCalls: string[] = [];

function installPropsBagGuard($: any) {
  const init = $.fn.init;
  const guarded = function (this: unknown, selector: unknown, context: unknown, root: unknown) {
    if (typeof selector === 'string' && selector.trim().startsWith('<')
      && context && Object.getPrototypeOf(context) === Object.prototype) {
      propsBagCalls.push(selector);
    }
    return new init(selector, context, root);
  };
  guarded.prototype = $.fn;
  $.fn.init = guarded;

  $.fn.autocomplete = function (this: unknown, opt: unknown) {
    if (typeof opt === 'string') {
      throw new Error(`cannot call methods on autocomplete prior to initialization; attempted to call method '${opt}'`);
    }
    return this;
  };
}

async function mount(useDefaults: boolean, page = PAGE) {
  const win = window as unknown as Window & typeof globalThis & Record<string, any>;
  win.document.body.innerHTML = page;
  if (!win.jQuery) {
    win.eval(JQUERY);
    installPropsBagGuard((win as Record<string, any>).jQuery);
  }

  const auth = vi.fn(() => Promise.resolve({}));
  const w = {
    defaults: () => Promise.resolve({ fieldList: FIELDS }),
    config: () => Promise.resolve({}),
    sub: () => {},
    unsub: () => {},
    pub: () => {},
    bag: () => undefined,
    ex: () => {},
  };
  win.shazamme = {
    ready: () => Promise.resolve(),
    register: () => w,
    firebase: () => ({ auth, signOut: () => {}, oauth: () => Promise.resolve() }),
    bag: () => undefined,
    sub: () => {},
    pub: () => {},
    user: () => Promise.resolve(null),
  };

  win.eval(BUNDLE);
  const run = () => win.ShazammeWidget['login-dialog']({
    element: win.document.getElementById('widget')!,
    // Most sites run on the defaults, whose fields render after an async lookup.
    data: { config: { fieldList: useDefaults ? [] : FIELDS, useDefaults }, inEditor: false, siteId: 's1' },
    $: win.jQuery,
    shazamme: win.shazamme,
  });
  run();
  await vi.waitFor(() => expect(win.document.querySelector('[data-field=secret]')).not.toBeNull());

  const q = <T extends Element>(s: string) => win.document.querySelector(s) as unknown as T;
  return { win, auth, q, run };
}

describe.each([
  ['configured fields', false],
  ['default fields', true],
])('login-dialog form scope (%s)', (_, useDefaults) => {
  let ctx: Awaited<ReturnType<typeof mount>>;
  beforeEach(async () => {
    propsBagCalls.length = 0;
    ctx = await mount(useDefaults);
  });
  afterEach(() => {
    expect(propsBagCalls, 'built with a $(html, props) bag').toEqual([]);
  });

  it('puts the password field in a form of its own', () => {
    const secret = ctx.q<HTMLInputElement>('[data-field=secret]');
    expect(secret.form).not.toBeNull();
    expect(secret.form!.classList.contains('login-form')).toBe(true);
  });

  it('keeps the username in the same form as the password', () => {
    expect(ctx.q<HTMLInputElement>('[data-field=uid]').form)
      .toBe(ctx.q<HTMLInputElement>('[data-field=secret]').form);
  });

  it('leaves the job-results filter outside that form', () => {
    const filter = ctx.q<HTMLInputElement>('[data-rel=job-result-filter-keyword]');
    expect(filter.form).not.toBe(ctx.q<HTMLInputElement>('[data-field=secret]').form);
  });

  it('labels the fields for the password manager', () => {
    expect(ctx.q<HTMLInputElement>('[data-field=uid]').getAttribute('autocomplete')).toBe('username');
    expect(ctx.q<HTMLInputElement>('[data-field=secret]').getAttribute('autocomplete')).toBe('current-password');
  });

  it('labels only the uid field as the username', () => {
    expect(ctx.q<HTMLInputElement>('[data-field=code]').hasAttribute('autocomplete')).toBe(false);
    expect(ctx.q<HTMLInputElement>('[data-field=toString]').hasAttribute('autocomplete')).toBe(false);
  });

  it('does not change the layout box the fields sit in', () => {
    const form = ctx.q<HTMLFormElement>('form.login-form');
    expect(form.style.display).toBe('contents');
    expect(form.style.getPropertyPriority('display')).toBe('important');
    expect(form.parentElement!.matches('.dialog')).toBe(true);
    expect(form.firstElementChild!.matches('.field-set')).toBe(true);
  });

  it('has no submit button, so Enter cannot click Login a second time', () => {
    const buttons = Array.from(ctx.q<HTMLFormElement>('form.login-form').querySelectorAll('button'));
    expect(buttons.length).toBeGreaterThanOrEqual(4);
    expect(buttons.filter((b) => b.type !== 'button')).toEqual([]);
  });

  it('never navigates the page on submit', () => {
    const form = ctx.q<HTMLFormElement>('form.login-form');
    const ev = new ctx.win.Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it('still logs in with the entered credentials', async () => {
    ctx.q<HTMLInputElement>('[data-field=uid]').value = 'a@b.co';
    ctx.q<HTMLInputElement>('[data-field=secret]').value = 'pw';
    ctx.q<HTMLButtonElement>('[data-rel=button-submit]').click();
    await vi.waitFor(() => expect(ctx.auth).toHaveBeenCalledWith('a@b.co', 'pw'));
    expect(ctx.auth).toHaveBeenCalledTimes(1);
  });

  // jsdom has no implicit submission, so this covers the keyup path only; the
  // type=button tests above are what keep Enter from also clicking Login.
  it('logs in once on Enter via the keyup handler', async () => {
    ctx.q<HTMLInputElement>('[data-field=uid]').value = 'a@b.co';
    const secret = ctx.q<HTMLInputElement>('[data-field=secret]');
    secret.value = 'pw';
    secret.dispatchEvent(new ctx.win.KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    await vi.waitFor(() => expect(ctx.auth).toHaveBeenCalledWith('a@b.co', 'pw'));
    expect(ctx.auth).toHaveBeenCalledTimes(1);
  });

  it('demotes a template button that is explicitly type=submit', async () => {
    ctx = await mount(useDefaults, PAGE.replace('class="button-submit"', 'type="submit" class="button-submit"'));
    expect(ctx.q<HTMLButtonElement>('[data-rel=button-submit]').type).toBe('button');
  });

  it('still blocks submit when the markup already carries the form', async () => {
    const serialized = ctx.win.document.body.innerHTML;
    ctx = await mount(useDefaults, serialized);
    const form = ctx.q<HTMLFormElement>('form.login-form');
    const ev = new ctx.win.Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it('does not nest a second form when mounted again on the same element', () => {
    ctx.run();
    expect(ctx.win.document.querySelectorAll('form.login-form')).toHaveLength(1);
  });
});
