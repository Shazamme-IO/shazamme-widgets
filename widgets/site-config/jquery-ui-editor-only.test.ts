// @vitest-environment jsdom
// site-config sits on every page of every site, and it pulled the full unminified
// jQuery UI (123 KiB, ~100 KiB unused) for every visitor just to make its editor
// toolbar draggable. Nesco's Lighthouse run flagged it. The toolbar only exists in the
// editor, so jQuery UI must only load there. These mount the built bundle and record
// every script it asks the shared loader for.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version as string;
const BUNDLE = readFileSync(join(here, '..', '..', 'dist', 'site-config', VERSION, 'widget.min.js'), 'utf8');
const JQUERY = readFileSync(createRequire(import.meta.url).resolve('jquery/dist/jquery.js'), 'utf8');
const JQUERY_UI = 'https://code.jquery.com/ui/1.13.2/jquery-ui.js';

// Trimmed from the live site-config template on nescoresource.com.
const PAGE = `
<div id="widget">
  <div style="display: none">
    <div class="site-configuration-toolbar draggable hidden">
      <div class="title-bar drag-handle">:::</div>
    </div>
  </div>
</div>`;

type Win = Record<string, any>;

function mount(inEditor: boolean, withJqueryUi = false) {
  const win = window as unknown as Win;
  win.document.body.innerHTML = PAGE;
  if (!win.jQuery) win.eval(JQUERY);
  delete win.jQuery.fn.draggable;

  const draggable = vi.fn(function (this: unknown) { return this; });
  if (withJqueryUi) win.jQuery.fn.draggable = draggable;

  const requested: string[] = [];
  win.__shazLoadScript = vi.fn((src: string) => {
    requested.push(src);
    if (src === JQUERY_UI) {
      win.jQuery.fn.draggable = draggable;
      return Promise.resolve();
    }
    // Hold the SDK load open: only the mount-time script requests are under test.
    return new Promise<void>(() => {});
  });

  delete win.ShazammeWidget;
  win.eval(BUNDLE);
  win.ShazammeWidget['site-config']({
    element: win.document.getElementById('widget')!,
    data: { config: {}, inEditor, siteId: 's1', page: 'home' },
    $: win.jQuery,
    shazamme: {},
  });

  return { requested, draggable };
}

describe('site-config jQuery UI', () => {
  beforeEach(() => {
    delete (window as unknown as Win).__shazLoadScript;
  });

  it('does not load jQuery UI on the live site', async () => {
    const { requested, draggable } = mount(false);
    await Promise.resolve();

    expect(requested).not.toContain(JQUERY_UI);
    expect(draggable).not.toHaveBeenCalled();
  });

  it('still asks for the SDK on the live site', () => {
    const { requested } = mount(false);

    expect(requested.some((s) => /shazamme-1\.0\.\d+\.min\.js$/.test(s))).toBe(true);
  });

  it('loads jQuery UI in the editor and makes the toolbar draggable', async () => {
    const { requested, draggable } = mount(true);

    await vi.waitFor(() => expect(draggable).toHaveBeenCalledWith({ handle: '.drag-handle' }));
    expect(requested.filter((s) => s === JQUERY_UI)).toHaveLength(1);
  });

  it('reuses jQuery UI in the editor when the page already has it', () => {
    const { requested, draggable } = mount(true, true);

    expect(requested).not.toContain(JQUERY_UI);
    expect(draggable).toHaveBeenCalledWith({ handle: '.drag-handle' });
  });
});
