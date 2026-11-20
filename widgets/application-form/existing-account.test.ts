// duda-widget #25: only auth/invalid-email is a bad address. A candidate who
// already has a Shazamme login (shared Firebase project, often from another
// Shazamme site) is sent to the login form instead of "Please use a valid email".
// Runs the real register() chain from legacy.js against stubbed Duda/SDK globals.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'legacy.js'), 'utf8');

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

function constant(name: string): string {
  const m = src.match(new RegExp(`^const ${name} = .*$`, 'm'));
  if (!m) throw new Error(`constant not found: ${name}`);
  return m[0];
}

type Call = [string, string, unknown[]];

function fakeJquery() {
  const calls: Call[] = [];
  const node = (selector: string): unknown => new Proxy({}, {
    get: (_, method: string) => (...args: unknown[]) => {
      calls.push([selector, method, args]);
      return method === 'find' ? node(args[0] as string) : node(selector);
    },
  });
  const $ = (selector: unknown) => node(typeof selector === 'string' ? selector : '<element>');
  const called = (selector: string, method: string) => calls.filter(([s, m]) => s === selector && m === method);
  return { $, called };
}

type Opts = { config?: Record<string, unknown>; validate?: Promise<unknown>; create?: Promise<unknown>; email?: string };

function mount(opts: Opts) {
  const { $, called } = fakeJquery();
  const alert = vi.fn();
  const w = { warn: vi.fn(), log: vi.fn() };
  const window = { scrollTo: vi.fn() };
  const setSubmitting = vi.fn();
  const firebase = {
    validateEmail: vi.fn(() => opts.validate ?? Promise.resolve([])),
    create: vi.fn(() => opts.create ?? Promise.resolve({ uid: 'uid-1' })),
  };
  const ctx: Record<string, unknown> = {
    $, alert, w, window, setSubmitting,
    buttonAction: vi.fn(),
    element: {},
    data: { config: { warningEmail: 'Please use a valid email address', ...opts.config } },
    shazamme: { firebase: () => firebase, uuid: () => 'cand-1' },
    collectRegisterFormValues: () => ({ eMail: opts.email ?? 'candidate@example.com', password: 'pw', firstName: 'S' }),
    isObjectComplete: () => true,
    isAcceptedPassword: true,
    shouldUploadResume: false,
  };
  const code = [
    constant('normalizeEmail'),
    constant('isInvalidEmailError'),
    constant('isEmailInUseError'),
    body('function promptExistingAccount(email) {'),
    body('const register = () => {'),
  ].join('\n');
  const keys = Object.keys(ctx);
  // eslint-disable-next-line no-new-func
  const register = new Function(...keys, `${code}; return register;`)(...keys.map((k) => ctx[k])) as () => Promise<{ firebaseUserID: string }>;
  return { register, alert, w, window, firebase, setSubmitting, called };
}

const reject = (code: string, msg?: string) => Promise.reject({ code, msg });
const rejected = (p: Promise<unknown>) => p.then(() => false, () => true);

// people2people: passwords off, anonymous apply off.
const p2p = { showPassword: false, useAnonymous: false };

describe('register(): existing account', () => {
  it('create rejecting auth/email-already-in-use opens the login form, never "invalid email"', async () => {
    const t = mount({ config: p2p, create: reject('auth/email-already-in-use') });

    expect(await rejected(t.register())).toBe(true);
    expect(t.alert).toHaveBeenCalledTimes(1);
    expect(t.alert.mock.calls[0][0]).toMatch(/already have an account/);
    expect(t.alert.mock.calls[0][0]).not.toMatch(/valid email/i);
    expect(t.called('#emailLogin', 'val')).toEqual([['#emailLogin', 'val', ['candidate@example.com']]]);
    expect(t.called('.shmLoginContainer', 'show')).toHaveLength(1);
    expect(t.setSubmitting).toHaveBeenCalledWith(false);
    expect(t.setSubmitting).not.toHaveBeenCalledWith(true);
    expect(t.window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('an existing account reported by the email check skips the create call', async () => {
    const t = mount({ config: p2p, validate: Promise.resolve(['password']) });

    expect(await rejected(t.register())).toBe(true);
    expect(t.firebase.create).not.toHaveBeenCalled();
    expect(t.alert.mock.calls).toHaveLength(1);
    expect(t.alert.mock.calls[0][0]).toMatch(/already have an account/);
  });

  it('the site can override the existing-account message', async () => {
    const t = mount({ config: { ...p2p, warningEmailExists: 'Custom copy' }, validate: Promise.resolve(['password']) });

    await rejected(t.register());
    expect(t.alert.mock.calls).toEqual([['Custom copy']]);
  });
});

describe('register(): what still counts as an invalid email', () => {
  it('auth/invalid-email from the email check shows the invalid-email warning and never creates', async () => {
    const t = mount({ config: p2p, validate: reject('auth/invalid-email') });

    expect(await rejected(t.register())).toBe(true);
    expect(t.alert.mock.calls).toEqual([['Please use a valid email address']]);
    expect(t.firebase.create).not.toHaveBeenCalled();
  });

  it('trims and lower-cases the address before checking it', async () => {
    const t = mount({ config: p2p, email: '  Candidate@Example.COM ' });

    await t.register();
    expect(t.firebase.validateEmail).toHaveBeenCalledWith('candidate@example.com');
    expect(t.firebase.create.mock.calls[0][0]).toBe('candidate@example.com');
  });
});

describe('register(): failures that are not a verdict on the address', () => {
  it('a rate-limited email check still creates the account', async () => {
    const t = mount({ config: p2p, validate: reject('auth/too-many-requests') });

    expect((await t.register()).firebaseUserID).toBe('uid-1');
    expect(t.alert).not.toHaveBeenCalled();
    expect(t.w.warn).toHaveBeenCalledWith('Email check skipped', 'auth/too-many-requests');
  });

  it('a create failure shows its own message, not "invalid email"', async () => {
    const t = mount({ config: p2p, create: reject('auth/network-request-failed', 'A network error has occurred.') });

    expect(await rejected(t.register())).toBe(true);
    expect(t.alert.mock.calls).toEqual([['A network error has occurred.']]);
    expect(t.setSubmitting).toHaveBeenCalledWith(false);
  });
});
