// HTML renderers: review cards (classic / balloon / spotlight), headers, badge.
// Class names follow Elfsight's public `es-*` hooks, so the custom CSS sites
// already wrote against those (e.g. `.es-review-background-container`) carries
// over unchanged.

import type { Business, Review } from './data';
import type { Settings } from './settings';
import {
  avatarColour, esc, formatName, GOOGLE_G, GOOGLE_WORDMARK, ratingWord,
  relativeTime, safeUrl, stars, VERIFIED, CLOSE,
} from './format';

export interface RenderCtx {
  s: Settings;
  business: Business;
  /** Expand text fully (popup) instead of clamping to reviewPreviewLinesNumber. */
  full?: boolean;
  /** Rendering inside the popup — the only place owner replies appear. */
  inPopup?: boolean;
  now?: number;
}

function linkAttrs(s: Settings): string {
  return s.openLinksInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ' rel="noopener"';
}

function maybeLink(s: Settings, url: string, inner: string, cls: string): string {
  const href = s.enableExternalLinks ? safeUrl(url) : '';
  return href ? `<a class="${cls}" href="${href}"${linkAttrs(s)}>${inner}</a>` : `<span class="${cls}">${inner}</span>`;
}

function avatar(r: Review, s: Settings, withSticker: boolean): string {
  if (!s.reviewDisplayAuthorPicture) return '';
  const name = r.authorName || 'Customer';
  const photo = safeUrl(r.authorPhoto);
  const inner = photo
    ? `<img class="es-avatar-image" src="${photo}" alt="" loading="lazy" referrerpolicy="no-referrer" width="40" height="40">`
    : `<span class="es-avatar-initial" style="background:${avatarColour(name)}">${esc(name.trim()[0]?.toUpperCase() ?? '?')}</span>`;
  const sticker = withSticker ? `<span class="es-review-source-sticker">${GOOGLE_G}</span>` : '';
  return `<span class="es-review-avatar-container">${maybeLink(s, r.authorUrl, inner, 'es-avatar-container')}${sticker}</span>`;
}

function authorName(r: Review, s: Settings): string {
  if (!s.reviewDisplayAuthorName) return '';
  const badge = s.reviewDisplayVerifiedBadge ? `<span class="es-verified-badge">${VERIFIED}</span>` : '';
  return (
    `<span class="es-review-author-name-container">` +
    `<span class="es-review-author-name">${esc(formatName(r.authorName, s.reviewAuthorNameFormat))}</span>${badge}</span>`
  );
}

function dateLine(r: Review, ctx: RenderCtx, withSource: boolean): string {
  const { s } = ctx;
  const date = s.reviewDisplayDate ? esc(relativeTime(r.publishedAt, r.relativeTime, ctx.now)) : '';
  // 'logo' puts the coloured Google wordmark after the date; 'text' the word "Google".
  const mark = s.reviewSourceStyle === 'logo' ? GOOGLE_WORDMARK : '<span class="es-review-info-source-text">Google</span>';
  const source = withSource && s.reviewDisplaySource
    ? `${date ? ' on ' : ''}${maybeLink(s, r.url, mark, 'es-review-info-source-link')}`
    : '';
  if (!date && !source) return '';
  return `<span class="es-review-info-caption"><span class="es-review-info-date">${date}</span>${source}</span>`;
}

function text(body: string, ctx: RenderCtx): string {
  const { s } = ctx;
  const clamp = !ctx.full && s.reviewTextDisplayMode === 'short';
  const style = clamp ? ` style="-webkit-line-clamp:${s.reviewPreviewLinesNumber}"` : '';
  return (
    `<div class="es-review-content-text-container">` +
    `<div class="es-text-shortener${clamp ? ' es-is-clamped' : ''}"${style}>${esc(body)}</div>` +
    (clamp ? `<button type="button" class="es-text-shortener-control" data-action="read-more" hidden>Read more</button>` : '') +
    `</div>`
  );
}

function reply(r: Review, ctx: RenderCtx): string {
  const { s, business } = ctx;
  // Elfsight shows owner replies in the popup only, never on the cards themselves.
  if (!ctx.inPopup || !s.reviewDisplayOwnerReply || !r.reply?.text) return '';
  const date = relativeTime(r.reply.publishedAt, '', ctx.now);
  return (
    `<div class="es-review-reply">` +
    `<div class="es-review-reply-head"><span class="es-review-author-name">${esc(business.name || 'Owner')}</span>` +
    `<span class="es-review-reply-label">Owner reply</span></div>` +
    (date ? `<div class="es-review-info-date">${esc(date)}</div>` : '') +
    text(r.reply.text, ctx) +
    `</div>`
  );
}

