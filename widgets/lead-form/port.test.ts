// @vitest-environment jsdom
// lead-form was pasted JS in Widget Builder (v144). Ported, the bundle must still wire
// the form the same way: register under its name, reveal the form, load the pinned
// screening plugin with the resolved template id, gate free-email domains, and post
// the lead with the visible fields plus the UTM referral set.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, it, expect, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'lead-form', VERSION, 'widget.min.js'), 'utf8');
const JQUERY = readFileSync(createRequire(import.meta.url).resolve('jquery/dist/jquery.js'), 'utf8');

const PLUGIN_1_0_10 = 'https://sdk.shazamme.io/js/plugin/screening-question/1.0.10/plugin.min.js';

// Trimmed from the live Lead Form HTML tab: the collection fields, the screening
// container the plugin renders into, and the submit button with its text span.
const PAGE = `
<div id="widget">
  <div class="main-content" style="display:none">
    <div class="field-set" data-rel="collection-fields">
      <div class="field"><label class="required">First name</label><input type="text" data-field="firstName" required></div>
      <div class="field"><label class="required">Last name</label><input type="text" data-field="lastName" required></div>
      <div class="field"><label class="required">Email</label><input type="email" data-field="email" required></div>
      <div class="field"><label>Hidden helper</label><input type="text" data-field="--ignored" value="x"></div>
    </div>
    <div data-rel="data-screening-questions"></div>
    <button class="button-main" data-rel="action-apply"><span class="text">Submit</span></button>
  </div>
</div>`;

type Win = Window & typeof globalThis & Record<string, any>;

function mount(config: Record<string, unknown> = {}, opts: { inEditor?: boolean; sqSubmitOnly?: boolean } = {}) {
  const win = window as unknown as Win;
  win.document.body.innerHTML = PAGE;
  if (!win.jQuery) {
    win.eval(JQUERY);
    // jsdom has no layout, so jQuery's :visible (offsetWidth/offsetHeight) is false for
    // everything and the widget would collect no fields. Emulate it from computed style.
    const isShown = (el: any) => {
      let n = el;
      while (n && n.nodeType === 1) {
        if (win.getComputedStyle(n).display === 'none' || n.hasAttribute('hidden')) return false;
        n = n.parentNode;
      }
      return el.isConnected;
    };
    Object.defineProperties(win.HTMLElement.prototype, {
      offsetParent: { configurable: true, get() { return this.isConnected ? this.parentNode : null; } },
      offsetWidth: { configurable: true, get() { return isShown(this) ? 10 : 0; } },
      offsetHeight: { configurable: true, get() { return isShown(this) ? 10 : 0; } },
    });
  }
  // The build routes the legacy SDK bootstrap through the shared loader; resolve it
  // immediately so the widget's main() runs against the mocks below.
  win.__shazLoadScript = () => Promise.resolve();

  const scripts: string[] = [];
  const submits: any[] = [];
  const logs: any[] = [];
  const pluginCalls: any[] = [];
  const subs: Record<string, (...a: any[]) => void> = {};
  const w = {
    sub: (m: string, fn: (...a: any[]) => void) => { subs[m] = fn; return 0; },
    unsub: () => {},
    pub: () => {},
    bag: (() => { const b: Record<string, any> = {}; return (k: string, v?: any) => (v === undefined ? b[k] : (b[k] = v)); })(),
    warn: () => {},
    log: () => {},
  };
  const sq = {
    message: { submit: 'screening-question-apply' },
    knockout: () => true,
    validate: () => true,
    answers: () => ({ screeningTemplateID: 'tpl', values: [{ screeningQuestionID: 'q1', answerText: 'https://clientsite.com/employers' }] }),
  };
  win.shazamme = {
    ready: () => Promise.resolve(),
    register: () => w,
    bag: () => undefined,
    session: () => undefined,
    script: (src: string) => { scripts.push(src); return Promise.resolve(); },
    // Never resolves: on success the widget assigns window.location, which jsdom cannot
    // navigate and would leave every later mount with no href.
    submit: (d: any) => { submits.push(d); return new Promise(() => {}); },
    log: (...a: any[]) => { logs.push(a); },
    firebase: () => ({ validateEmail: () => Promise.resolve() }),
    plugin: { screeningQuestions: (_w: any, o: any) => { pluginCalls.push(o); return Promise.resolve(sq); } },
  };
  delete win.ShazammeWidget;
  win.eval(BUNDLE);

  const element = win.document.getElementById('widget')!;
  win.ShazammeWidget['lead-form']({
    element,
    data: { config, inEditor: opts.inEditor ?? false, siteId: 's1', page: 'employers' },
    $: win.jQuery,
    shazamme: win.shazamme,
  });
  const $: any = win.jQuery;
  const fill = (f: string, v: string) => $(element).find(`[data-field="${f}"]`).val(v);
  const submit = () => $(element).find('[data-rel=action-apply]').trigger('click');
  return { win, $, element, scripts, submits, logs, pluginCalls, subs, fill, submit };
}

const flush = () => new Promise((r) => setTimeout(r, 0));
// main() binds the submit handler and reveals .main-content after the SDK bootstrap
// resolves; the lead-form class is added synchronously before that, so it is not a
// readiness signal.
const ready = (element: Element) =>
  vi.waitFor(() => expect((element.querySelector('.main-content') as HTMLElement).style.display).not.toBe('none'));

