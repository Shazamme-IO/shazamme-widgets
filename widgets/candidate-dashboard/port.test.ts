// @vitest-environment jsdom
// The legacy candidate dashboard was pasted inline in Widget Builder and did one
// candidate lookup on boot. Ported, it must go through the shared SDK loader and
// honour the register widget's instant hand-off: when `_pendingAuth` is present the
// candidate may not exist yet, so the boot polls before deciding instead of bouncing
// the new registrant to /login.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, it, expect, vi, afterEach } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'candidate-dashboard', VERSION, 'widget.min.js'), 'utf8');
const JQUERY = readFileSync(createRequire(import.meta.url).resolve('jquery/dist/jquery.js'), 'utf8');

// Trimmed from the live template on publicsectorpeople.com.au/candidate-dashboard.
const PAGE = `
<div id="widget">
  <div class="accDashboard-accImg"></div>
  <span class="accDashboard-accName"></span>
  <span class="accDashboard-detailEmail"></span>
  <span class="accDashboard-detailPhone"></span>
  <span class="accDashboard-addressDetail"></span>
  <a class="accDashboard-detailResume"></a>
  <input id="newPass" type="password">
  <span id="length"></span><span id="capital"></span><span id="number"></span><span id="specialChar"></span>
</div>`;

const PENDING = { email: 'ada@example.com', uid: 'uid-1', isOAuth: false };
const CANDIDATE = { candidate: { isValidated: true, firstName: 'Ada', surname: 'Lovelace', eMail: 'ada@example.com' } };

type Win = Record<string, any>;

function mount(opts: { pending?: unknown; user?: unknown; auth: () => Promise<unknown> }) {
  const win = window as unknown as Win;
  win.document.body.innerHTML = PAGE;
  win.localStorage.clear();
  if (opts.pending) win.localStorage.setItem('_pendingAuth', JSON.stringify(opts.pending));
  if (!win.jQuery) win.eval(JQUERY);
  const getScript = vi.spyOn(win.jQuery, 'getScript');

  const requested: string[] = [];
  win.__shazLoadScript = vi.fn((src: string) => {
    requested.push(src);
    return Promise.resolve();
  });

  const w = { sub: vi.fn(), pub: vi.fn(), bag: () => undefined };
  win.shazamme = {
    ready: vi.fn(() => Promise.resolve()),
    register: vi.fn(() => w),
    user: vi.fn(() => Promise.resolve(opts.user ?? null)),
    auth: vi.fn(opts.auth),
    pub: vi.fn(),
    message: { auth: 'site-auth' },
    site: () => Promise.resolve({ siteID: 'site-1' }),
    // Stop the dashboard data chain after the profile renders: jobs are not under test.
    fetch: () => new Promise(() => {}),
    firebase: () => ({}),
    bag: () => undefined,
    endSession: vi.fn(),
  };

  delete win.ShazammeWidget;
  win.eval(BUNDLE);
  win.ShazammeWidget['candidate-dashboard']({
    element: win.document.getElementById('widget')!,
    data: { config: {}, inEditor: false, siteId: 's1', page: 'candidate-dashboard' },
    $: win.jQuery,
    shazamme: win.shazamme,
  });

  const $ = (s: string) => win.jQuery(s);
  return { win, requested, getScript, w, $ };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

afterEach(() => {
  vi.useRealTimers();
});

describe('candidate-dashboard port', () => {
  it('loads the SDK through the shared loader, never its own $.getScript', async () => {
    const { requested, getScript, win } = mount({ auth: () => Promise.resolve(CANDIDATE) });
    await vi.waitFor(() => expect(win.shazamme.register).toHaveBeenCalled());

    expect(getScript).not.toHaveBeenCalled();
    expect(requested).toEqual(['https://sdk.shazamme.io/js/shazamme-1.0.3.min.js']);
    expect(win.shazamme.ready).toHaveBeenCalledWith('s1', 'candidate-dashboard');
    expect(win.shazamme.register).toHaveBeenCalledWith('candidate-dashboard', expect.objectContaining({ siteId: 's1' }));
  });

  it('boots the old way when no registration is pending', async () => {
    const { win } = mount({ user: CANDIDATE, auth: () => Promise.resolve(CANDIDATE) });
    await vi.waitFor(() => expect(win.shazamme.user).toHaveBeenCalledWith(true));
    await flush();

    expect(win.shazamme.auth).not.toHaveBeenCalled();
    expect(win.jQuery('.accDashboard-accName').text()).toBe('Ada Lovelace');
  });

  it('renders a just-registered candidate once the backend has it, and tells quick-nav', async () => {
    const { win, $ } = mount({ pending: PENDING, auth: () => Promise.resolve(CANDIDATE) });
    await vi.waitFor(() => expect($('.accDashboard-accName').text()).toBe('Ada Lovelace'));

    expect(win.shazamme.auth).toHaveBeenCalledTimes(1);
    expect(win.shazamme.auth).toHaveBeenCalledWith('ada@example.com', 'uid-1', false);
    expect(win.shazamme.user).not.toHaveBeenCalled();
    expect(win.shazamme.pub).toHaveBeenCalledWith('site-auth', CANDIDATE);
    expect(win.localStorage.getItem('_pendingAuth')).toBeNull();
  });

  it('keeps polling every 1.5s until the candidate appears', async () => {
    vi.useFakeTimers();
    let calls = 0;
    const { win, $ } = mount({ pending: PENDING, auth: () => Promise.resolve(++calls < 3 ? {} : CANDIDATE) });
    await vi.advanceTimersByTimeAsync(0);
    expect(win.shazamme.auth).toHaveBeenCalledTimes(1);
    expect($('.accDashboard-accName').text()).toBe('');

    await vi.advanceTimersByTimeAsync(1500);
    expect(win.shazamme.auth).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1500);
    expect(win.shazamme.auth).toHaveBeenCalledTimes(3);
    expect($('.accDashboard-accName').text()).toBe('Ada Lovelace');
  });

  it('gives up after 20 retries and falls through to the signed-out handling', async () => {
    vi.useFakeTimers();
    const { win } = mount({ pending: PENDING, auth: () => Promise.resolve({}) });
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(20 * 1500);

    expect(win.shazamme.auth).toHaveBeenCalledTimes(21);
    expect(win.shazamme.pub).toHaveBeenCalledWith('site-auth', {});
    expect(win.localStorage.getItem('_pendingAuth')).toBeNull();
  });

  it('consumes the pending key on first read so it can never be replayed', async () => {
    const { win } = mount({ pending: PENDING, auth: () => new Promise(() => {}) });
    await vi.waitFor(() => expect(win.shazamme.auth).toHaveBeenCalled());

    expect(win.localStorage.getItem('_pendingAuth')).toBeNull();
  });
});