function rating(r: Review, s: Settings): string {
  return s.reviewDisplayRating ? `<div class="es-review-content-rating">${stars(r.rating)}</div>` : '';
}

/** Balloon and spotlight have no caption line, so "text" source style becomes the bottom logo. */
function bottomStyle(s: Settings): Settings['reviewSourceStyle'] {
  const inline = s.reviewSourceStyle === 'text' || s.reviewSourceStyle === 'logo';
  return s.reviewLayout !== 'classic' && inline ? 'logoBottom' : s.reviewSourceStyle;
}

function bottomSource(r: Review, s: Settings): string {
  if (!s.reviewDisplaySource) return '';
  const style = bottomStyle(s);
  if (style === 'logoBottom') {
    return `<div class="es-review-source-bottom es-source-logo">${maybeLink(s, r.url, GOOGLE_WORDMARK, 'es-review-info-source-link')}</div>`;
  }
  if (style === 'iconBottom') {
    return (
      `<div class="es-review-source-bottom es-source-posted">${GOOGLE_G}` +
      `<span class="es-source-posted-text"><span class="es-posted-on">Posted on</span>${maybeLink(s, r.url, 'Google', 'es-review-info-source')}</span></div>`
    );
  }
  return '';
}

function author(r: Review, ctx: RenderCtx, withSource: boolean): string {
  const { s } = ctx;
  return (
    `<div class="es-review-author-block-container">${avatar(r, s, s.reviewSourceStyle === 'icon')}` +
    `<div class="es-review-info-container">${authorName(r, s)}${dateLine(r, ctx, withSource)}</div></div>`
  );
}

export function reviewCard(r: Review, ctx: RenderCtx): string {
  const { s } = ctx;
  let body: string;
  if (s.reviewLayout === 'balloon') {
    body = `<div class="es-review-balloon">${rating(r, s)}${text(r.text, ctx)}${bottomSource(r, s)}</div>${author(r, ctx, false)}${reply(r, ctx)}`;
  } else if (s.reviewLayout === 'spotlight') {
    body = `${rating(r, s)}${text(r.text, ctx)}${author(r, ctx, false)}${bottomSource(r, s)}${reply(r, ctx)}`;
  } else {
    body =
      `${author(r, ctx, s.reviewSourceStyle === 'text' || s.reviewSourceStyle === 'logo')}` +
      `<div class="es-review-content-container">${rating(r, s)}${text(r.text, ctx)}${reply(r, ctx)}${bottomSource(r, s)}</div>`;
  }
  return (
    `<div class="es-review-container es-review-layout-${s.reviewLayout}" data-review-id="${esc(r.id)}">` +
    `<div class="es-review-background-container">${body}</div></div>`
  );
}

function writeButton(ctx: RenderCtx, label = 'Review us on Google'): string {
  const href = safeUrl(ctx.business.writeReviewUrl);
  if (!ctx.s.showWriteReviewButton || !href) return '';
  return (
    `<div class="es-header-write-review-button-container">` +
    `<a class="es-header-write-review-button es-button-base-container" href="${href}" target="_blank" rel="noopener noreferrer">${esc(label)}</a></div>`
  );
}

function headerRating(ctx: RenderCtx): string {
  const { s, business } = ctx;
  const parts: string[] = [];
  if (s.headerElements.includes('rating')) {
    parts.push(`<span class="es-rating-value">${business.rating.toFixed(1)}</span>`, stars(business.rating, 'es-header-rating'));
  }
  if (s.headerElements.includes('reviewsNumber')) {
    parts.push(`<span class="es-header-rating-reviews-count">(${business.reviewCount.toLocaleString('en')})</span>`);
  }
  return parts.length ? `<div class="es-header-rating-container">${parts.join('')}</div>` : '';
}