describe('lead-form bundle', () => {
  it('registers under its widget name and reveals the form', async () => {
    const { win, element } = mount();
    expect(typeof win.ShazammeWidget['lead-form']).toBe('function');
    await ready(element);
    await ready(element);
  });

  it('loads the pinned 1.0.10 screening plugin with the collection template id', async () => {
    const { scripts, pluginCalls } = mount({ screeningTemplateId: 'tpl-from-picker' });
    await vi.waitFor(() => expect(scripts).toContain(PLUGIN_1_0_10));
    await vi.waitFor(() => expect(pluginCalls).toHaveLength(1));
    expect(pluginCalls[0].tid).toBe('tpl-from-picker');
    expect(pluginCalls[0].config.screeningTemplateId).toBe('tpl-from-picker');
  });

  it('lets the manual template id override the picker, trimmed', async () => {
    const { pluginCalls } = mount({ screeningTemplateId: 'tpl-from-picker', screeningTemplateIdManual: '  tpl-manual  ' });
    await vi.waitFor(() => expect(pluginCalls).toHaveLength(1));
    expect(pluginCalls[0].tid).toBe('tpl-manual');
  });

  it('does not load the plugin when no template is configured', async () => {
    const { scripts, element } = mount();
    await ready(element);
    await flush();
    expect(scripts).toHaveLength(0);
  });

  it('posts Submit Lead with the visible fields, the template and the screening answers', async () => {
    const { fill, submit, submits, pluginCalls } = mount({ screeningTemplateId: 'tpl' });
    await vi.waitFor(() => expect(pluginCalls).toHaveLength(1));
    fill('firstName', 'Pierre'); fill('lastName', 'Lintzer'); fill('email', 'pierre@chandlermacleod.com');
    submit();
    await vi.waitFor(() => expect(submits).toHaveLength(1));
    const d = submits[0];
    expect(d.action).toBe('Submit Lead');
    expect(d.dudaSiteID).toBe('s1');
    expect(d.lead.firstName).toBe('Pierre');
    expect(d.lead.lastName).toBe('Lintzer');
    expect(d.lead.email).toBe('pierre@chandlermacleod.com');
    expect(d.lead.screeningTemplateID).toBe('tpl');
    expect(d.lead['--ignored']).toBeUndefined();
    expect(d.screeningAnswers.values[0].answerText).toBe('https://clientsite.com/employers');
  });

  it('carries the UTM referral set from the page URL', async () => {
    const win = window as unknown as Win;
    win.history.replaceState({}, '', '/employers?utm_source=linkedin&utm_medium=social&utm_campaign=cm&utm_term=t&utm_content=c');
    try {
      const { fill, submit, submits, element } = mount();
      await ready(element);
      fill('firstName', 'A'); fill('lastName', 'B'); fill('email', 'a@b.com');
      submit();
      await vi.waitFor(() => expect(submits).toHaveLength(1));
      expect(submits[0].lead).toMatchObject({
        ReferralSource: 'linkedin', ReferralMedium: 'social', ReferralCampaign: 'cm', ReferralTerm: 't', ReferralContent: 'c',
      });
    } finally {
      win.history.replaceState({}, '', '/');
    }
  });

  it('blocks a free-email domain when blockFreeEmail is on, and does not post', async () => {
    const win = window as unknown as Win;
    const alerts: string[] = [];
    win.alert = (m: string) => { alerts.push(String(m)); };
    const { fill, submit, submits, element } = mount({ blockFreeEmail: true, blockFreeEmailMessage: 'Work email please' });
    await ready(element);
    fill('firstName', 'A'); fill('lastName', 'B'); fill('email', 'someone@gmail.com');
    submit();
    await flush(); await flush();
    expect(submits).toHaveLength(0);
    expect(alerts.join('\n')).toContain('Work email please');
  });

  it('lists the missing required fields instead of posting', async () => {
    const win = window as unknown as Win;
    const alerts: string[] = [];
    win.alert = (m: string) => { alerts.push(String(m)); };
    const { fill, submit, submits, element } = mount();
    await ready(element);
    fill('firstName', 'A');
    submit();
    await flush(); await flush();
    expect(submits).toHaveLength(0);
    expect(alerts.join('\n')).toContain('Last name');
    expect(alerts.join('\n')).toContain('Email');
  });

  it('shows the button loader while submitting and restores it on a validation failure', async () => {
    const win = window as unknown as Win;
    win.alert = () => {};
    const { $, submit, element } = mount({ ApplyButtonLoadingText: 'Sending…' });
    await ready(element);
    const btn = $(element).find('[data-rel=action-apply]');
    submit();
    expect(btn.hasClass('is-loading')).toBe(true);
    expect(btn.find('> .text').text()).toBe('Sending…');
    await vi.waitFor(() => expect(btn.hasClass('is-loading')).toBe(false));
    expect(btn.find('> .text').text()).toBe('Submit');
    expect(btn.attr('disabled')).toBeUndefined();
  });

  it('logs instead of posting inside the Duda editor', async () => {
    const { fill, submit, submits, logs, element } = mount({}, { inEditor: true });
    await ready(element);
    fill('firstName', 'A'); fill('lastName', 'B'); fill('email', 'a@b.com');
    submit();
    await vi.waitFor(() => expect(logs.length).toBeGreaterThan(0));
    expect(submits).toHaveLength(0);
    expect(logs[0][0]).toBe('submit lead');
  });
});
