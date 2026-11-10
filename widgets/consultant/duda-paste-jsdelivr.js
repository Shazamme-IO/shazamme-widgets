// LAST UPDATED: 2026-11-11 09:07 AEDT (22:07 UTC) (v0.1.44)
// Change: Fluid layout (columns from width, portrait sizing, wrapper growth, slider refit) is OPT-IN (issue #56): widget setting fluidLayout, or the WOW sites 0682872f / b40871c0. Every other site gets its pre-6-Nov layout back: NGO Recruitment 4 columns, Quinn Allan 290x360 portraits. Photo-shape default from v0.1.43 kept for fluid sites.
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
  var NAME = "consultant";
  var TAG = "v0.1.44";
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