export function header(ctx: RenderCtx, force = false): string {
  const { s, business } = ctx;
  if (!s.showOverallRating && !force) return '';
  const title = s.headerElements.includes('title');
  const layout = force ? 'header1' : s.headerLayout;
  let inner: string;
  if (layout === 'header2') {
    inner =
      `<div class="es-header-info"><span class="es-header-icon">${GOOGLE_G}</span><div>` +
      (title ? `<div class="es-header-heading-text">${ratingWord(business.rating)} on Google</div>` : '') +
      `${headerRating(ctx)}</div></div>${writeButton(ctx)}`;
  } else if (layout === 'header7') {
    inner =
      `<div class="es-header-info">${title ? `<span class="es-header-heading-logo">${GOOGLE_WORDMARK}</span>` : ''}` +
      `${headerRating(ctx)}</div>${writeButton(ctx, 'Write a Review')}`;
  } else if (layout === 'header9') {
    inner =
      `<span class="es-header-icon">${GOOGLE_G}</span>` +
      (s.headerElements.includes('rating')
        ? `<div class="es-header-rating-container"><span class="es-rating-value">${business.rating.toFixed(1)}</span>${stars(business.rating, 'es-header-rating')}</div>`
        : '') +
      (s.headerElements.includes('reviewsNumber')
        ? `<div class="es-header-reviews-total">${business.reviewCount.toLocaleString('en')} reviews</div>`
        : '') +
      writeButton(ctx);
  } else {
    inner =
      `<div class="es-header-info">` +
      (title ? `<div class="es-header-heading-container"><span class="es-header-heading-logo">${GOOGLE_WORDMARK}</span><span class="es-header-heading-text">Reviews</span></div>` : '') +
      `${headerRating(ctx)}</div>${writeButton(ctx)}`;
  }
  return `<div class="es-header-container es-header-${layout}">${inner}</div>`;
}

export function widgetTitle(s: Settings): string {
  if (!s.widgetTitle || !s.widgetTitleTitle.trim()) return '';
  return (
    `<div class="es-widget-title-container"><h2 class="es-widget-title">${esc(s.widgetTitleTitle)}</h2>` +
    (s.widgetTitleCaption ? `<p class="es-widget-title-caption">${esc(s.widgetTitleCaption)}</p>` : '') +
    `</div>`
  );
}

export function badge(ctx: RenderCtx): string {
  const { s, business } = ctx;
  const floating = s.badgeDisplayMode === 'singleFloating';
  const label = s.badgeLabelType === 'custom' && s.badgeLabelCustomText
    ? `<div class="es-badge-label">${esc(s.badgeLabelCustomText)}${s.badgeDisplayVerifiedBadge ? `<span class="es-verified-badge">${VERIFIED}</span>` : ''}</div>`
    : '';
  const ratingRow = s.badgeDisplayRating
    ? `<div class="es-badge-rating"><span class="es-rating-value">${business.rating.toFixed(1)}</span>${stars(business.rating)}</div>`
    : '';
  const count = s.badgeDisplayNumberOfReviews
    ? `<div class="es-badge-count">${business.reviewCount.toLocaleString('en')} reviews</div>`
    : '';
  const close = floating && s.badgeCloseButton
    ? `<button type="button" class="es-badge-close" data-action="close-badge" aria-label="Close badge">${CLOSE}</button>`
    : '';
  const clickable = s.badgeClickAction !== 'none';
  const pos = s.badgeFloatingPosition;
  const [v, h] = (pos.position || 'bottom-left').split('-');
  const style = floating
    ? ` style="${v === 'top' ? 'top' : 'bottom'}:${Number(pos.verticalOffset) || 0}px;${h === 'right' ? 'right' : 'left'}:${Number(pos.horizontalOffset) || 0}px"`
    : '';
  return (
    `<div class="es-badge-wrapper es-badge-${floating ? 'floating' : 'inline'} es-badge-align-${esc(s.badgeInlinePosition)} es-badge-size-${esc(s.badgeSize)}"${style}>` +
    `<div class="es-badge"${clickable ? ' role="button" tabindex="0" data-action="badge-click"' : ''} aria-label="Reviews badge">` +
    `${s.badgeDisplaySourceIcon ? `<span class="es-badge-icon">${GOOGLE_G}</span>` : ''}${label}${ratingRow}${count}</div>${close}</div>`
  );
}

/** schema.org LocalBusiness + AggregateRating + the displayed reviews, as JSON-LD. */
export function schemaJsonLd(business: Business, reviews: Review[]): string {
  if (!business.reviewCount || !business.rating) return '';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name || undefined,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: business.rating, reviewCount: business.reviewCount, bestRating: 5, worstRating: 1 },
    review: reviews.slice(0, 20).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.authorName || 'Customer' },
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      reviewBody: r.text || undefined,
      datePublished: r.publishedAt ? new Date(r.publishedAt * 1000).toISOString().slice(0, 10) : undefined,
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}
