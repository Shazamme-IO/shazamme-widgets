// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS. Raw JS only — no <script> tags: Duda wraps this tab in
// function(element, data, api){ ... } and a literal tag kills the widget.
//
// This is the NATIVE (v2) controller — the one this widget's settings panel,
// HTML template and CSS tab were written for. The legacy port reads none of the
// v2-only config keys, so pasting that here silently deadens the panel.
// ===========================================================================
(function () {
  var NAME = "job-results-v2";
  var BUNDLE = "https://sdk.shazamme.io/js/widget/" + NAME + "/widget.min.js";
  var SDK = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";

  function load(src, onload) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = onload;
    s.onerror = function () { console.error("[" + NAME + "] failed to load " + src); };
    document.head.appendChild(s);
  }

  // Shared with every other Shazamme stub so the SDK is fetched once per page.
  // Same contract as theirs: resolves when the SDK is there, never settles on failure.
  window.__shazSDKPromise = window.__shazSDKPromise || new Promise(function (res) {
    if (window.shazamme) return res();
    load(SDK, res);
  });

  window.__shazLoading = window.__shazLoading || {};
  if (!(window.ShazammeWidget && window.ShazammeWidget[NAME]) && !window.__shazLoading[BUNDLE]) {
    window.__shazLoading[BUNDLE] = true;
    load(BUNDLE);
  }

  // The widget's CSS tab hides the shell until the controller marks it ready, so a
  // widget that never mounts renders invisibly rather than visibly broken — that is
  // what took devdemo2 down. Poll for both halves, then reveal if they never arrive.
  var started = Date.now();

  function reveal(why) {
    var shell = element.querySelector("[data-shm-main], .job-search-root") || element;

    shell.classList.add("shm-ready");
    shell.style.setProperty("visibility", "visible", "important");
    console.error("[" + NAME + "] " + why + " — revealed the unmounted shell");
  }

  (function mount() {
    var controller = window.ShazammeWidget && window.ShazammeWidget[NAME];

    if (window.shazamme && typeof controller === "function") {
      try {
        controller({ element: element, data: data, $: window.jQuery || window.$, shazamme: window.shazamme });
      } catch (e) {
        reveal("controller threw: " + e.message);
      }

      // The controller hides the shell, returns, and finishes in a floating async
      // block; a rejection in there reaches no catch of ours and would leave the
      // widget rendering invisibly. Check once, well after any normal mount.
      return setTimeout(function () {
        if (element.querySelector("[data-shm-main]:not(.shm-ready), .job-search-root:not(.shm-ready)")) {
          reveal("still hidden 30s after mount");
        }
      }, 30000);
    }

    if (Date.now() - started < 60000) return setTimeout(mount, 50);

    reveal("SDK or bundle never arrived");
  })();
})();
