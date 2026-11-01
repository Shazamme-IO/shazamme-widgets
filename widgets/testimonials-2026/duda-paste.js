// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS. Use this stub only after the CloudFront deploy
// (scripts/deploy.mjs) has run; until then use duda-paste-jsdelivr.js.
//
// Raw JS only. Do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// Testimonials 2026. Loads the bundle from the CDN; the HTML, CSS, Desktop CSS
// and Mobile CSS tabs keep their pieces.
// ===========================================================================
(function () {
  var NAME = "testimonials-2026";
  var BUNDLE = "https://sdk.shazamme.io/js/widget/" + NAME + "/widget.min.js";
  var SDK = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  window.__shazSDKPromise = window.__shazSDKPromise || new Promise(function (res) {
    if (window.shazamme) return res();
    var s = document.createElement("script"); s.src = SDK; s.onload = res; document.head.appendChild(s);
  });
  function bundle() {
    window.__shazBundles = window.__shazBundles || {};
    return window.__shazBundles[NAME] = window.__shazBundles[NAME] || new Promise(function (res, rej) {
      if (window.ShazammeWidget && window.ShazammeWidget[NAME]) return res();
      var s = document.createElement("script"); s.src = BUNDLE; s.onload = res;
      s.onerror = function () { delete window.__shazBundles[NAME]; rej(new Error("Could not load " + BUNDLE)); };
      document.head.appendChild(s);
    });
  }
  Promise.all([window.__shazSDKPromise, bundle()]).then(function () {
    window.ShazammeWidget[NAME]({ element: element, data: data, $: window.jQuery || window.$, shazamme: window.shazamme });
  }).catch(function (e) { console.error("[" + NAME + "]", e); });
})();
