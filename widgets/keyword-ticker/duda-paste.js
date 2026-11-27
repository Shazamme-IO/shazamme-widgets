// LAST UPDATED: 2026-11-27 11:20 AEDT (v0.1.63)
// Change: New widget. Keyword Ticker, a full-width band of words scrolling right to left, typed in or taken from the site's professions.
// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only — do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// Keyword Ticker, served from CloudFront. Future updates ship from git -> CDN; this
// paste never changes. HTML + CSS remain in the Duda Content/CSS tabs.
//
// Typed words need no Shazamme SDK, so the stub loads the SDK only when the
// "Where the words come from" setting is "professions". An SDK outage therefore
// cannot leave a typed-words ticker unrendered.
//
// ===========================================================================
(function () {
  var NAME = "keyword-ticker";
  var BUNDLE = "https://sdk.shazamme.io/js/widget/" + NAME + "/widget.min.js";
  var SDK = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  var cfg = (data && data.config) || {};
  var needsSdk = String(cfg.source || "").toLowerCase() === "professions";
  // One script tag per page, however many tickers share it.
  var loads = window.__shmBundleLoads = window.__shmBundleLoads || {};
  function load(src, test) {
    if (test()) return Promise.resolve();
    if (!loads[src]) loads[src] = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    return loads[src];
  }
  function fail(msg) {
    var r = element.querySelector(".shm-kt"); if (r) r.classList.add("is-ready");
    console.error("[" + NAME + "] " + msg);
  }
  var sdk = needsSdk
    ? load(SDK, function () { return !!window.shazamme; }).catch(function () { delete loads[SDK]; console.error("[" + NAME + "] could not load " + SDK); })
    : Promise.resolve();
  var bundle = load(BUNDLE, function () { return !!(window.ShazammeWidget && window.ShazammeWidget[NAME]); });
  Promise.all([sdk, bundle]).then(function () {
    var run = window.ShazammeWidget && window.ShazammeWidget[NAME];
    if (typeof run !== "function") return fail("bundle loaded but did not register: " + BUNDLE);
    run({ element: element, data: data, $: window.jQuery || window.$, shazamme: window.shazamme });
  }, function () { delete loads[BUNDLE]; fail("could not load " + BUNDLE); });
})();
