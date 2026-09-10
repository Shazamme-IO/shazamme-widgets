// Job card rendering — the STANDARD layout (the reference default), ported to
// plain DOM with faithful class names. Cards are keyed by jobID and reused
// across renders via core/dom renderList (fix #11: no full .html() rebuilds).

import type { Job, QueryResult } from '../../core/types';
import type { WidgetConfig } from '../../core/config';
import { el, renderList, setHtml } from '../../core/dom';

const MS_PER_DAY = 86_400_000;
const NEW_JOB_MAX_DAYS = 1;

function str(job: Job, key: string): string {
  const v = (job as Record<string, unknown>)[key];
  return v == null ? '' : String(v);
}

/** Prefer an explicit id, else the reference number, else a slug of the name. */
function jobKey(job: Job): string {
  return str(job, 'jobID') || str(job, 'referenceNumber') || str(job, 'jobName');
}

function slugOf(job: Job): string {
  const url = str(job, 'jobURL');
  if (url) {
    const parts = url.split('/').filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return str(job, 'referenceNumber') || str(job, 'jobID');
}

// readConfig already defaults these and guarantees exactly one leading slash, so
// there is no `javascript:void(0)` fallback any more (which is what devdemo2 was
// rendering for every title, Apply and Read More link) and no `//job-details/…`,
// which a browser resolves as a host rather than a path.
function detailsHref(job: Job, cfg: WidgetConfig): string {
  return `${cfg.detailsPage}/${slugOf(job)}`;
}

function applyHref(job: Job, cfg: WidgetConfig): string {
  const own = str(job, 'applicationURL');
  if (own) return own;
  return `${cfg.applicationPage}?jobID=${encodeURIComponent(str(job, 'jobID'))}`;
}

/** ISO date for <time datetime>, empty when the source date is unusable. */
function postedDate(job: Job): string {
  const raw = str(job, 'changedOnUTC');
  const t = Date.parse(raw);
  return Number.isNaN(t) ? '' : new Date(t).toISOString().slice(0, 10);
}

function timeSince(job: Job): string {
  const raw = str(job, 'changedOnUTC');
  const then = Date.parse(raw);
  if (Number.isNaN(then)) return '';
  const days = Math.floor((Date.now() - then) / MS_PER_DAY);
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

function isNew(job: Job): boolean {
  const then = Date.parse(str(job, 'changedOnUTC'));
  if (Number.isNaN(then)) return false;
  return Date.now() - then <= NEW_JOB_MAX_DAYS * MS_PER_DAY;
}

function locationText(job: Job): string {
  const parts = [str(job, 'city'), str(job, 'state')].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  return str(job, 'country') || str(job, 'location');
}

function detailRows(job: Job): string {
  const rows: string[] = [];
  const loc = locationText(job);
  if (loc) rows.push(`<div class="shmLocation">${escapeHtml(loc)}</div>`);
  const salary = str(job, 'salary');
  if (salary) rows.push(`<div class="shmSalary">${escapeHtml(salary)}</div>`);
  const workType = str(job, 'workType');
  if (workType) rows.push(`<div class="work-type">${escapeHtml(workType)}</div>`);
  const workModel = str(job, 'workModel');
  if (workModel) rows.push(`<div class="work-model">${escapeHtml(workModel)}</div>`);
  const category = str(job, 'category');
  if (category) rows.push(`<div class="jobCategory">${escapeHtml(category)}</div>`);
  return rows.join('<div class="shmDetailsDivider shmDividerEnabled">|</div>');
}

/** Minimal HTML escape for text interpolated into card markup. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function classicCardHtml(job: Job, cfg: WidgetConfig): string {
  const details = detailsHref(job, cfg);
  const apply = applyHref(job, cfg);
  const name = escapeHtml(str(job, 'jobName') || str(job, 'title'));
  const posted = timeSince(job);
  return `
    <div class="shmJobItemDetails">
      ${isNew(job) ? '<span class="shmTag job-new">New</span>' : ''}
      ${posted ? `<div class="shmTimePostedText">${escapeHtml(cfg.postedText)} ${escapeHtml(posted)}</div>` : ''}
      <div class="shmJobItemUpper">
        <div class="shmJobtitle"><a href="${details}" class="shmJobtitle" data-rel="link-job-name">${name}</a></div>
        <div class="shmUpperRight">
          <div class="shmCTA">
            <div class="shmSaveJob" data-rel="action-save-job" data-save-id="">
              <span class="active">${escapeHtml(cfg.unsaveJobText)}</span>
              <span class="inactive">${escapeHtml(cfg.saveJobText)}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="shmJobDetails">
        <div class="shmJobDetailsPanel shmJobDetailsLeft">${detailRows(job)}</div>
      </div>
    </div>
    <div class="shmButtonLinks">
      <a class="shmGoApply" href="${apply}"><span class="text">${escapeHtml(cfg.applyNowLabel)}</span></a>
      <a class="shmGoReadMore" href="${details}"><span class="text">${escapeHtml(cfg.readMoreLabel)}</span></a>
    </div>`;
}


/** Field icons for the modern card, keyed by the data-field they sit beside. One
 *  inline sprite per row keeps the card self-contained — no icon font, no request. */
const ICONS: Record<string, string> = {
  workType:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>',
  salary:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h16M8 15l3-4 3 3 5-7"/></svg>',
  location:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  category:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
};

/** One meta row per populated field, each tagged with the field it shows so CSS
 *  can target it by meaning (`[data-field="salary"]`) rather than by class name. */
function metaRows(job: Job): string {
  const rows: Array<[string, string]> = [];

  const workBits = [str(job, 'workType'), str(job, 'workModel')].filter(Boolean);
  if (workBits.length > 0) rows.push(['workType', workBits.join(' · ')]);

  const salary = str(job, 'salaryText') || str(job, 'salary');
  if (salary) rows.push(['salary', salary]);

  const loc = locationText(job);
  if (loc) rows.push(['location', loc]);

  const category = str(job, 'category');
  if (category) rows.push(['category', category]);

  return rows
    .map(
      ([field, value]) =>
        `<li class="sjr-meta__item" data-field="${field}">${ICONS[field] || ''}<span>${escapeHtml(value)}</span></li>`,
    )
    .join('');
}

function modernCardHtml(job: Job, cfg: WidgetConfig): string {
  const details = detailsHref(job, cfg);
  const apply = applyHref(job, cfg);
  const name = escapeHtml(str(job, 'jobName') || str(job, 'title'));
  const posted = timeSince(job);
  const iso = postedDate(job);

  return `
    <div class="sjr-card__header">
      ${isNew(job) ? `<span class="sjr-tag" data-rel="tag-new">New</span>` : ''}
      ${
        posted
          ? `<time class="sjr-card__eyebrow"${iso ? ` datetime="${iso}"` : ''}>${escapeHtml(cfg.postedText)} ${escapeHtml(posted)}</time>`
          : ''
      }
      <h3 class="sjr-card__title"><a href="${details}" data-rel="link-job-name">${name}</a></h3>
    </div>
    <div class="sjr-card__body">
      <ul class="sjr-meta">${metaRows(job)}</ul>
      <div class="sjr-card__actions">
        <button class="sjr-save" type="button" data-rel="action-save-job" data-save-id="">
          <span class="active">${escapeHtml(cfg.unsaveJobText)}</span>
          <span class="inactive">${escapeHtml(cfg.saveJobText)}</span>
        </button>
        <span class="sjr-actions-group">
          <a class="sjr-btn sjr-btn--primary" href="${apply}">${escapeHtml(cfg.applyNowLabel)}</a>
          <a class="sjr-btn" href="${details}">${escapeHtml(cfg.readMoreLabel)}</a>
        </span>
      </div>
    </div>`;
}

function buildCard(job: Job, cfg: WidgetConfig): HTMLElement {
  const modern = cfg.cardTemplate === 'modern';
  // 'classic' keeps the legacy shm* classes a site's own CSS may target.
  const card = el(modern ? 'article' : 'div', {
    class: modern ? 'sjr-card' : 'shmJobResultStd shmJobResult',
  });
  card.setAttribute('data-rel', 'article-job-result');
  card.setAttribute('data-id', str(job, 'jobID'));
  setHtml(card, modern ? modernCardHtml(job, cfg) : classicCardHtml(job, cfg));
  return card;
}

/** Render (keyed) the current page of job cards into the list container. */
export function renderCards(
  container: Element,
  result: QueryResult,
  cfg: WidgetConfig,
): void {
  if (result.page.length === 0) {
    setHtml(container, `<div class="shmNoResults sjr-empty">${escapeHtml(cfg.noResultsText)}</div>`);
    return;
  }
  renderList(
    container,
    result.page,
    (job) => jobKey(job),
    (job, existing) => (existing as HTMLElement | null) ?? buildCard(job, cfg),
  );
}

/** Update the result-count label(s). */
export function renderCount(root: Element, total: number): void {
  const nodes = root.querySelectorAll('[data-rel="label-results-count"]');
  for (const node of Array.from(nodes)) node.textContent = String(total);
}
