// Tag Cloud — Karen widget v3, moved from an inline Duda paste to a hosted bundle.
// Runs inside the generated legacyController(ctx), which binds element and data the
// way Duda's function(element, data, api) wrapper did. Needs no Shazamme SDK (.no-sdk).
var cfg = (data && data.config) || {};
var root = element.querySelector('.shm-tc');
if (!root) { return; }

var DEFAULT_PATTERN = '/job-results?search={tag}';
var HEADING_TAGS = ['h2', 'h3', 'h4', 'h5', 'p'];
var MAX_COLUMNS = 8;

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
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

var linkOn = toBool(cfg.linkEnabled, true);
var pattern = String(cfg.linkPattern || '').trim() || DEFAULT_PATTERN;
if (!/^(\/(?![\/\\])|https?:\/\/)/i.test(pattern)) { pattern = DEFAULT_PATTERN; }
var headingTag = String(cfg.headingTag || 'h3').toLowerCase();
if (HEADING_TAGS.indexOf(headingTag) === -1) { headingTag = 'h3'; }
var colsDesktop = toInt(cfg.columnsDesktop, 0, 0, MAX_COLUMNS);
var colsMobile = toInt(cfg.columnsMobile, 0, 0, MAX_COLUMNS);

function hrefFor(tag) {
  var enc = encodeURIComponent(tag);
  return pattern.indexOf('{tag}') > -1 ? pattern.split('{tag}').join(enc) : pattern + enc;
}

var total = root.querySelectorAll('.shm-tc-pill').length;
var groups = root.querySelectorAll('.shm-tc-group');
for (var g = 0; g < groups.length; g++) {
  var raw = groups[g].querySelector('.shm-tc-raw');
  var list = groups[g].querySelector('.shm-tc-list');
  if (!raw || !list) { continue; }
  var lines = raw.textContent.split(/\r?\n/);
  var out = [];
  for (var i = 0; i < lines.length; i++) {
    var tag = lines[i].trim();
    if (!tag) { continue; }
    out.push(linkOn
      ? '<a class="shm-tc-pill" href="' + esc(hrefFor(tag)) + '">' + esc(tag) + '</a>'
      : '<span class="shm-tc-pill">' + esc(tag) + '</span>');
  }
  total += out.length;
  if (out.length) {
    list.innerHTML = out.join('');
  } else {
    groups[g].parentNode.removeChild(groups[g]);
  }
}

if (headingTag !== 'h3') {
  var heads = root.querySelectorAll('.shm-tc-heading');
  for (var h = 0; h < heads.length; h++) {
    var swap = document.createElement(headingTag);
    swap.className = heads[h].className;
    swap.textContent = heads[h].textContent;
    heads[h].parentNode.replaceChild(swap, heads[h]);
  }
}

root.classList.toggle('is-cols-d', colsDesktop > 0);
root.classList.toggle('is-cols-m', colsMobile > 0);
root.style.setProperty('--shm-tc-cols-d', String(colsDesktop || 1));
root.style.setProperty('--shm-tc-cols-m', String(colsMobile || 1));

root.classList.add('is-ready');

if (!total && data && data.inEditor) {
  root.innerHTML = '<p class="shm-tc-empty">Tag Cloud: add at least one group with tags (one tag per line) in the Content editor.</p>';
}
