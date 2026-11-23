import type { Card, Settings } from './settings';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

function cardHtml(c: Card, index: number, s: Settings): string {
  const name = c.title || c.backHeading || `Card ${index + 1}`;
  const target = s.newTab && !/^(mailto|tel):/i.test(c.link) ? ' target="_blank" rel="noopener noreferrer"' : '';
  const tag = s.headingTag;

  let front = '';
  if (c.image) front += `<img class="shm-fc-img" src="${esc(c.image)}" alt="${esc(c.alt)}" loading="lazy" decoding="async">`;
  front += '<div class="shm-fc-overlay"></div>';
  if (c.title || c.frontLine) {
    front += '<div class="shm-fc-caption">';
    if (c.title) front += `<${tag} class="shm-fc-title">${esc(c.title)}</${tag}>`;
    if (c.frontLine) front += `<p class="shm-fc-line">${esc(c.frontLine)}</p>`;
    front += '</div>';
  }

  if (s.flipStyle === 'none') {
    if (c.link) front += `<a class="shm-fc-link" href="${esc(c.link)}" aria-label="${esc(name)}"${target}></a>`;
    return `<div class="shm-fc-card"><div class="shm-fc-inner"><div class="shm-fc-face shm-fc-front">${front}</div></div></div>`;
  }

  let back = '<div class="shm-fc-back-body"><div class="shm-fc-back-content">';
  if (c.backHeading) back += `<${tag} class="shm-fc-back-heading">${esc(c.backHeading)}</${tag}>`;
  if (c.backText) back += `<p class="shm-fc-back-text">${esc(c.backText)}</p>`;
  if (c.link && c.buttonText) {
    back += `<a class="shm-fc-link shm-fc-button" href="${esc(c.link)}"${target} tabindex="-1">${esc(c.buttonText)}</a>`;
  } else if (c.link) {
    back += `<a class="shm-fc-link" href="${esc(c.link)}" aria-label="${esc(name)}"${target} tabindex="-1"></a>`;
  }
  back += '</div></div>';

  return (
    `<div class="shm-fc-card" tabindex="0" role="group" aria-roledescription="flip card" aria-label="${esc(name)}">` +
    '<div class="shm-fc-inner">' +
    `<div class="shm-fc-face shm-fc-front" aria-hidden="false">${front}</div>` +
    `<div class="shm-fc-face shm-fc-back" aria-hidden="true">${back}</div>` +
    '</div></div>'
  );
}

export const cardsHtml = (s: Settings): string => s.cards.map((c, i) => cardHtml(c, i, s)).join('');
