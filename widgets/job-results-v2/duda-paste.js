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
// Starts the SDK load only if no other stub has, and waits for the SDK global
// itself rather than any shared promise. Future widget updates ship from
// git → CDN; this paste never changes.
// ===========================================================================
(function () {
  var NAME = "job-results-v2";
  var BUNDLE = "https://sdk.shazamme.io/js/widget/" + NAME + "/widget.min.js";
  var SDK = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  // Used for the bundle only: a blocked or failed bundle must reject, not hang — an
  // unsettled promise leaves the widget unmounted with nothing in the console.
  function load(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = function () { rej(new Error("failed to load " + src)); };
      document.head.appendChild(s);
    });
  }
  // Publish the shared promise so no other stub injects a second copy of the SDK — a
  // double load can leave ready() unresolved. It must settle exactly like the older
  // stubs' promise, which every legacy widget chains on: resolve once the SDK is
  // there, never settle on failure (resolving would let them call shazamme.* on a
  // global that never loaded). Our own mount waits on sdkReady() instead, so a
  // promise that never settles cannot strand this widget.
  window.__shazSDKPromise = window.__shazSDKPromise || new Promise(function (res) {
    if (window.shazamme) return res();
    var s = document.createElement("script");
    s.src = SDK;
    s.onload = res;
    document.head.appendChild(s);
  });

  // Wait on the SDK global, not on any promise: __shazSDKPromise is first-writer-wins
  // across stubs with different settle contracts (older ones never settle on error,
  // core/script-loader's loadSdk rejects), so a stub we did not write could otherwise
  // strand this widget unmounted.
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
  // Lift the widget's own anti-FOUC hide
  // (`[data-shm-main]:not(.shm-ready){visibility:hidden!important}` in the Duda CSS
  // tab). Only the controller normally does this; on any failure path nothing else
  // will, and the widget renders invisibly — the devdemo2 outage.
  function reveal() {
    try {
      var shell = element.querySelector("[data-shm-main], .job-search-root") || element;
      shell.classList.add("shm-ready");
      shell.style.setProperty("visibility", "visible", "important");
    } catch (ignored) { /* nothing more we can do */ }
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
  }).catch(function (e) {
    reveal();
    console.error("[" + NAME + "] failed to mount", e);
  });

  // The controller hides the shell, returns, and finishes mounting in a floating async
  // IIFE — a rejection in there reaches no catch of ours. Fail-safe: if the shell is
  // still hidden well after mount should have finished, lift the hide anyway. A brief
  // flash of the unpopulated shell beats a permanently blank widget.
  setTimeout(function () {
    var shell = element.querySelector("[data-shm-main], .job-search-root") || element;
    if (shell && getComputedStyle(shell).visibility === "hidden") {
      console.error("[" + NAME + "] still hidden 10s after mount — revealing");
      reveal();
    }
  }, 10000);
})();
