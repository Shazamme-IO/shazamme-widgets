// LAST UPDATED: 2026-11-27 11:45 AEDT (v0.1.63)
// Change: New widget. Jobs by Industry, a tab list of professions with live jobs beside a panel of job cards.
// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only — do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// Jobs by Industry, served from GIT via jsDelivr at a pinned tag — no CloudFront deploy
// needed. The HTML, CSS, Desktop CSS and Mobile CSS tabs keep their pieces: the
// CSS styles the widget before this script runs, and the Design Editor writes to
// those selectors.
//
// The tag is immutable: shipping a change = build, commit, tag, bump TAG here.
// ===========================================================================
(function () {
  var NAME = "jobs-by-industry";
  var TAG = "v0.1.63";
  var BUNDLE = "https://cdn.jsdelivr.net/gh/Shazamme-IO/shazamme-widgets@" + TAG + "/dist/" + NAME + "/0.1.0/widget.min.js";
  var SDK = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  // One script tag per page, however many copies of the widget share it.
  var loads = window.__shmBundleLoads = window.__shmBundleLoads || {};
  function load(src, test) {
    if (test()) return Promise.resolve();
    if (!loads[src]) loads[src] = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    return loads[src];
  }
  function fail(msg) {
    var r = element.querySelector(".shm-jbi"); if (r) r.classList.add("is-ready");
    console.error("[" + NAME + "] " + msg);
  }
  // The widget copes with a missing SDK (it shows what it can, or an editor note), so an SDK outage never blocks it.
  var sdk = load(SDK, function () { return !!window.shazamme; }).catch(function () { delete loads[SDK]; console.error("[" + NAME + "] could not load " + SDK); });
  var bundle = load(BUNDLE, function () { return !!(window.ShazammeWidget && window.ShazammeWidget[NAME]); });
  Promise.all([sdk, bundle]).then(function () {
    var run = window.ShazammeWidget && window.ShazammeWidget[NAME];
    if (typeof run !== "function") return fail("bundle loaded but did not register: " + BUNDLE);
    run({ element: element, data: data, $: window.jQuery || window.$, shazamme: window.shazamme });
  }, function () { delete loads[BUNDLE]; fail("could not load " + BUNDLE); });
})();
