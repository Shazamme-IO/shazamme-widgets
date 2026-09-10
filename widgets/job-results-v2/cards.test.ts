// @vitest-environment jsdom
// The card renderer has two templates and a set of label/href behaviours that were
// silently broken in production: dead javascript:void(0) links, a //job-details/…
// href a browser resolves as a host, and panel labels the renderer ignored.

import { describe, it, expect } from 'vitest';
import { renderCards } from './cards';
import { readConfig } from '../../core/config';
import type { QueryResult } from '../../core/types';

function result(): QueryResult {
  return {
    page: [
      {
        jobID: 'j1',
        jobName: 'Test Job 44',
        city: 'Perth',
        state: 'WA',
        salaryText: '+Bonus and Car',
        workType: 'Full Time',
        workModel: 'Hybrid',
        category: 'Accounting',
        changedOnUTC: '2024-02-22T00:00:00',
        jobURL: 'https://example.com/jobs/test-job-44',
      },
    ],
    total: 1,
  } as unknown as QueryResult;
}

function render(configOverrides: Record<string, unknown> = {}): HTMLElement {
  const host = document.createElement('div');
  renderCards(host, result(), readConfig({ config: configOverrides }));
  return host;
}

describe('card links', () => {
  it('never renders a dead link when the page settings are empty', () => {
    const hrefs = Array.from(render().querySelectorAll('a')).map((a) => a.getAttribute('href'));

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).not.toBe('javascript:void(0)');
      expect(href).toMatch(/^\/job-(details|application)/);
    }
  });

  it('does not build a protocol-relative href from a slash-prefixed setting', () => {
    const hrefs = Array.from(render({ detailsPage: '/job-details' }).querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );

    for (const href of hrefs) expect(href!.startsWith('//')).toBe(false);
    expect(hrefs).toContain('/job-details/test-job-44');
  });
});

describe('card labels', () => {
  it('uses the labels from the settings panel', () => {
    const host = render({ applyNowLabel: 'Apply today', readMoreLabel: 'Details', saveJobText: 'shortlist' });
    const text = host.textContent ?? '';

    expect(text).toContain('Apply today');
    expect(text).toContain('Details');
    expect(text).toContain('shortlist');
  });

  it('uses the configured empty-state message', () => {
    const host = document.createElement('div');
    renderCards(
      host,
      { page: [], total: 0 } as unknown as QueryResult,
      readConfig({ config: { noResultsText: 'Nothing open right now.' } }),
    );

    expect(host.textContent).toContain('Nothing open right now.');
  });
});

describe('config coercion the panel actually hands us', () => {
  it('falls back on Duda\'s empty-string settings rather than rendering blank buttons', () => {
    const host = render({ applyNowLabel: '', readMoreLabel: '   ', saveJobText: '' });
    const text = host.textContent ?? '';

    expect(text).toContain('Apply Now');
    expect(text).toContain('Read More');
    expect(text).toContain('save job');
  });

  it('does not double the slash when a page setting has a trailing one', () => {
    const hrefs = Array.from(render({ detailsPage: 'job-details/' }).querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );

    expect(hrefs).toContain('/job-details/test-job-44');
    for (const href of hrefs) expect(href).not.toContain('//');
  });

  it('joins the jobID with & when the application page already has a query', () => {
    const host = render({ applicationPage: '/apply?src=web' });
    const apply = Array.from(host.querySelectorAll('a')).map((a) => a.getAttribute('href'));

    expect(apply.some((h) => h!.includes('/apply?src=web&jobID='))).toBe(true);
  });
});

describe('stale state and untrusted URLs', () => {
  it('clears the empty-state message when results come back', () => {
    const host = document.createElement('div');
    const cfg = readConfig({ config: {} });

    renderCards(host, { page: [], total: 0 } as unknown as QueryResult, cfg);
    expect(host.textContent).toContain('No jobs match your search.');

    renderCards(host, result(), cfg);
    expect(host.textContent).not.toContain('No jobs match your search.');
    expect(host.querySelector('[data-rel="article-job-result"]')).not.toBeNull();
  });

  it('refuses a javascript: applicationURL from the feed', () => {
    const host = document.createElement('div');
    const hostile = {
      page: [{ ...(result().page[0] as object), applicationURL: 'javascript:alert(1)' }],
      total: 1,
    } as unknown as QueryResult;

    renderCards(host, hostile, readConfig({ config: {} }));

    for (const a of Array.from(host.querySelectorAll('a'))) {
      expect(a.getAttribute('href')).not.toMatch(/^javascript:/i);
    }
  });
});

describe('templates', () => {
  it('renders semantic markup with per-field hooks by default', () => {
    const host = render();

    expect(host.querySelector('article.sjr-card')).not.toBeNull();
    expect(host.querySelector('h3.sjr-card__title')).not.toBeNull();
    expect(host.querySelector('.sjr-meta__item[data-field="salary"]')?.textContent).toContain('+Bonus and Car');
    expect(host.querySelector('.sjr-meta__item[data-field="location"]')?.textContent).toContain('Perth, WA');
    // the pipe divider is gone — separators belong in CSS
    expect(host.textContent).not.toContain('|');
  });

  it('keeps the legacy shm* structure when a site asks for classic', () => {
    const host = render({ cardTemplate: 'classic' });

    expect(host.querySelector('.shmJobResultStd')).not.toBeNull();
    expect(host.querySelector('article.sjr-card')).toBeNull();
  });
});
