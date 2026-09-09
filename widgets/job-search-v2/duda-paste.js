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
  var NAME = "job-search-v2";
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
      // Elapsed time, not tick count: a background tab clamps timers to >=1s, which
      // would stretch a 15s deadline counted in ticks to minutes.
      var started = Date.now();
      (function poll() {
        if (window.shazamme) return res();
        if (Date.now() - started > 15000) return rej(new Error("SDK did not load in 15s"));
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
  // Duda re-runs this tab on every editor settings change, and the controller has no
  // teardown: mounting again over the rendered DOM stacks a second set of listeners on
  // the same nodes, so N tweaks make one facet click render N times. Restore the
  // pristine template first, discarding the old nodes and their listeners. (SDK channel
  // subscriptions still accumulate — that needs a teardown in the controller itself.)
  if (element.__shazTemplate === undefined) {
    element.__shazTemplate = element.innerHTML;
  } else {
    element.innerHTML = element.__shazTemplate;
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
  // IIFE — a rejection in there reaches no catch of ours. Fail-safe: keep checking, and
  // reveal only once mounting has had well past the SDK deadline plus a slow feed to
  // finish, so a healthy-but-slow load is not flashed unpopulated. It re-checks rather
  // than firing once, because the controller re-hides the shell when it finally mounts.
  // Duda re-runs this tab on every settings change in the editor, so a previous
  // watchdog must be cleared or they accumulate.
  if (element.__shazRevealWatch) clearInterval(element.__shazRevealWatch);

  var watchStarted = Date.now();
  var watch = element.__shazRevealWatch = setInterval(function () {
    var elapsed = Date.now() - watchStarted;
    var shell = element.querySelector("[data-shm-main], .job-search-root") || element;
    var hidden = shell && getComputedStyle(shell).visibility === "hidden";

    if (elapsed > 120000) return clearInterval(watch);
    if (elapsed < 30000 || !hidden) return;

    // Deliberately keeps watching after a reveal: the controller re-hides the shell
    // when it finally mounts, and its floating async mount can reject after that.
    console.error("[" + NAME + "] still hidden " + Math.round(elapsed / 1000) + "s after load — revealing");
    reveal();
  }, 2000);
})();
