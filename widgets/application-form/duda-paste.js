// LAST UPDATED: 2026-11-11 16:33 AEDT (05:33 UTC) — Job Application (application-form) moved to the external bundle.
// Resume file-type check + typed resume (Freshdesk 14215) and the apply-button loader ship from git -> CDN; this paste never changes.
// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only — do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// This loads the widget bundle from the CDN and OWNS the single SDK load, so the
// SDK is fetched at most once per page no matter how many Shazamme widgets are
// present. Future widget updates ship from git → CDN; this paste never changes.
// ===========================================================================
(function () {
  var NAME = "application-form";
  var BUNDLE = "https://sdk.shazamme.io/js/widget/" + NAME + "/widget.min.js";
  var SDK = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  window.__shazSDKPromise = window.__shazSDKPromise || new Promise(function (res) {
    if (window.shazamme) return res();
    var s = document.createElement("script"); s.src = SDK; s.onload = res; document.head.appendChild(s);
  });
  function bundle() { return new Promise(function (res, rej) {
    if (window.ShazammeWidget && window.ShazammeWidget[NAME]) return res();
    var s = document.createElement("script"); s.src = BUNDLE; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  }); }
  Promise.all([window.__shazSDKPromise, bundle()]).then(function () {
    var run = window.ShazammeWidget && window.ShazammeWidget[NAME];
    if (!run) throw new Error("bundle loaded but did not register " + NAME);
    run({ element: element, data: data, $: window.jQuery || window.$, shazamme: window.shazamme });
  }).catch(function (e) {
    // The apply form is only delivered by this stub; a silent failure looks like an empty page.
    console.warn("[" + NAME + "] widget not started, bundle " + BUNDLE, e);
  });
})();
