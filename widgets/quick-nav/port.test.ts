// @vitest-environment jsdom
// quick-nav was still pasted inline in the Shazamme editor, so every page that has it
// downloaded its own SDK copy (shazamme-1.0.2.min.js?_=<timestamp>, never cached) next
// to the shared one the ported widgets use. Ported, it must go through the shared
// loader and still render the signed-in / signed-out header links.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, it, expect, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'quick-nav', VERSION, 'widget.min.js'), 'utf8');
const JQUERY = readFileSync(createRequire(import.meta.url).resolve('jquery/dist/jquery.js'), 'utf8');

// Trimmed from the live quick-nav template on nescoresource.com.
const PAGE = `
<div id="widget">
  <div class="uqlMainContainer" style="display: none">
    <a class="uqlItem uqlLoginBtn" data-href="loginURL">Login</a>
    <span class="uqlDivider"></span>
    <a class="uqlItem uqlRegisterBtn" data-href="registerURL">Register</a>
    <div class="uqlControlLinks uqlHideLink">
      <div class="uqlProfileContainer"><img class="uqprofilePic"><span class="uqlCandidateInfo"></span></div>
      <div class="uqlLoggedInItemsContainer uqlHideLink">
        <a data-user-role="candidate" href="/dashboard">Dashboard</a>
        <a data-user-role="client" href="/client">Client</a>
        <a class="uqlSignOut">Sign out</a>
      </div>
    </div>
  </div>
</div>`;

type Win = Record<string, any>;

async function mount(user: unknown) {
  const win = window as unknown as Win;
  win.document.body.innerHTML = PAGE;
  win.localStorage.clear();
  if (!win.jQuery) win.eval(JQUERY);
  const getScript = vi.spyOn(win.jQuery, 'getScript');

  const requested: string[] = [];
  win.__shazLoadScript = vi.fn((src: string) => {
    requested.push(src);
    return Promise.resolve();
  });

  const w = { sub: vi.fn(), pub: vi.fn() };
  win.shazamme = {
    ready: vi.fn(() => Promise.resolve()),
    register: vi.fn(() => w),
    user: () => Promise.resolve(user),
    store: vi.fn(),
    bag: () => undefined,
    firebase: () => ({ signOut: vi.fn() }),
  };

  delete win.ShazammeWidget;
  win.eval(BUNDLE);
  win.ShazammeWidget['quick-nav']({
    element: win.document.getElementById('widget')!,
    data: {
      config: { registerURL: { href: '/register' }, loginURL: { href: '/login' } },
      inEditor: false,
      siteId: 's1',
      page: 'home',
      elementId: 'qn1',
    },
    $: win.jQuery,
    shazamme: win.shazamme,
  });

  await vi.waitFor(() => expect(win.shazamme.register).toHaveBeenCalled());
  await new Promise((r) => setTimeout(r, 0));

  const $ = (s: string) => win.jQuery(s);
  return { win, requested, getScript, w, $ };
}

describe('quick-nav port', () => {
  it('loads the SDK through the shared loader, never its own cache-busted copy', async () => {
    const { requested, getScript } = await mount(null);

    expect(getScript).not.toHaveBeenCalled();
    expect(requested).toHaveLength(1);
    expect(requested[0]).toMatch(/^https:\/\/sdk\.shazamme\.io\/js\/shazamme-1\.0\.\d+\.min\.js$/);
  });

  it('registers as quick-nav once the SDK is ready', async () => {
    const { win } = await mount(null);

    expect(win.shazamme.ready).toHaveBeenCalledWith('s1', 'home');
    expect(win.shazamme.register).toHaveBeenCalledWith('quick-nav', expect.objectContaining({ siteId: 's1' }));
  });

  it('shows the login and register links to a signed-out visitor', async () => {
    const { $ } = await mount(null);

    expect($('.uqlMainContainer').css('display')).not.toBe('none');
    expect($('.uqlLoginBtn').hasClass('uqlHideLink')).toBe(false);
    expect($('.uqlControlLinks').hasClass('uqlHideLink')).toBe(true);
  });

  it('swaps to the profile menu for a verified candidate', async () => {
    const { $ } = await mount({ isVerified: true, firstName: 'Ada', is: ['candidate'] });

    expect($('.uqlLoginBtn').hasClass('uqlHideLink')).toBe(true);
    expect($('.uqlControlLinks').hasClass('uqlHideLink')).toBe(false);
    expect($('.uqlCandidateInfo').text()).toContain('Ada');
    expect($('[data-user-role=candidate]').css('display')).not.toBe('none');
    expect($('[data-user-role=client]').css('display')).toBe('none');
  });

  it.each([
    ['raw markup', '<img src=x onerror="window.__xss=1">'],
    ['entity-encoded markup', '&lt;img src=x onerror="window.__xss=1"&gt;'],
  ])('renders a %s first name as text, never as HTML', async (_, firstName) => {
    const { win, $ } = await mount({ isVerified: true, firstName, is: [] });

    expect($('.uqlCandidateInfo img')).toHaveLength(0);
    expect($('.uqlCandidateInfo').text()).toContain(firstName);
    expect($('.uqlCandidateInfo .boardy-caret')).toHaveLength(1);
    expect(win.__xss).toBeUndefined();
  });

  it('renders a cached first name as text on the fast path before the SDK answers', async () => {
    const win = window as unknown as Win;
    const firstName = '&lt;img src=x onerror="window.__xss=1"&gt;';
    const cached = { greeting: firstName, is: [], ttl: new Date(Date.now() + 60_000), photo: '' };
    win.document.body.innerHTML = PAGE;
    win.localStorage.setItem('qn1', btoa(unescape(encodeURIComponent(JSON.stringify(cached)))));
    win.__shazLoadScript = vi.fn(() => new Promise<void>(() => {}));
    delete win.ShazammeWidget;
    win.eval(BUNDLE);
    win.ShazammeWidget['quick-nav']({
      element: win.document.getElementById('widget')!,
      data: { config: {}, inEditor: false, siteId: 's1', page: 'home', elementId: 'qn1' },
      $: win.jQuery,
      shazamme: {},
    });

    expect(win.jQuery('.uqlCandidateInfo img')).toHaveLength(0);
    expect(win.jQuery('.uqlCandidateInfo').text()).toContain(firstName);
    expect(win.__xss).toBeUndefined();
  });

  it('wires the configured links onto the template', async () => {
    const { $ } = await mount(null);

    expect($('.uqlRegisterBtn').attr('href')).toBe('/register');
    expect($('.uqlLoginBtn').attr('href')).toBe('/login');
  });

  it('listens for sign-in from the login dialog', async () => {
    const { w } = await mount(null);

    expect(w.sub).toHaveBeenCalledWith('site-auth', expect.any(Function));
  });
});
