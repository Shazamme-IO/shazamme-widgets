// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only — do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// This is the NATIVE (v2) controller — the one the widget's settings panel,
// HTML template and CSS tab were written for. Loading the legacy port here
// instead silently drops every v2-only setting (hideLeftNav, job-type filter,
// grid layout), because the legacy bundle never reads those keys.
//
// Owns the single SDK load, so the SDK is fetched at most once per page no
// matter how many Shazamme widgets are present. Future widget updates ship
// from git → CDN; this paste never changes.
// ===========================================================================
(function () {
  var NAME = "job-search-v2";
  var BUNDLE = "https://sdk.shazamme.io/js/widget/" + NAME + "/widget.min.js";
  var SDK = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  // A blocked or failed script must reject, not hang: an unsettled promise leaves the
  // widget unmounted with nothing in the console to explain why.
  function load(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = function () { rej(new Error("failed to load " + src)); };
      document.head.appendChild(s);
    });
  }
  // The SDK promise is shared with every other Shazamme stub on the page. Ours never
  // rejects, but core/script-loader's loadSdk() assigns the same global and does, and
  // whichever runs first wins — so swallow it below and check for the SDK itself.
  window.__shazSDKPromise = window.__shazSDKPromise || new Promise(function (res) {
    if (window.shazamme) return res();
    var s = document.createElement("script");
    s.src = SDK;
    s.onload = res;
    s.onerror = res;
    document.head.appendChild(s);
  });

  // Never wait on that shared promise alone: it is first-writer-wins across three
  // stubs with three different contracts (this one resolves on error, the older ones
  // never settle on error, core/script-loader's loadSdk rejects). Poll for the SDK
  // itself instead, so a stub we did not write cannot strand this widget unmounted.
  function sdkReady() {
    return new Promise(function (res, rej) {
      var waited = 0;
      (function poll() {
        if (window.shazamme) return res();
        if ((waited += 50) > 15000) return rej(new Error("SDK did not load in 15s"));
        setTimeout(poll, 50);
      })();
    });
  }
  // Memoized per URL: two instances of the same widget on one page would otherwise
  // both inject the script before either had registered a controller.
  function bundle() {
    if (window.ShazammeWidget && window.ShazammeWidget[NAME]) return Promise.resolve();
    window.__shazScriptCache = window.__shazScriptCache || {};
    // Evict a failed load so a transient CDN error does not poison the key for every
    // other instance on the page.
    window.__shazScriptCache[BUNDLE] = window.__shazScriptCache[BUNDLE] ||
      load(BUNDLE).catch(function (e) {
        delete window.__shazScriptCache[BUNDLE];
        throw e;
      });
    return window.__shazScriptCache[BUNDLE];
  }
  Promise.all([sdkReady(), bundle()]).then(function () {
    var controller = window.ShazammeWidget && window.ShazammeWidget[NAME];
    if (typeof controller !== "function") {
      throw new Error(NAME + " bundle loaded but registered no controller");
    }
    controller({ element: element, data: data, $: window.jQuery || window.$, shazamme: window.shazamme });
  }).catch(function (e) { console.warn("[" + NAME + "] failed to mount", e); });
})();
