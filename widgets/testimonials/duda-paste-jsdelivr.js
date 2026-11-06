// LAST UPDATED: 2026-11-06 12:59 AEDT (v0.1.40)
// Change: Round 3: slides are always wrapped so both 2-up cards sit whole inside the visible list (no clipped outer edges); includes the round 2 resize fix.
// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only — do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// Served from GIT via jsDelivr at a pinned tag, so "in git" IS the delivery:
// no CloudFront deploy, no re-paste per site. The widget's HTML, CSS, Desktop
// CSS and Mobile CSS tabs and its Duda AI prompts are unchanged.
//
// The tag is immutable: shipping a change = build, commit, tag, bump TAG here.
// ===========================================================================
(function () {
  var NAME = "testimonials";
  var TAG = "v0.1.40";
  var BUNDLE = "https://cdn.jsdelivr.net/gh/Shazamme-IO/shazamme-widgets@" + TAG + "/dist/" + NAME + "/0.1.0/widget.min.js";
  var SDK = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  window.__shazSDKPromise = window.__shazSDKPromise || new Promise(function (res) {
    if (window.shazamme) return res();
    var s = document.createElement("script"); s.src = SDK; s.onload = res; document.head.appendChild(s);
  });
  function bundle() { return new Promise(function (res) {
    if (window.ShazammeWidget && window.ShazammeWidget[NAME]) return res();
    var s = document.createElement("script"); s.src = BUNDLE; s.onload = res; document.head.appendChild(s);
  }); }
  Promise.all([window.__shazSDKPromise, bundle()]).then(function () {
    window.ShazammeWidget[NAME]({ element: element, data: data, $: window.jQuery || window.$, shazamme: window.shazamme });
  });
})();
