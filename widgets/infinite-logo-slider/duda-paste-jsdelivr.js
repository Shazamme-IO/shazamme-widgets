// LAST UPDATED: 2026-11-06 18:30 AEDT (v0.1.41)
// Change: Logos per view follow the strip width (no six slivers on phones), edges fade instead of cutting a logo, wrapper follows content height.
// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only — do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// Infinite Logo Slider, served from GIT via jsDelivr at a pinned tag — no CloudFront
// deploy needed. The HTML, CSS, Desktop CSS and Mobile CSS tabs and the Duda AI
// prompts are unchanged.
//
// The widget needs no Shazamme SDK (.no-sdk), so this stub does not load or
// wait for it: an SDK outage cannot leave the widget unrendered.
//
// The tag is immutable: shipping a change = build, commit, tag, bump TAG here.
// ===========================================================================
(function () {
  var NAME = "infinite-logo-slider";
  var TAG = "v0.1.41";
  var BUNDLE = "https://cdn.jsdelivr.net/gh/Shazamme-IO/shazamme-widgets@" + TAG + "/dist/" + NAME + "/0.1.0/widget.min.js";
  function bundle() { return new Promise(function (res) {
    if (window.ShazammeWidget && window.ShazammeWidget[NAME]) return res();
    var s = document.createElement("script"); s.src = BUNDLE; s.onload = res; document.head.appendChild(s);
  }); }
  bundle().then(function () {
    window.ShazammeWidget[NAME]({ element: element, data: data, $: window.jQuery || window.$, shazamme: undefined });
  });
})();
