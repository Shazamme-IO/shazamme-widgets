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

function detailsHref(job: Job, cfg: WidgetConfig): string {
  if (!cfg.detailsPage) return 'javascript:void(0)';
  return `/${cfg.detailsPage}/${slugOf(job)}`;
}

function applyHref(job: Job, cfg: WidgetConfig): string {
  const own = str(job, 'applicationURL');
  if (own) return own;
  if (!cfg.applicationPage) return detailsHref(job, cfg);
  return `/${cfg.applicationPage}?jobID=${encodeURIComponent(str(job, 'jobID'))}`;
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

function cardHtml(job: Job, cfg: WidgetConfig): string {
  const details = detailsHref(job, cfg);
  const apply = applyHref(job, cfg);
  const name = escapeHtml(str(job, 'jobName') || str(job, 'title'));
  const posted = timeSince(job);
  return `
    <div class="shmJobItemDetails">
      ${isNew(job) ? '<span class="shmTag job-new">New</span>' : ''}
      ${posted ? `<div class="shmTimePostedText">Posted ${escapeHtml(posted)}</div>` : ''}
      <div class="shmJobItemUpper">
        <div class="shmJobtitle"><a href="${details}" class="shmJobtitle" data-rel="link-job-name">${name}</a></div>
        <div class="shmUpperRight">
          <div class="shmCTA">
            <div class="shmSaveJob" data-rel="action-save-job" data-save-id="">
              <span class="active">unsave job</span>
              <span class="inactive">save job</span>
            </div>
          </div>
        </div>
      </div>
      <div class="shmJobDetails">
        <div class="shmJobDetailsPanel shmJobDetailsLeft">${detailRows(job)}</div>
      </div>
    </div>
    <div class="shmButtonLinks">
      <a class="shmGoApply" href="${apply}"><span class="text">Apply Now</span></a>
      <a class="shmGoReadMore" href="${details}"><span class="text">Read More</span></a>
    </div>`;
}

function buildCard(job: Job, cfg: WidgetConfig): HTMLElement {
  const card = el('div', { class: 'shmJobResultStd shmJobResult' });
  card.setAttribute('data-rel', 'article-job-result');
  card.setAttribute('data-id', str(job, 'jobID'));
  setHtml(card, cardHtml(job, cfg));
  return card;
}

/** Render (keyed) the current page of job cards into the list container. */
export function renderCards(
  container: Element,
  result: QueryResult,
  cfg: WidgetConfig,
): void {
  if (result.page.length === 0) {
    setHtml(container, '<div class="shmNoResults">No jobs match your search.</div>');
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
