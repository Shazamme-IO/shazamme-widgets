// LAST UPDATED: 2026-11-23 17:30 AEDT (v0.1.58)
// Change: rebuilt as TypeScript (index.ts) with accessible live results; same loader, pinned to jsDelivr v0.1.58.
// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only. Do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// AU Salary Calculator, served from GIT via jsDelivr at a pinned tag, no CloudFront deploy
// needed. The HTML, CSS, Desktop CSS and Mobile CSS tabs keep their pieces; the
// Design Editor writes to the CSS selectors.
//
// The widget needs no Shazamme SDK, so this stub does not load or wait for it:
// an SDK outage cannot leave the widget unrendered.
//
// The tag is immutable: shipping a change = build, commit, tag, bump TAG here.
// ===========================================================================
(function () {
  var NAME = "salary-calculator-au";
  var TAG = "v0.1.58";
  var BUNDLE = "https://cdn.jsdelivr.net/gh/Shazamme-IO/shazamme-widgets@" + TAG + "/dist/" + NAME + "/0.1.0/widget.min.js";
  function bundle() {
    window.__shazBundles = window.__shazBundles || {};
    return window.__shazBundles[NAME] = window.__shazBundles[NAME] || new Promise(function (res, rej) {
      if (window.ShazammeWidget && window.ShazammeWidget[NAME]) return res();
      var s = document.createElement("script"); s.src = BUNDLE; s.onload = res;
      s.onerror = function () { delete window.__shazBundles[NAME]; rej(new Error("Could not load " + BUNDLE)); };
      document.head.appendChild(s);
    });
  }
  bundle().then(function () {
    window.ShazammeWidget[NAME]({ element: element, data: data, $: window.jQuery || window.$, shazamme: undefined });
  }).catch(function (e) { console.error("[" + NAME + "]", e); });
})();
