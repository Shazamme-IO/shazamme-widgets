// Job Board markup as strings. Every value from the feed or a setting goes through esc().

import { esc } from '../../core/site-jobs';
import { pageList, type Card, type Facet, type State } from './board';
import { fill, SORTS, type Settings } from './settings';

const ARROW = '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12L12 4M6 4h6v6"></path></svg>';
const SEARCH = '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="8.5" cy="8.5" r="6"></circle><path d="M13 13l5 5"></path></svg>';
const CLOSE = '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 3l12 12M15 3L3 15"></path></svg>';
const FILTER = '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4h12M4.5 8h7M7 12h2"></path></svg>';

export function shellHtml(id: string, s: Settings, state: State): string {
  const search = s.showSearch
    ? `<form class="shm-jb-search" role="search" aria-label="${esc(s.searchButtonLabel)}"${s.searchOverlap ? ` style="margin-top:-${s.searchOverlap}px"` : ''}>` +
      (s.searchPrompt ? `<p class="shm-jb-prompt">${esc(s.searchPrompt)}</p>` : '') +
      '<div class="shm-jb-fields">' +
      `<input class="shm-jb-input" type="search" name="keyword" autocomplete="off" placeholder="${esc(s.keywordPlaceholder)}" aria-label="${esc(s.keywordPlaceholder)}" value="${esc(state.keyword)}">` +
      (s.showLocationSearch
        ? `<input class="shm-jb-input" type="search" name="location" autocomplete="off" placeholder="${esc(s.locationPlaceholder)}" aria-label="${esc(s.locationPlaceholder)}" value="${esc(state.location)}">`
        : '') +
      `<button class="shm-jb-search-btn" type="submit" aria-label="${esc(s.searchButtonLabel)}">${SEARCH}</button>` +
      '</div></form>'
    : '';
  const side = s.showFilters
    ? `<button type="button" class="shm-jb-btn shm-jb-btn-primary shm-jb-open" aria-expanded="false" aria-controls="${id}-side">${FILTER}<span class="shm-jb-open-text">${esc(s.filtersButtonText)}</span><span class="shm-jb-open-count"></span></button>` +
      `<div class="shm-jb-backdrop" hidden></div>` +
      `<aside class="shm-jb-side" id="${id}-side" aria-labelledby="${id}-side-title">` +
      `<div class="shm-jb-side-head"><h2 class="shm-jb-side-title" id="${id}-side-title">${esc(s.filtersTitle)}</h2>` +
      `<button type="button" class="shm-jb-close" aria-label="${esc(s.closeText)}">${CLOSE}</button></div>` +
      '<div class="shm-jb-facets"></div>' +
      '<div class="shm-jb-side-foot">' +
      `<button type="button" class="shm-jb-btn shm-jb-btn-secondary shm-jb-clear">${esc(s.clearText)}</button>` +
      '<button type="button" class="shm-jb-btn shm-jb-btn-primary shm-jb-apply"></button>' +
      '</div></aside>'
    : '';
  const sort = s.showSort
    ? `<label class="shm-jb-sort"><span class="shm-jb-sort-label">${esc(s.sortLabel)}</span><select class="shm-jb-sort-select" name="sort">` +
      SORTS.map((k) => `<option value="${k}"${k === state.sort ? ' selected' : ''}>${esc(s.sortNames[k])}</option>`).join('') +
      '</select></label>'
    : '';
  return (
    search +
    `<div class="shm-jb-layout${s.showFilters ? '' : ' is-wide'}">` +
    side +
    '<div class="shm-jb-results">' +
    `<div class="shm-jb-head"><p class="shm-jb-count" role="status" aria-live="polite"></p>${sort}</div>` +
    '<div class="shm-jb-note" hidden></div>' +
    '<ul class="shm-jb-grid" role="list" aria-busy="true"></ul>' +
    '<div class="shm-jb-empty" hidden></div>' +
    `<nav class="shm-jb-pager" aria-label="${esc(s.pagerLabel)}" hidden></nav>` +
    '</div></div>'
  );
}

export interface FacetView {
  open: Set<string>;
  expanded: Set<string>;
}

