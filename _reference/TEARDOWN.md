# Reference teardown — job-results + job-search family

Reverse-engineered from the 5 production widgets in this folder. This is the
canonical map of what they do, what's duplicated, and what makes them slow.
Drives the shared `core/` rebuild.

## The 5 references

| variant | js lines | what's special |
|---|---|---|
| `job-results` | 2674 | baseline results, Google map |
| `job-results-2026` | 2959 | adds `jobType` facet (flat) + `shiftType`; **has the `limit:10000` perf regression** |
| `job-results-proxiomity` | 3111 | Google map **tiles still Google**; results-page geocoder swapped to `geocode.maps.co`; client-side haversine proximity |
| `jobsearch2026` | 1105 | search bar; Google Places autocomplete; Fuse.js |
| `jobsearch2026prox` | 1147 | search bar fork (97% identical); adds proximity/geo field |

All run in Duda's wrapper with globals `element`, `data` (`data.config.*`,
`data.inEditor`), `$` (jQuery), `shazamme` (the SDK client).

## Biggest surprise (good news)

**The old PHP / section.io API is already dead.** `const ActionUrl =
'https://shazamme.io/Job-Listing/src/php/actions'` is declared at line 1 of all
three results files but has **zero runtime references** — everything goes through
the `shazamme.*` SDK (`sdk.shazamme.io/js/shazamme-1.0.3.min.js`). So "remove
Justin's legacy backend" = delete a dead constant. The real cost is architecture.

## Duplication — the #1 lever

Two clone families:

- **Results family** (3 files): each opens with ~1,267 lines of identical
  boilerplate before any widget-specific logic —
  - constants (`Path`, `Collection`, `LocalStorage`, `Subscribe`, `Message`) — line 1
  - `ShApi()` data layer (fetch → filter → sort → paginate, save-job, alerts,
    `_distance` haversine) — `job-results/widget.js:54-296`; **~95% identical** across the 3
  - `UX()` render layer (cards, pagination, filter panels, Google map, `loadScript`)
    — `job-results/widget.js:298-1267`; **~87% identical** across the 3
  → **~2,500 duplicated lines** that collapse into one `core/` module.
- **Search family** (2 files): `jobsearch2026` vs `…prox` = **97% identical**
  (60 lines differ) — one file forked once. Uses its own mini-core
  (`applyFilters` + Fuse.js), separate from `ShApi`. Collapses to one
  parameterized widget.

## Slow / blocking patterns (prioritized)

| # | Pattern | Where | Fix |
|---|---|---|---|
| 1 | **Download ENTIRE collection, filter/sort/paginate in JS** | `ShApi.getJobs` `widget.js:77-217` | fetch cached collection ONCE → build indexed model once → paginate from cache |
| 2 | **`limit:10000` flips off the cache onto the live deep-offset query (nesco 85s trap)** | `job-results-2026:2406, 2638` | delete the `limit` line — **one-line, biggest single win** |
| 3 | **Full re-filter+re-sort on every render** (`showJobs` called from ~15 sites) | `widget.js:1314, 1516…2494` | memoize filtered array; paginate from cache |
| 4 | **Facet recompute = 9+ full passes + rebuild every panel each fetch** | `widget.js:1521-1557` | single-pass facet counts; render only changed panels |
| 5 | **Google Maps JS in the pre-`main` bootstrap gate even when map hidden** | `widget.js:2668` (2026 same) | lazy-load only when map/proximity engaged (prox `.catch()` is the template) |
| 6 | **Per-keystroke `PlacesService.getDetails` + append-then-`empty()` bug** | `widget.js:1868-1879` | debounce; resolve geometry on selection only |
| 7 | `window.location = hash` write per render | `widget.js:1352` | `history.replaceState` |
| 8 | Click handlers rebound without `.off()` inside `showJobs` | `widget.js:1354, 1364` | bind once via delegation |
| 9 | `setTimeout(…,300)` to wait for DOM before sub-filters | `widget.js:1561, 1571` | build synchronously after render |
| 10 | `.trigger('change')` fan-out on URL restore | `jobsearch2026:887` | set state, then one fetch |
| 11 | jQuery-everywhere, repeated `.find()` re-queries, full `.html()` rebuilds | `UX()` 298-1267 | cache node refs; targeted updates |

## External dependencies

| dep | where | render-blocking? |
|---|---|---|
| shazamme SDK `shazamme-1.0.3.min.js` | bootstrap `Promise.all` (all files) | yes — required |
| Fuse.js 6.4.0 (jsDelivr) | search widgets init gate | yes — bundle or drop |
| Google Maps JS (`shazamme.gapi().maps()`) | results bootstrap; search `.maps(['places'])` | yes in base/2026 → **replace with MapLibre** |
| Google Places autocomplete | base/2026 proximity `widget.js:1837` | runtime → **replace with geocode.maps.co** |
| geocode.maps.co `/search?q=&api_key=` | prox variant `job-results-prox:2127` | runtime — the one geocoder to keep |
| Lottie player (SDK) | results, fire-and-forget | no |
| FontAwesome CSS (SDK) | results init gate | yes — ⚠ 2026 has a `fontawesome.min.css>` typo |

## Backend / SDK calls (the real data layer)

- `shazamme.fetch(Collection.job)` → `path:/job-results/${siteID}`, `isExternal:true`,
  `useCache:true` — the **pre-built job cache (fast path)**. Never add `limit`.
- `shazamme.fetch(Collection.workModel | locationSeo)` — filter lookups (cached).
- `shazamme.submit({action:'Save Job'|'Create Job Alert'|'Delete Saved Job'|'Get Saved Jobs'})`.
- `shazamme.site()` — site config (siteID, `configuration.jobFieldMap`, paths).
- `shazamme.pub/sub/unsub/bag` — client pub/sub bus (login, save-job, filter-change).
- `shazamme.gapi(key).maps([...])` — Google loader (to be dropped).

## Hierarchy — intent vs. reality (confirmed decision)

The 2026 widget was described as "jobType above profession/role," but the code
links only **profession→role** (nested pair, pre-existing in baseline) and adds
**jobType as a flat, independent facet** (`parent = null`, `2026-js:1664`).
`state→city` is the other nested pair. Node shape (`toIndex`, `2026-js:1630`):
`{value, id: id||value, seo, parent}`; parent linkage is set on the **child**.

**Decision: build a TRUE 3-level tree** — jobType → profession/category →
role/sub-category — in `core/hierarchy` (level-agnostic, each level declares its
`parentField`). Preserve two load-bearing behaviours: `id` falls back to `value`
when the `*ID` field is empty, and the parent-auto-select / child-cascade coupling.

## Maps — intent vs. reality (confirmed decision)

Map tiles are **still Google** (`google.maps.Map`, ROADMAP, `job-results-prox:842`).
Only the results-page geocoder was swapped to `geocode.maps.co`; the search bar
still uses Google Places. Three API keys in play (`apikey`, `googleApiKey`,
`geocodeApiKey`).

**Decision: fully non-Google now.** MapLibre GL + free tiles for the map render
(watch the `[lng,lat]` order flip vs Google's `lat,lng`); `geocode.maps.co` as the
single geocoder for both search bar and results; collapse 3 keys → 1. The
client-side haversine distance filter and the `geo`/`geoRange`/`geoAddress` filter
contract are provider-agnostic and stay unchanged.
