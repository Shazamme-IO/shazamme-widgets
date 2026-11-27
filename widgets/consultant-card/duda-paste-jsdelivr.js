// LAST UPDATED: 2026-11-27 18:00 AEDT (v0.1.67, PENDING TAG)
// Change: photos as an option (initials stay the default), per-item contact and social toggles with icon and text, location, sector, description, profile button, slider and filter bar; review fixes (local-only profile links, filter count announced, slider keys and autoplay end, debounced search).
// PENDING TAG v0.1.67: the tag does not exist yet. Rick tags the merge commit of this PR v0.1.67
// (latest existing tag v0.1.65; v0.1.66 is reserved for the Job Board widget). Do not paste this
// stub until https://cdn.jsdelivr.net/gh/Shazamme-IO/shazamme-widgets@v0.1.67/dist/consultant-card/0.1.0/widget.min.js returns 200.
// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab.
//
// Raw JS only. Do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// Consultant Card, served from GIT via jsDelivr at a pinned tag. The HTML,
// CSS, Desktop CSS and Mobile CSS tabs keep their pieces: the Design Editor
// writes to those selectors.
//
// The tag is immutable: shipping a change = build, commit, tag, bump TAG here.
// ===========================================================================
(function () {
  var NAME = "consultant-card";
  var TAG = "v0.1.67";
  var BUNDLE = "https://cdn.jsdelivr.net/gh/Shazamme-IO/shazamme-widgets@" + TAG + "/dist/" + NAME + "/0.1.0/widget.min.js";
  var SDK = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  window.__shazSDKPromise = window.__shazSDKPromise || new Promise(function (res, rej) {
    if (window.shazamme) return res();
    var s = document.createElement("script"); s.src = SDK; s.onload = res;
    s.onerror = function () { window.__shazSDKPromise = null; rej(new Error("Could not load " + SDK)); };
    document.head.appendChild(s);
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
