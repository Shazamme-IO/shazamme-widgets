// Tag Cloud loader — CloudFront path. Live only after: node scripts/deploy.mjs tag-cloud --run
// Until then paste duda-paste-jsdelivr.js instead.
// ===========================================================================
// PASTE THIS ENTIRE FILE into the Duda widget's JavaScript tab, replacing the
// existing widget JS.
//
// Raw JS only — do NOT add <script> tags. Duda wraps this tab in
// function(element, data, api){ ... }; a literal <script> is a syntax error
// that kills the whole widget.
//
// This loads the tag-cloud bundle from the CDN. The widget needs no
// Shazamme SDK (.no-sdk), so this stub neither loads nor waits for it. Future widget updates ship from git -> CDN;
// this paste never changes. HTML + CSS remain in the Duda Content/CSS tabs.
// ===========================================================================
(function () {
  var NAME = "tag-cloud";
  var BUNDLE = "https://sdk.shazamme.io/js/widget/" + NAME + "/widget.min.js";
  function bundle() { return new Promise(function (res) {
    if (window.ShazammeWidget && window.ShazammeWidget[NAME]) return res();
    var s = document.createElement("script"); s.src = BUNDLE; s.onload = res; document.head.appendChild(s);
  }); }
  bundle().then(function () {
    window.ShazammeWidget[NAME]({ element: element, data: data, $: window.jQuery || window.$, shazamme: undefined });
  });
})();
