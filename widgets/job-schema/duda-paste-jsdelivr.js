// LAST UPDATED: 2026-11-09 22:30 AEDT (11:30 UTC) (v0.1.42)
// Change: JS moved out of Duda into the shazamme-widgets bundle. The JobPosting is now built from the widget's raw values, so a description with line breaks can no longer leave invalid JSON-LD.
// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only — do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// Job Schema, served from GIT via jsDelivr at a pinned tag — no CloudFront deploy
// needed. The HTML tab keeps a plain JobPosting block for anything that reads the
// page without running scripts; this bundle replaces it with the corrected one.
//
// The widget needs no Shazamme SDK (.no-sdk), so this stub does not load or
// wait for it: an SDK outage cannot leave the page without its schema.
//
// The tag is immutable: shipping a change = build, commit, tag, bump TAG here.
// ===========================================================================
(function () {
  var NAME = "job-schema";
  var TAG = "v0.1.42";
  var BUNDLE = "https://cdn.jsdelivr.net/gh/Shazamme-IO/shazamme-widgets@" + TAG + "/dist/" + NAME + "/0.1.0/widget.min.js";
  function bundle() { return new Promise(function (res, rej) {
    if (window.ShazammeWidget && window.ShazammeWidget[NAME]) return res();
    var s = document.createElement("script"); s.src = BUNDLE; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  }); }
  bundle().then(function () {
    var run = window.ShazammeWidget && window.ShazammeWidget[NAME];
    if (!run) throw new Error("bundle loaded but did not register " + NAME);
    run({ element: element, data: data, $: window.jQuery || window.$, shazamme: undefined });
  }).catch(function (e) {
    // The page keeps the HTML tab's block. Say so: a schema that quietly stays wrong is found weeks later in Search Console.
    console.warn("[job-schema] JSON-LD not rebuilt, bundle " + BUNDLE, e);
  });
})();
