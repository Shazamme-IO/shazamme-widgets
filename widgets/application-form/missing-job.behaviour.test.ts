// @vitest-environment jsdom
// Runs the real showNoJob / installNativeInputStyles bodies from legacy.js with real jQuery,
// and checks the load path makes no job lookup when no job id is known.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, it, expect, beforeEach } from 'vitest';

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

function mount(config: Record<string, unknown> = {}) {
  document.head.innerHTML = '';
  document.body.innerHTML = '<div class="shmApplicationMainContainer"></div><div class="section-no-job-message" style="display:none">gone</div>';
  // eslint-disable-next-line no-new-func
  new Function(JQUERY)();
  const $ = (window as unknown as { jQuery: unknown }).jQuery;
  // eslint-disable-next-line no-new-func
  return new Function('$', 'data', 'document', `${body('function showNoJob() {')}\n${body('function installNativeInputStyles() {')}\nreturn { showNoJob, installNativeInputStyles };`)(
    $, { config }, document,
  ) as { showNoJob: () => void; installNativeInputStyles: () => void };
}

describe('showNoJob', () => {
  it('hides the form and shows the no-job message', () => {
    const api = mount();
    api.showNoJob();
    expect((document.querySelector('.shmApplicationMainContainer') as HTMLElement).style.display).toBe('none');
    expect((document.querySelector('.section-no-job-message') as HTMLElement).style.display).not.toBe('none');
  });
});

describe('installNativeInputStyles', () => {
  beforeEach(() => { document.head.innerHTML = ''; });

  it('adds one zero-specificity stylesheet, once', () => {
    const api = mount();
    api.installNativeInputStyles();
    api.installNativeInputStyles();
    const sheets = document.querySelectorAll('#shz-apply-native-inputs');
    expect(sheets).toHaveLength(1);
    expect(sheets[0].textContent).toContain(':where(.shmApplicationMainContainer) input[type=radio]');
    expect(sheets[0].textContent).toContain('::file-selector-button');
  });

  it('adds nothing when styleNativeInputs is false', () => {
    const api = mount({ styleNativeInputs: false });
    api.installNativeInputStyles();
    expect(document.getElementById('shz-apply-native-inputs')).toBeNull();
  });
});

describe('load path without a job id', () => {
  it('only looks the job up when a job id exists', () => {
    expect(src).toMatch(/if \(!data\.inEditor && !getJobID\(\)\) \{\s*showNoJob\(\);\s*\} else if \(!data\.inEditor\) \{/);
  });

  it('never stores an undefined job id', () => {
    expect(src).toContain('getJobID() && shazamme.store("jobID", getJobID());');
  });

  it('screening questions need a job id', () => {
    expect(body('function showScreeningQuestions() {')).toMatch(/if \(!getJobID\(\)\) return;/);
  });
});
