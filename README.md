# shazamme-widgets

Permanent home for Shazamme's Duda widgets. One shared `core/`, many widgets,
each built to a self-contained bundle and served version-pinned from CloudFront
(`sdk.shazamme.io`). Duda keeps only the widget's **HTML template + CSS + a
one-line loader** — all JS lives here.

Generalizes the `shazamme-widget-test` proof-of-concept from one widget to many.

## Why

The legacy `duda-widget` repo is ~55 monolithic files, each re-declaring its own
fetch/cache/pub-sub layer (`job-results.js` alone is 112KB). That duplication is
why widgets are slow to write and slow to load. Here, that layer is written once
in `core/` and every widget imports it.

## Layout

```
core/         shared layer — fetch/cache/pubsub, config, dom, hierarchy, maps
widgets/      one folder per widget: index + template.hbs + styles.css + settings.json
build/        esbuild: each widget -> dist/<name>/<ver>/widget[.min].js
scripts/      validate.mjs (syntax + URL gate), deploy.mjs (S3 + CloudFront)
loaders/      the paste-into-Duda loader snippet per widget
_reference/   the 3 production widgets, verbatim — reverse-engineering source + rollback
```

## Delivery & versioning

CloudFront path: `sdk.shazamme.io/js/widget/<name>/<version>/widget.min.js`.
A new version is a new S3 path — live instantly, zero risk to existing versions
(same immutable model as the screening plugin). The Duda loader pins one version
string; roll-forward/back = change that string.

## Status

Bootstrapping. First step: reverse-engineer the 3 widgets in `_reference/`,
extract `core/`, and rebuild ONE clean widget end-to-end.
