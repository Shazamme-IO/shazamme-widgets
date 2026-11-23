// Flip Cards loader — CloudFront path. Live only after: node scripts/deploy.mjs flip-cards --run
// Until then paste duda-paste-jsdelivr.js instead.
// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only — do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// This loads the flip-cards bundle from the CDN. The widget needs no
// Shazamme SDK (.no-sdk), so this stub neither loads nor waits for it. Future widget updates ship from git -> CDN;
// this paste never changes. HTML + CSS remain in the Duda Content/CSS tabs.
// ===========================================================================
(function () {
  var NAME = "flip-cards";
  var BUNDLE = "https://sdk.shazamme.io/js/widget/" + NAME + "/widget.min.js";
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
