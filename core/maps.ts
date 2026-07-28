// MapLibre GL adapter — fully non-Google, LAZY-loaded (kills slow pattern #5:
// no map JS in the bootstrap gate; MapLibre is fetched from a CDN only when a
// map/proximity is actually engaged). MapLibre is NOT an npm dependency — it is
// typed here with a minimal local interface and loaded at runtime.
//
// CRITICAL coordinate-order note: MapLibre (like GeoJSON) uses [lng, lat] —
// the OPPOSITE of Google's lat,lng AND of our GeoPoint {lat, lon}. The flip is
// centralized in `toLngLat` and unit-tested so nothing else ever gets it wrong.

import type { GeoPoint } from './types';

// --- Minimal MapLibre GL type surface (only what widgets need) ---

export interface MapLibreMarker {
  setLngLat(lngLat: [number, number]): MapLibreMarker;
  setPopup?(popup: MapLibrePopup): MapLibreMarker;
  addTo(map: MapLibreMap): MapLibreMarker;
  remove(): void;
}

export interface MapLibrePopup {
  setHTML(html: string): MapLibrePopup;
}

export interface MapLibreBounds {
  extend(coord: [number, number]): MapLibreBounds;
}

export interface MapLibreMap {
  on(event: string, cb: (...args: unknown[]) => void): void;
  fitBounds(bounds: MapLibreBounds, options?: Record<string, unknown>): void;
  remove(): void;
}

export interface MapLibreMapOptions {
  container: HTMLElement | string;
  style: string | object;
  center: [number, number];
  zoom: number;
}

export interface MapLibreGlobal {
  Map: new (options: MapLibreMapOptions) => MapLibreMap;
  Marker: new (options?: Record<string, unknown>) => MapLibreMarker;
  Popup: new (options?: Record<string, unknown>) => MapLibrePopup;
  LngLatBounds: new () => MapLibreBounds;
}

interface MaplibreWindow {
  maplibregl?: MapLibreGlobal;
}

// --- Coordinate flip (the one place the order changes) ---

/** GeoPoint {lat, lon} -> MapLibre [lng, lat]. The single source of the flip. */
export function toLngLat(p: GeoPoint): [number, number] {
  return [p.lon, p.lat];
}

// --- Lazy CDN loader (singleton) ---

const MAPLIBRE_VERSION = '4.7.1';
const CDN_BASE = `https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist`;
export const MAPLIBRE_JS_URL = `${CDN_BASE}/maplibre-gl.js`;
export const MAPLIBRE_CSS_URL = `${CDN_BASE}/maplibre-gl.css`;

/** Free MapLibre demo tiles — no API key. Overridable via createMap options. */
export const DEFAULT_STYLE_URL = 'https://demotiles.maplibre.org/style.json';

export type ScriptLoader = (url: string) => Promise<void>;
export type CssLoader = (url: string) => void;

let loadPromise: Promise<MapLibreGlobal> | null = null;

function defaultLoadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = (): void => resolve();
    script.onerror = (): void => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(script);
  });
}

function defaultLoadCss(url: string): void {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Idempotent lazy loader. Injects the MapLibre GL JS + CSS from the CDN exactly
 * once and resolves `window.maplibregl`. Concurrent calls share one in-flight
 * promise (singleton). No-op if MapLibre is already present. Loaders are
 * injectable so this is testable with no network.
 */
export function loadMapLibre(
  loadScript: ScriptLoader = defaultLoadScript,
  loadCss: CssLoader = defaultLoadCss,
  win: MaplibreWindow = window as unknown as MaplibreWindow,
): Promise<MapLibreGlobal> {
  if (win.maplibregl) return Promise.resolve(win.maplibregl);
  if (loadPromise) return loadPromise;

  loadPromise = (async (): Promise<MapLibreGlobal> => {
    loadCss(MAPLIBRE_CSS_URL);
    await loadScript(MAPLIBRE_JS_URL);
    const gl = win.maplibregl;
    if (!gl) {
      loadPromise = null;
      throw new Error('maplibregl not present on window after load');
    }
    return gl;
  })();

  return loadPromise;
}

/** Reset the loader singleton. For test isolation only. */
export function resetMapLibreCache(): void {
  loadPromise = null;
}

// --- Adapter ---

export interface MapPoint {
  lat: number;
  lon: number;
  id: string;
  popupHtml?: string;
}

/** The slice of a MapLibre map that widgets drive. */
export interface MapAdapter {
  setMarkers(points: MapPoint[]): void;
  fitToMarkers(): void;
  on(event: string, cb: (...args: unknown[]) => void): void;
  destroy(): void;
}

export interface CreateMapOptions {
  center?: GeoPoint;
  zoom?: number;
  style?: string | object;
  /** Injected MapLibre global; defaults to the loaded `window.maplibregl`. */
  maplibre?: MapLibreGlobal;
}

const DEFAULT_ZOOM = 2;
const FIT_PADDING = 40;

/**
 * Wrap a MapLibre map in the widget-facing MapAdapter. Requires MapLibre to be
 * loaded first (call loadMapLibre), or pass it via options.maplibre for tests.
 */
export function createMap(
  container: HTMLElement,
  options: CreateMapOptions = {},
): MapAdapter {
  const gl = options.maplibre ?? (window as unknown as MaplibreWindow).maplibregl;
  if (!gl) {
    throw new Error('MapLibre not loaded — call loadMapLibre() first');
  }

  const map = new gl.Map({
    container,
    style: options.style ?? DEFAULT_STYLE_URL,
    center: options.center ? toLngLat(options.center) : [0, 0],
    zoom: options.zoom ?? DEFAULT_ZOOM,
  });

  let markers: MapLibreMarker[] = [];
  let points: MapPoint[] = [];

  const clearMarkers = (): void => {
    for (const m of markers) m.remove();
    markers = [];
  };

  return {
    setMarkers(next: MapPoint[]): void {
      clearMarkers();
      points = next.slice();
      markers = points.map((p) => {
        const marker = new gl.Marker().setLngLat(toLngLat({ lat: p.lat, lon: p.lon }));
        if (p.popupHtml && marker.setPopup) {
          marker.setPopup(new gl.Popup().setHTML(p.popupHtml));
        }
        marker.addTo(map);
        return marker;
      });
    },
    fitToMarkers(): void {
      if (points.length === 0) return;
      const bounds = new gl.LngLatBounds();
      for (const p of points) bounds.extend(toLngLat({ lat: p.lat, lon: p.lon }));
      map.fitBounds(bounds, { padding: FIT_PADDING });
    },
    on(event: string, cb: (...args: unknown[]) => void): void {
      map.on(event, cb);
    },
    destroy(): void {
      clearMarkers();
      points = [];
      map.remove();
    },
  };
}
