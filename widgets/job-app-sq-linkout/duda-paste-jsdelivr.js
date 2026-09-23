// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only — do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// Same loader as duda-paste.js, but served from GIT via jsDelivr instead of
// CloudFront: this widget's bundle is not on sdk.shazamme.io, because deploying
// there needs the sdk-deployer AWS profile. jsDelivr serves the repo's own dist/
// at a pinned tag, so "in git" IS the delivery — no infra, no re-paste per site.
//
// The tag is immutable: shipping a change = build, commit, tag, bump the TAG
// string here. Switch to duda-paste.js if/when the bundle lands on CloudFront.
// ===========================================================================
(function () {
  var NAME = "job-app-sq-linkout";
  var TAG = "v0.1.22";
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
