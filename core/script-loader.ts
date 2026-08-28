// Shared SDK / script loader for ported legacy widgets.
//
// Legacy Duda widgets each bootstrap the SDK with their own hard-coded URL —
// sdk.shazamme.io/js/shazamme-1.0.{1,2,3}.min.js, `-1.0.3-test`, the CloudFront
// origin d1x4k0bobyopcw.cloudfront.net/shazamme-1.0.1.min.js, and even the 404
// sdk.shazamme.io/shazamme-1.0.3.min.js (missing `/js/`). On a page with several
// ported widgets that means several SDK <script> loads of slightly different URLs,
// each re-initialising `window.shazamme`. This installer coalesces every SDK
// variant onto ONE canonical, cached load, and memoises every other script per URL
// so a shared plugin (libphonenumber, country-select, …) is fetched once.
//
// Nothing here runs on import; a ported widget bundle calls `ensureScriptLoader()`
// before executing its (patched) legacy body, whose `loadScript` calls now route
// through `window.__shazLoadScript`.

export {};

declare global {
  interface Window {
    __shazLoadScript?: (src: string) => Promise<void>;
    __shazSDKPromise?: Promise<void>;
    __shazScriptCache?: Record<string, Promise<void>>;
    shazamme?: unknown;
    jQuery?: unknown;
    $?: unknown;
  }
}

// The single SDK URL every variant collapses to. `/js/` is required — the bare
// sdk.shazamme.io/shazamme-1.0.3.min.js some legacy widgets ship is a 404.
const CANONICAL_SDK_URL = 'https://sdk.shazamme.io/js/shazamme-1.0.3.min.js';

// Matches any shazamme SDK bundle URL: shazamme.min.js, shazamme-1.0.3.min.js,
// shazamme-1.0.3-test.min.js, on any host (sdk.shazamme.io, cloudfront, …).
const SDK_URL_RE = /shazamme(-1\.0\.\d+(-test)?)?\.min\.js/;

function injectScript(src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; // plain load — NO cache-bust query, so the CDN/browser can cache.
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    (document.head || document.documentElement).appendChild(s);
  });
}

// One canonical SDK load, memoised on window so it is shared with the loader stub
// and every other ported widget on the page.
function loadSdk(): Promise<void> {
  if (window.__shazSDKPromise) return window.__shazSDKPromise;
  const p = window.shazamme ? Promise.resolve() : injectScript(CANONICAL_SDK_URL);
  window.__shazSDKPromise = p;
  return p;
}

// Per-URL memoised load for everything else. On failure the cache entry is dropped
// so a later call can retry (an SDK load is deliberately NOT retryable — one URL).
function loadOther(src: string): Promise<void> {
  const cache = (window.__shazScriptCache = window.__shazScriptCache || {});
  const existing = cache[src];
  if (existing) return existing;
  const p = injectScript(src).catch((err: unknown) => {
    delete cache[src];
    throw err;
  });
  cache[src] = p;
  return p;
}

// Install the global loader once. Idempotent: a second bundle finding it already
// present is a no-op.
export function installScriptLoader(): void {
  if (typeof window === 'undefined' || window.__shazLoadScript) return;
  window.__shazLoadScript = (src: string): Promise<void> =>
    SDK_URL_RE.test(src) ? loadSdk() : loadOther(src);
}

// Callable from a widget bundle: install the loader if it is not already present.
export function ensureScriptLoader(): void {
  installScriptLoader();
}
