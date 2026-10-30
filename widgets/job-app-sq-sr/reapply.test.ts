// Re-applying for the same job must stay possible (#13514). The backend checksum gate that
// silently dropped repeat applications is gone; the remaining gate is this widget's popup,
// so these tests execute the real confirmReapply and pin the guard shape at each call site.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'legacy.js'), 'utf8');

function extractConfirmReapply(config: Record<string, unknown>, answer: boolean) {
  const start = src.indexOf('function confirmReapply() {');
  expect(start, 'confirmReapply not found').toBeGreaterThan(-1);

  let depth = 0;
  let end = start;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) { end = i + 1; break; }
  }

  const body = src.slice(src.indexOf('{', start), end);

  // confirmReapply closes over the module-level default message; carry it in verbatim so the
  // real copy is under test rather than a re-typed copy of it.
  const declStart = src.indexOf('const DUPLICATE_REAPPLY_MESSAGE');
  expect(declStart, 'DUPLICATE_REAPPLY_MESSAGE not found').toBeGreaterThan(-1);
  const messageDecl = src.slice(declStart, src.indexOf('\n', declStart));

  const asked: string[] = [];
  const make = new Function(
    'data',
    'confirm',
    `${messageDecl}\nreturn () => ${body};`,
  ) as (d: unknown, c: (m: string) => boolean) => () => boolean;

  return {
    asked,
    run: make({ config }, (m: string) => { asked.push(m); return answer; }),
  };
}

describe('job-app-sq-sr duplicate popup', () => {
  it('returns true when the candidate confirms, so the application proceeds', () => {
    const { run } = extractConfirmReapply({}, true);
    expect(run()).toBe(true);
  });

  it('returns false when the candidate cancels, so they are sent to the dashboard', () => {
    const { run } = extractConfirmReapply({}, false);
    expect(run()).toBe(false);
  });

  it('prompts with copy that states OK submits another application', () => {
    const { run, asked } = extractConfirmReapply({}, true);
    run();
    expect(asked).toHaveLength(1);
    expect(asked[0]).toMatch(/already applied/i);
    expect(asked[0]).toMatch(/OK to submit another application/i);
    expect(asked[0]).not.toMatch(/dashboard/i);
  });

  it('honours a site-configured message', () => {
    const { run, asked } = extractConfirmReapply({ duplicateReapplyWarning: 'Apply again?' }, true);
    run();
    expect(asked[0]).toBe('Apply again?');
  });

  it('does not reuse duplicateWarning, whose site copy describes the old blocking prompt', () => {
    expect(src).not.toContain('duplicateWarning');
  });
});

describe('job-app-sq-sr duplicate call sites', () => {
  const checks = src.match(/checkForDuplicate\(/g) ?? [];
  const guards = src.match(/exists && !confirmReapply\(\)/g) ?? [];
  const blocks = () => [...src.matchAll(/exists && !confirmReapply\(\)[\s\S]{0,300}?\n(\s*)\}/g)];

  // One definition plus the two apply paths. A third call would be the page-load prompt,
  // which fired before the candidate had entered anything and, on cancel at the second
  // prompt, discarded a filled form.
  it('only checks for a duplicate on the two paths that submit an application', () => {
    expect(checks).toHaveLength(3);
    expect(guards).toHaveLength(2);
  });

  it('does not prompt on page load', () => {
    const handleUser = src.slice(src.indexOf('let session = u?.candidate;'));
    const body = handleUser.slice(0, handleUser.indexOf('shazamme.currentUser()'));
    expect(body).not.toContain('checkForDuplicate');
  });

  // Reloads elsewhere in the widget are login/auth flows and are none of this test's business.
  it('no longer reloads the page as the response to a duplicate', () => {
    expect(blocks()).toHaveLength(2);
    for (const [block] of blocks()) {
      expect(block).not.toContain('reload()');
    }
  });

  // Navigating away on cancel was wrong in both paths: the register path had already called
  // endSession() so the dashboard would load logged out, and the page name is hardcoded so a
  // site with a different candidate area would 404. Staying put also keeps the filled form.
  it('never navigates away when the candidate cancels', () => {
    expect(src).not.toContain('registerPage');
    expect(src).not.toContain('dashboardPage');
    for (const [block] of blocks()) {
      expect(block).not.toContain('window.location');
    }
  });

  it('clears the submit spinner it would otherwise leave running', () => {
    const submitBlock = blocks().map(([b]) => b).find((b) => b.includes('buttonAction'));
    expect(submitBlock).toBeDefined();
    expect(submitBlock).toContain("removeClass('fcLoadingSeek')");
  });
});
