// LAST UPDATED: 2026-11-16 17:46 AEDT (v0.1.57)
// Change: New widget. Flip Cards, a list of photo cards that flip to a back with text, a link and an optional button.
// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only — do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// Flip Cards, served from GIT via jsDelivr at a pinned tag — no CloudFront deploy
// needed. The HTML, CSS, Desktop CSS and Mobile CSS tabs keep their pieces: the
// CSS sizes the cards before this script runs, so it must be in the page first,
// and the Design Editor writes to those selectors.
//
// The widget needs no Shazamme SDK (.no-sdk), so this stub does not load or
// wait for it: an SDK outage cannot leave the widget unrendered.
//
// The tag is immutable: shipping a change = build, commit, tag, bump TAG here.
// ===========================================================================
(function () {
  var NAME = "flip-cards";
  var TAG = "v0.1.57";
  var BUNDLE = "https://cdn.jsdelivr.net/gh/Shazamme-IO/shazamme-widgets@" + TAG + "/dist/" + NAME + "/0.1.0/widget.min.js";
  // One script tag per page, however many Flip Cards widgets share it.
  var loads = window.__shmBundleLoads = window.__shmBundleLoads || {};
  function bundle() {
    if (window.ShazammeWidget && window.ShazammeWidget[NAME]) return Promise.resolve();
    if (!loads[BUNDLE]) loads[BUNDLE] = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = BUNDLE; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    return loads[BUNDLE];
  }
  function fail(msg) {
    var r = element.querySelector(".shm-flip-cards"); if (r) r.classList.add("is-ready");
    console.error("[" + NAME + "] " + msg);
  }
  bundle().then(function () {
    var run = window.ShazammeWidget && window.ShazammeWidget[NAME];
    if (typeof run !== "function") return fail("bundle loaded but did not register: " + BUNDLE);
    run({ element: element, data: data, $: window.jQuery || window.$, shazamme: undefined });
  }, function () { delete loads[BUNDLE]; fail("could not load " + BUNDLE); });
})();
