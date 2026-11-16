// Flip Cards — Karen widget v1. Runs inside the generated legacyController(ctx), which binds
// element and data the way Duda's function(element, data, api) wrapper does. Needs no Shazamme SDK (.no-sdk).
var cfg = (data && data.config) || {};
if (typeof element.__shmFlipCardsCleanup === 'function') { element.__shmFlipCardsCleanup(); }

var root = element.querySelector('.shm-flip-cards');
var grid = root && root.querySelector('.shm-fc-grid');
if (!root || !grid) { return; }

var HEADING_TAGS = ['h2', 'h3', 'h4', 'h5', 'p', 'div'];
var FLIP_STYLES = ['flip', 'fade', 'none'];
var HEIGHT_MODES = ['fixed', 'min', 'aspect'];
var ASPECTS = ['1:1', '4:3', '3:2', '16:9', '5:4', '4:5', '3:4', '2:3', '9:16'];
var BREAKPOINTS = [
  { key: 'd', name: 'Desktop', cols: 3, gap: 24, mode: 'aspect', height: 380 },
  { key: 't', name: 'Tablet', cols: 2, gap: 20, mode: 'aspect', height: 340 },
  { key: 'm', name: 'Mobile', cols: 1, gap: 16, mode: 'min', height: 320 }
];
var FIELDS = ['image', 'alt', 'title', 'frontLine', 'backHeading', 'backText', 'link', 'buttonText'];
var MAX_COLUMNS = 6;
var MAX_CARDS = 60;