export function facetsHtml(id: string, facets: readonly Facet[], s: Settings, view: FacetView): string {
  return facets
    .map((f) => {
      const isOpen = view.open.has(f.id);
      const isExpanded = view.expanded.has(f.id);
      const listId = `${id}-g-${f.id}`;
      const shown = isExpanded ? f.options : f.options.filter((o, i) => i < s.optionsShown || o.checked);
      const more = f.options.length > s.optionsShown
        ? `<button type="button" class="shm-jb-btn shm-jb-btn-secondary shm-jb-more" data-group="${f.id}" aria-expanded="${isExpanded}">${esc(isExpanded ? s.showLessText : s.showMoreText)}</button>`
        : '';
      const options = shown
        .map((o) => {
          const disabled = o.count === 0 && !o.checked;
          return (
            `<li class="shm-jb-option${disabled ? ' is-empty' : ''}"><label class="shm-jb-option-label">` +
            `<input class="shm-jb-check" type="checkbox" data-group="${f.id}" value="${esc(o.value)}"${o.checked ? ' checked' : ''}${disabled ? ' disabled' : ''}>` +
            `<span class="shm-jb-option-name">${esc(o.value)}</span>` +
            `<span class="shm-jb-option-count" aria-label="${esc(countText(o.count, s))}">${o.count}</span></label></li>`
          );
        })
        .join('');
      return (
        `<div class="shm-jb-group${isOpen ? ' is-open' : ''}" data-group="${f.id}">` +
        `<h3 class="shm-jb-group-head"><button type="button" class="shm-jb-toggle" aria-expanded="${isOpen}" aria-controls="${listId}">` +
        `<span class="shm-jb-group-title">${esc(f.label)}</span><span class="shm-jb-sign" aria-hidden="true"></span></button></h3>` +
        `<div class="shm-jb-group-body" id="${listId}"${isOpen ? '' : ' hidden'}>` +
        `<ul class="shm-jb-options" role="list" aria-label="${esc(f.label)}">${options}</ul>${more}</div></div>`
      );
    })
    .join('');
}

export function cardHtml(c: Card, s: Settings): string {
  const tag = s.headingTag;
  const meta = [
    c.pay && `<span class="shm-jb-card-pay">${esc(c.pay)}</span>`,
    c.where && `<span class="shm-jb-card-where">${esc(c.where)}</span>`,
    c.workType && `<span class="shm-jb-card-type">${esc(c.workType)}</span>`,
    c.workModel && `<span class="shm-jb-card-model">${esc(c.workModel)}</span>`,
  ].filter(Boolean).join('');
  return (
    `<li class="shm-jb-item"><a class="shm-jb-card" href="${esc(c.href)}">` +
    (c.label ? `<span class="shm-jb-card-label">${esc(c.label)}</span>` : '') +
    `<${tag} class="shm-jb-card-title">${esc(c.title)}</${tag}>` +
    (meta ? `<span class="shm-jb-card-meta">${meta}</span>` : '') +
    `<span class="shm-jb-card-arrow" aria-hidden="true">${ARROW}</span>` +
    '</a></li>'
  );
}

export function pagerHtml(current: number, total: number, shown: number, all: number, s: Settings): string {
  if (s.paging === 'loadmore') {
    return shown < all ? `<button type="button" class="shm-jb-btn shm-jb-btn-primary shm-jb-loadmore">${esc(s.loadMoreText)}</button>` : '';
  }
  if (total <= 1) return '';
  const nums = pageList(current, total)
    .map((n) =>
      n === '…'
        ? '<span class="shm-jb-gap" aria-hidden="true">…</span>'
        : `<button type="button" class="shm-jb-page${n === current ? ' is-current' : ''}" data-page="${n}"${n === current ? ' aria-current="page"' : ''}>${n}</button>`,
    )
    .join('');
  return (
    `<button type="button" class="shm-jb-btn shm-jb-btn-secondary shm-jb-prev" data-page="${current - 1}"${current <= 1 ? ' disabled' : ''}>${esc(s.prevText)}</button>` +
    `<span class="shm-jb-pages">${nums}</span>` +
    `<button type="button" class="shm-jb-btn shm-jb-btn-secondary shm-jb-next" data-page="${current + 1}"${current >= total ? ' disabled' : ''}>${esc(s.nextText)}</button>`
  );
}

export function emptyHtml(s: Settings, hasJobs: boolean, hasFilters: boolean): string {
  if (!hasJobs) return `<p class="shm-jb-empty-title">${esc(s.noJobsText)}</p>`;
  return (
    `<p class="shm-jb-empty-title">${esc(s.emptyTitle)}</p><p class="shm-jb-empty-text">${esc(s.emptyText)}</p>` +
    (hasFilters ? `<button type="button" class="shm-jb-btn shm-jb-btn-secondary shm-jb-clear">${esc(s.clearText)}</button>` : '')
  );
}

export const countText = (n: number, s: Settings): string => fill(n === 1 ? s.countOne : s.countMany, n);
