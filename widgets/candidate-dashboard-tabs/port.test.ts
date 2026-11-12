// @vitest-environment jsdom
// The tabbed candidate dashboard ("Candidate Dash v2") was pasted inline in Widget
// Builder and did one candidate lookup on boot. Ported, it must go through the shared
// SDK loader and honour the register widget's instant hand-off: when `_pendingAuth` is
// present the candidate may not exist yet, so the boot polls before deciding instead of
// bouncing the new registrant to /login. jsdom cannot navigate, and a redirect leaves
// window.location unusable, so the one test that must redirect runs last.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, it, expect, vi, afterEach } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'candidate-dashboard-tabs', VERSION, 'widget.min.js'), 'utf8');
const JQUERY = readFileSync(createRequire(import.meta.url).resolve('jquery/dist/jquery.js'), 'utf8');

// Trimmed from the widget's own HTML tab.
const PAGE = `
<div id="widget">
  <div class="section-tab-bar desktop"><a class="button-tab overview" data-rel="tab">Overview</a></div>
  <div class="dashboard-section-tab overview">
    <span class="accDashboard-accName"></span>
    <span class="accDashboard-detailEmail"></span>
    <div data-rel="section-saved-jobs"></div>
    <div data-rel="section-applications"></div>
  </div>
</div>`;

const PENDING = { email: 'ada@example.com', uid: 'uid-1', isOAuth: false };
const CANDIDATE = { candidate: { candidateID: 'cand-1', isValidated: true, firstName: 'Ada', surname: 'Lovelace', eMail: 'ada@example.com' } };

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
  // The widget reads the Firebase global at load (current user, auth state listener).
  const auth: any = () => ({ currentUser: null, onAuthStateChanged: vi.fn() });
  auth.EmailAuthProvider = { credential: vi.fn() };
  win.firebase = { auth };
  win.shazamme = {
    ready: vi.fn(() => Promise.resolve()),
    register: vi.fn(() => w),
    user: vi.fn(() => Promise.resolve(opts.user ?? null)),
    auth: vi.fn(opts.auth),
    pub: vi.fn(),
    message: { auth: 'site-auth' },
    site: () => Promise.resolve({ siteID: 'site-1' }),
    // The candidate's lists are requested through submit; stop the chain there.
    submit: vi.fn(() => new Promise(() => {})),
    fetch: () => new Promise(() => {}),
    firebase: () => ({}),
    bag: () => undefined,
    endSession: vi.fn(),
  };

  delete win.ShazammeWidget;
  win.eval(BUNDLE);
  win.ShazammeWidget['candidate-dashboard-tabs']({
    element: win.document.getElementById('widget')!,
    data: { config: {}, inEditor: false, siteId: 's1', page: 'dashboard' },
    $: win.jQuery,
    shazamme: win.shazamme,
  });

  return { win, requested, getScript, w };
}

const flush = () => new Promise((r) => setTimeout(r, 0));
const submittedFor = (win: Win, candidateId: string) =>
  win.shazamme.submit.mock.calls.some((c: any[]) => JSON.stringify(c[0]).includes(candidateId));

afterEach(() => {
  vi.useRealTimers();
});

describe('candidate-dashboard-tabs port', () => {
  it('loads the SDK through the shared loader, never its own $.getScript', async () => {
    const { requested, getScript, win } = mount({ user: CANDIDATE, auth: () => Promise.resolve(CANDIDATE) });
    await vi.waitFor(() => expect(win.shazamme.register).toHaveBeenCalled());

    expect(getScript).not.toHaveBeenCalled();
    expect(requested).toEqual(['https://sdk.shazamme.io/js/shazamme-1.0.3.min.js']);
    expect(win.shazamme.ready).toHaveBeenCalledWith('s1', 'dashboard');
    expect(win.shazamme.register).toHaveBeenCalledWith('candidate-dasboard-tabs', expect.objectContaining({ siteId: 's1' }));
  });

  it('boots the old way when no registration is pending', async () => {
    const { win } = mount({ user: CANDIDATE, auth: () => Promise.resolve(CANDIDATE) });
    await vi.waitFor(() => expect(win.shazamme.user).toHaveBeenCalledWith(true));
    await flush();

    expect(win.shazamme.auth).not.toHaveBeenCalled();
    expect(submittedFor(win, 'cand-1')).toBe(true);
  });

  it('renders a just-registered candidate once the backend has it, and tells quick-nav', async () => {
    const { win } = mount({ pending: PENDING, auth: () => Promise.resolve(CANDIDATE) });
    await vi.waitFor(() => expect(submittedFor(win, 'cand-1')).toBe(true));

    expect(win.shazamme.auth).toHaveBeenCalledTimes(1);
    expect(win.shazamme.auth).toHaveBeenCalledWith('ada@example.com', 'uid-1', false);
    expect(win.shazamme.user).not.toHaveBeenCalled();
    expect(win.shazamme.pub).toHaveBeenCalledWith('site-auth', CANDIDATE);
    expect(win.localStorage.getItem('_pendingAuth')).toBeNull();
  });

  it('keeps polling every 1.5s until the candidate appears', async () => {
    vi.useFakeTimers();
    let calls = 0;
    const { win } = mount({ pending: PENDING, auth: () => Promise.resolve(++calls < 3 ? {} : CANDIDATE) });
    await vi.advanceTimersByTimeAsync(0);
    expect(win.shazamme.auth).toHaveBeenCalledTimes(1);
    expect(submittedFor(win, 'cand-1')).toBe(false);

    await vi.advanceTimersByTimeAsync(1500);
    expect(win.shazamme.auth).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1500);
    expect(win.shazamme.auth).toHaveBeenCalledTimes(3);
    expect(submittedFor(win, 'cand-1')).toBe(true);
  });

  it('consumes the pending key on first read so it can never be replayed', async () => {
    const { win } = mount({ pending: PENDING, auth: () => new Promise(() => {}) });
    await vi.waitFor(() => expect(win.shazamme.auth).toHaveBeenCalled());

    expect(win.localStorage.getItem('_pendingAuth')).toBeNull();
  });

  it('gives up after 20 retries and falls through to the signed-out handling', async () => {
    vi.useFakeTimers();
    const { win } = mount({ pending: PENDING, auth: () => Promise.resolve({}) });
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(20 * 1500);

    expect(win.shazamme.auth).toHaveBeenCalledTimes(21);
    expect(win.shazamme.pub).toHaveBeenCalledWith('site-auth', {});
    expect(win.localStorage.getItem('_pendingAuth')).toBeNull();
    // manage() saw a user with no validated candidate: jsdom's confirm() returns
    // nothing, so the widget ends the session before sending the visitor to login.
    expect(win.shazamme.endSession).toHaveBeenCalled();
  });
});
