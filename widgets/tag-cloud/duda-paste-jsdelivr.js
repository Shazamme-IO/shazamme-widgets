// LAST UPDATED: 2026-10-30 12:20 AEDT (v0.1.36)
// Change: JS moved out of Duda into the shazamme-widgets bundle; this stub replaces it.
// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only — do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// Tag Cloud, served from GIT via jsDelivr at a pinned tag — no CloudFront deploy
// needed. The HTML, CSS, Desktop CSS and Mobile CSS tabs keep their pieces: the
// CSS hides the raw text before this script runs, so it must be in the page
// first, and the Design Editor writes to those selectors.
//
// The tag is immutable: shipping a change = build, commit, tag, bump TAG here.
// ===========================================================================
(function () {
  var NAME = "tag-cloud";
  var TAG = "v0.1.36";
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
