# Build plan — shazamme-widgets

Locked decisions (from brainstorm):
- **Delivery:** central JS on CloudFront (`sdk.shazamme.io`), version-pinned; Duda
  keeps HTML/CSS/settings + a one-line loader.
- **Shape:** keep **2 Duda widgets** (search bar + results) sharing **one core**.
- **Maps:** fully non-Google — MapLibre GL + free tiles + `geocode.maps.co`.
- **Hierarchy:** true 3-level tree jobType → profession → role.
- **Source:** TypeScript, esbuild → one minified bundle per widget, wrapped as
  `window.ShazammeWidget.<name>({element, data, $, shazamme})`.

## Architecture

```
core/            shared, DOM-light, unit-tested
  types.ts       Job, FacetNode, FacetLevel, FilterState, GeoPoint
  sdk.ts         typed wrapper over injected `shazamme` (fetch/submit/site/pub/sub/style)
  config.ts      typed data.config.* readers + defaults (one place, no magic strings)
  jobs.ts        fetch cached collection ONCE (never pass limit) → indexed model; memoized
  filters.ts     pure filter engine: keyword, facets, geo (haversine)
  hierarchy.ts   buildHierarchy / toggleFacet / pruneStale — N-level, parent-linked
  geo.ts         geocode.maps.co client + haversine distance (provider-agnostic)
  maps.ts        MapLibre GL adapter, lazy-loaded (pins, bounds, popups)
  dom.ts         render + event-delegation helpers (bind once, targeted updates)
  pubsub.ts      typed message constants shared by search <-> results
widgets/
  job-results/   index.ts + template.html + styles.css + settings.json
  job-search/    index.ts + template.html + styles.css + settings.json
build/build.mjs  esbuild bundler + window.ShazammeWidget wrapper + CSS inject
scripts/
  validate.mjs   ported syntax + URL gate
  deploy.mjs     aws s3 cp -> js/widget/<name>/<ver>/ (+ CloudFront invalidate)
loaders/         paste-into-Duda loader snippet per widget
```

## Phases

1. **Toolchain** — package.json, tsconfig, esbuild build that emits a wrapped
   bundle; port `validate.mjs`. Prove it with a hello bundle.
2. **core/ data spine** (TDD) — `types`, `config`, `sdk` wrapper, `jobs`
   (fetch-once + memoized filter/sort/paginate — kills slow patterns #1/#2/#3),
   `filters`, `hierarchy` (true 3-level), `geo`. Unit tests in node/jsdom.
3. **core/ view + maps** — `dom` helpers (delegation, targeted render), `maps`
   MapLibre adapter (lazy), `pubsub`.
4. **job-results widget** — port template + CSS from `_reference/job-results-2026`
   (hierarchy) merged with `…proximity` (map/geo), rebuilt on core. Non-Google map.
5. **job-search widget** — collapse the 2 search forks into one, non-Google
   autocomplete via `geo`, publishes to results via `pubsub`.
6. **First live test** — build + validate; serve via jsDelivr@tag (zero infra,
   like the POC); wire the loader into the **duplicated draft** Duda widgets;
   verify against talentinternational.com/search-jobs behaviour.
7. **Promote to CloudFront** — extend `sdk-deployer` IAM from `js/plugin/*` to
   `js/widget/*`; publish `js/widget/<name>/1.0.0/`; flip loader URL.

## Pre-rebuild hotfix (independent, optional)

The `limit:10000` in `job-results-2026:2406,2638` is the nesco 85s trap and can be
removed from the live 2026 widget as a one-line fix today, before the rebuild —
only if Rick wants the interim win. (Legacy edit → needs Rick's go per house rule.)

## Non-goals (YAGNI for now)

- Porting the other ~50 legacy widgets. This project proves the pattern on the
  search+results pair first.
- Server-side pagination — the cached-collection fetch is the fast path; we fix
  the per-render re-filter in JS instead. Revisit only if the SDK gains paging.
