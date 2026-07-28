# Duda loader snippets

Each widget ships as a single version-pinned bundle. Duda keeps only the
HTML/CSS/settings plus this one-line loader, which injects the CDN bundle and
then calls the registered controller with the Duda runtime globals.

## Template

Paste into the widget's JavaScript tab in Duda (replace `<name>` and `<VER>`):

```html
<script>
(function () {
  var NAME = "<name>";          // e.g. "job-results" | "job-search"
  var VER  = "<VER>";           // e.g. "0.1.0" — pin to a released tag
  var SRC  = "https://cdn.jsdelivr.net/gh/Shazamme-IO/shazamme-widgets@v" +
             VER + "/dist/" + NAME + "/" + VER + "/widget.min.js";

  function run() {
    var controller = window.ShazammeWidget && window.ShazammeWidget[NAME];
    if (typeof controller === "function") {
      controller({ element: element, data: data, $: $, shazamme: shazamme });
    }
  }

  if (window.ShazammeWidget && window.ShazammeWidget[NAME]) {
    run();
  } else {
    var s = document.createElement("script");
    s.src = SRC;
    s.onload = run;
    document.head.appendChild(s);
  }
})();
</script>
```

## How the bundle self-registers

`build/build.mjs` wraps each `widgets/<name>/index.ts` as an IIFE whose footer
sets `window.ShazammeWidget["<name>"] = <controller>`. So once the script loads,
`window.ShazammeWidget[NAME]` is the controller function the loader calls with
`{ element, data, $, shazamme }`.

## Live URLs (v0.1.0)

The repo is public and `v0.1.0` is tagged, so these resolve now:

- job-results: `https://cdn.jsdelivr.net/gh/Shazamme-IO/shazamme-widgets@v0.1.0/dist/job-results/0.1.0/widget.min.js`
- job-search: `https://cdn.jsdelivr.net/gh/Shazamme-IO/shazamme-widgets@v0.1.0/dist/job-search/0.1.0/widget.min.js`

Paste-ready loaders are in [`job-results.html`](./job-results.html) and
[`job-search.html`](./job-search.html). Phase 7 promotes the same bundle to
CloudFront under `js/widget/<name>/<VER>/` and flips `SRC` accordingly.