function toBool(v, fallback) {
  if (v === true || v === 'true') { return true; }
  if (v === false || v === 'false') { return false; }
  return fallback;
}
function toInt(v, fallback, min, max) {
  var n = parseInt(v, 10);
  if (isNaN(n)) { return fallback; }
  return Math.max(min, Math.min(max, n));
}
function choice(v, allowed, fallback) {
  var s = String(v == null ? '' : v).trim().toLowerCase();
  return allowed.indexOf(s) > -1 ? s : fallback;
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
// Duda hands an image or link setting over as a string or as an object holding one.
function text(v) {
  if (v == null) { return ''; }
  if (typeof v === 'object') { return text(v.url || v.src || v.href || v.link || ''); }
  return String(v).trim();
}
// http(s), mailto:, tel:, a relative path or a #anchor. Any other scheme, and protocol-relative (//, /\), is dropped.
function safeUrl(v) {
  var s = text(v);
  if (!s || /[\u0000-\u001f\u007f]/.test(s)) { return ''; }
  if (/^[\/\\]{2}/.test(s) || /^\\/.test(s)) { return ''; }
  if (/^[a-z][a-z0-9+.\-]*:/i.test(s)) { return /^(https?|mailto|tel):/i.test(s) ? s : ''; }
  return s;
}
function listFrom(v) {
  if (Array.isArray(v)) { return v; }
  if (typeof v === 'string' && v.trim().charAt(0) === '[') {
    try { var parsed = JSON.parse(v); return Array.isArray(parsed) ? parsed : []; } catch (e) { return []; }
  }
  return [];
}
function fromDom() {
  var out = [];
  var srcs = root.querySelectorAll('.shm-fc-src');
  for (var i = 0; i < srcs.length; i++) {
    var item = {};
    for (var f = 0; f < FIELDS.length; f++) {
      var el = srcs[i].querySelector('[data-f="' + FIELDS[f] + '"]');
      item[FIELDS[f]] = el ? el.textContent : '';
    }
    out.push(item);
  }
  return out;
}
function normalise(list) {
  var out = [];
  for (var i = 0; i < list.length && out.length < MAX_CARDS; i++) {
    var raw = list[i] || {};
    var c = {
      image: safeUrl(raw.image),
      alt: text(raw.alt),
      title: text(raw.title),
      frontLine: text(raw.frontLine),
      backHeading: text(raw.backHeading),
      backText: text(raw.backText),
      link: safeUrl(raw.link),
      buttonText: text(raw.buttonText)
    };
    if (c.image || c.title || c.frontLine || c.backHeading || c.backText) { out.push(c); }
  }
  return out;
}

var cards = normalise(listFrom(cfg.cards));
if (!cards.length) { cards = normalise(fromDom()); }

var flipStyle = choice(cfg.flipStyle, FLIP_STYLES, 'flip');
var vertical = choice(cfg.flipDirection, ['horizontal', 'vertical'], 'horizontal') === 'vertical';
var hoverFlip = toBool(cfg.flipOnHover, true);
var newTab = toBool(cfg.openInNewTab, false);
var headingTag = choice(cfg.headingTag, HEADING_TAGS, 'h3');
var noFlip = flipStyle === 'none';
var fill = toBool(cfg.fillColumn, false);

function cardHtml(c, index) {
  var name = c.title || c.backHeading || ('Card ' + (index + 1));
  var target = newTab && !/^(mailto|tel):/i.test(c.link) ? ' target="_blank" rel="noopener noreferrer"' : '';
  var front = '';
  if (c.image) {
    front += '<img class="shm-fc-img" src="' + esc(c.image) + '" alt="' + esc(c.alt) + '" loading="lazy" decoding="async">';
  }
  front += '<div class="shm-fc-overlay"></div>';
  if (c.title || c.frontLine) {
    front += '<div class="shm-fc-caption">';
    if (c.title) { front += '<' + headingTag + ' class="shm-fc-title">' + esc(c.title) + '</' + headingTag + '>'; }
    if (c.frontLine) { front += '<p class="shm-fc-line">' + esc(c.frontLine) + '</p>'; }
    front += '</div>';
  }
  if (noFlip) {
    if (c.link) { front += '<a class="shm-fc-link" href="' + esc(c.link) + '" aria-label="' + esc(name) + '"' + target + '></a>'; }
    return '<div class="shm-fc-card"><div class="shm-fc-inner"><div class="shm-fc-face shm-fc-front">' + front + '</div></div></div>';
  }
  var back = '<div class="shm-fc-back-body"><div class="shm-fc-back-content">';
  if (c.backHeading) { back += '<' + headingTag + ' class="shm-fc-back-heading">' + esc(c.backHeading) + '</' + headingTag + '>'; }
  if (c.backText) { back += '<p class="shm-fc-back-text">' + esc(c.backText) + '</p>'; }
  if (c.link && c.buttonText) {
    back += '<a class="shm-fc-link shm-fc-button" href="' + esc(c.link) + '"' + target + ' tabindex="-1">' + esc(c.buttonText) + '</a>';
  } else if (c.link) {
    back += '<a class="shm-fc-link" href="' + esc(c.link) + '" aria-label="' + esc(name) + '"' + target + ' tabindex="-1"></a>';
  }
  back += '</div></div>';
  return '<div class="shm-fc-card" tabindex="0" role="group" aria-roledescription="flip card" aria-label="' + esc(name) + '">' +
    '<div class="shm-fc-inner">' +
    '<div class="shm-fc-face shm-fc-front" aria-hidden="false">' + front + '</div>' +
    '<div class="shm-fc-face shm-fc-back" aria-hidden="true">' + back + '</div>' +
    '</div></div>';
}

function applyLayout() {
  for (var b = 0; b < BREAKPOINTS.length; b++) {
    var bp = BREAKPOINTS[b];
    var cols = toInt(cfg['columns' + bp.name], bp.cols, 1, MAX_COLUMNS);
    var gap = toInt(cfg['gap' + bp.name], bp.gap, 0, 120);
    var mode = choice(cfg['heightMode' + bp.name], HEIGHT_MODES, bp.mode);
    var height = toInt(cfg['height' + bp.name], bp.height, 80, 1600);
    var ratio = choice(cfg['aspect' + bp.name], ASPECTS, '4:5').replace(':', ' / ');
    var h = 'auto';
    var minH = '0px';
    var ar = 'auto';
    if (mode === 'fixed') {
      if (fill) { minH = height + 'px'; } else { h = height + 'px'; }
    } else if (mode === 'min') {
      minH = height + 'px';
    } else {
      ar = ratio;
    }
    root.style.setProperty('--shm-fc-cols-' + bp.key, String(cols));
    root.style.setProperty('--shm-fc-gap-' + bp.key, gap + 'px');
    root.style.setProperty('--shm-fc-h-' + bp.key, h);
    root.style.setProperty('--shm-fc-minh-' + bp.key, minH);
    root.style.setProperty('--shm-fc-ar-' + bp.key, ar);
  }
  var radius = [
    toInt(cfg.radiusTopLeft, 16, 0, 400),
    toInt(cfg.radiusTopRight, 16, 0, 400),
    toInt(cfg.radiusBottomRight, 16, 0, 400),
    toInt(cfg.radiusBottomLeft, 16, 0, 400)
  ];
  root.style.setProperty('--shm-fc-radius', radius.join('px ') + 'px');
  root.style.setProperty('--shm-fc-speed', toInt(cfg.flipSpeed, 600, 0, 3000) + 'ms');
  root.classList.toggle('is-vertical', vertical);
  root.classList.toggle('is-noflip', noFlip);
  root.classList.toggle('is-fill', fill);
  root.classList.toggle('is-stretch', toBool(cfg.stretchLastRow, false));
}

var listeners = [];
function on(target, type, fn) {
  target.addEventListener(type, fn);
  listeners.push([target, type, fn]);
}
var reduceQuery = null;
var onReduceChange = null;

function cardOf(node) {
  return node && node.closest ? node.closest('.shm-fc-card') : null;
}
function linkOf(card) {
  return card.querySelector('.shm-fc-link');
}
function setFlipped(card, flipped) {
  if (!card || card.classList.contains('is-flipped') === flipped) { return; }
  if (flipped) { closeAll(card); }
  card.classList.toggle('is-flipped', flipped);
  card.querySelector('.shm-fc-front').setAttribute('aria-hidden', flipped ? 'true' : 'false');
  card.querySelector('.shm-fc-back').setAttribute('aria-hidden', flipped ? 'false' : 'true');
}
function closeAll(except) {
  var open = grid.querySelectorAll('.shm-fc-card.is-flipped');
  for (var i = 0; i < open.length; i++) {
    if (open[i] !== except) { setFlipped(open[i], false); }
  }
}

function wireFlip() {
  var pointerType = 'mouse';
  var pointerFocus = false;
  var lastInput = 'pointer';

  on(root, 'pointerdown', function (e) {
    pointerType = e.pointerType || 'mouse';
    pointerFocus = true;
    lastInput = 'pointer';
  });
  on(root, 'keydown', function (e) {
    pointerFocus = false;
    lastInput = 'key';
    var card = cardOf(e.target);
    if (!card) { return; }
    if (e.key === 'Escape' || e.key === 'Esc') {
      setFlipped(card, false);
      if (e.target !== card) { card.focus(); }
      return;
    }
    if (e.target !== card) { return; }
    if (e.key === 'Enter') {
      var link = linkOf(card);
      if (card.classList.contains('is-flipped') && link) { link.click(); } else { setFlipped(card, true); }
      e.preventDefault();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      setFlipped(card, !card.classList.contains('is-flipped'));
      e.preventDefault();
    } else if (card.classList.contains('is-flipped')) {
      var body = card.querySelector('.shm-fc-back-body');
      var step = e.key === 'ArrowDown' ? 40 : e.key === 'ArrowUp' ? -40 : e.key === 'PageDown' ? 200 : e.key === 'PageUp' ? -200 : 0;
      if (step && body && body.scrollHeight > body.clientHeight) { body.scrollTop += step; e.preventDefault(); }
    }
  });
  on(root, 'focusin', function (e) {
    var card = cardOf(e.target);
    if (card && e.target === card && !pointerFocus) { setFlipped(card, true); }
  });
  on(root, 'focusout', function (e) {
    var card = cardOf(e.target);
    if (card && !(e.relatedTarget && card.contains(e.relatedTarget))) { setFlipped(card, false); }
  });
  on(root, 'pointerover', function (e) {
    var card = cardOf(e.target);
    if (card && hoverFlip && e.pointerType === 'mouse') { setFlipped(card, true); }
  });
  on(root, 'pointerout', function (e) {
    var card = cardOf(e.target);
    if (!card || !hoverFlip || e.pointerType !== 'mouse' || (e.relatedTarget && card.contains(e.relatedTarget))) { return; }
    // A card a keyboard user has focused stays open when a parked mouse leaves it.
    if (lastInput === 'key' && card.contains(document.activeElement)) { return; }
    setFlipped(card, false);
  });
  on(root, 'click', function (e) {
    pointerFocus = false;
    var card = cardOf(e.target);
    if (!card) { return; }
    var link = linkOf(card);
    var flipped = card.classList.contains('is-flipped');
    var onLink = !!(e.target.closest && e.target.closest('.shm-fc-link'));
    if (flipped && link) {
      if (!onLink) { link.click(); }
      return;
    }
    if (onLink) { e.preventDefault(); }
    var clickType = e.pointerType || (e.detail === 0 ? 'synthetic' : pointerType);
    if (flipped && clickType === 'mouse' && hoverFlip) { return; }
    setFlipped(card, !flipped);
  });
  on(document, 'pointerdown', function (e) {
    if (!root.contains(e.target)) { closeAll(null); }
  });
}

function watchReducedMotion() {
  if (!window.matchMedia) { return; }
  reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  onReduceChange = function () {
    root.classList.toggle('is-fade', flipStyle === 'fade' || reduceQuery.matches);
  };
  onReduceChange();
  if (reduceQuery.addEventListener) { reduceQuery.addEventListener('change', onReduceChange); }
  else if (reduceQuery.addListener) { reduceQuery.addListener(onReduceChange); }
}

function cleanup() {
  for (var i = 0; i < listeners.length; i++) {
    listeners[i][0].removeEventListener(listeners[i][1], listeners[i][2]);
  }
  listeners = [];
  if (reduceQuery && onReduceChange) {
    if (reduceQuery.removeEventListener) { reduceQuery.removeEventListener('change', onReduceChange); }
    else if (reduceQuery.removeListener) { reduceQuery.removeListener(onReduceChange); }
  }
  delete element.__shmFlipCardsCleanup;
}
element.__shmFlipCardsCleanup = cleanup;

applyLayout();
root.classList.toggle('is-fade', flipStyle === 'fade');

if (!cards.length) {
  grid.innerHTML = (data && data.inEditor)
    ? '<p class="shm-fc-empty">Flip Cards: add at least one card (photo, title and back text) in the Content editor.</p>'
    : '';
} else {
  var html = '';
  for (var n = 0; n < cards.length; n++) { html += cardHtml(cards[n], n); }
  grid.innerHTML = html;
  if (!noFlip) { wireFlip(); }
  watchReducedMotion();
}

root.classList.add('is-ready');
