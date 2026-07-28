// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  toLngLat,
  loadMapLibre,
  resetMapLibreCache,
  createMap,
  MAPLIBRE_JS_URL,
  MAPLIBRE_CSS_URL,
  DEFAULT_STYLE_URL,
  type MapLibreGlobal,
  type MapLibreMap,
  type MapLibreMarker,
  type MapLibreBounds,
  type MapLibrePopup,
  type MapLibreMapOptions,
} from './maps';

describe('toLngLat', () => {
  it('flips GeoPoint {lat, lon} to MapLibre [lng, lat]', () => {
    expect(toLngLat({ lat: 51.5074, lon: -0.1278 })).toEqual([-0.1278, 51.5074]);
  });
});

// --- Fakes for the adapter + loader ---

let markersCreated: FakeMarker[] = [];
let mapsCreated: FakeMap[] = [];

class FakeMarker implements MapLibreMarker {
  lngLat: [number, number] | null = null;
  popup: MapLibrePopup | null = null;
  addedTo: MapLibreMap | null = null;
  removed = false;
  constructor() {
    markersCreated.push(this);
  }
  setLngLat(c: [number, number]): MapLibreMarker {
    this.lngLat = c;
    return this;
  }
  setPopup(p: MapLibrePopup): MapLibreMarker {
    this.popup = p;
    return this;
  }
  addTo(map: MapLibreMap): MapLibreMarker {
    this.addedTo = map;
    return this;
  }
  remove(): void {
    this.removed = true;
  }
}

class FakePopup implements MapLibrePopup {
  html = '';
  setHTML(html: string): MapLibrePopup {
    this.html = html;
    return this;
  }
}

class FakeBounds implements MapLibreBounds {
  coords: Array<[number, number]> = [];
  extend(c: [number, number]): MapLibreBounds {
    this.coords.push(c);
    return this;
  }
}

class FakeMap implements MapLibreMap {
  options: MapLibreMapOptions;
  fitted: { bounds: MapLibreBounds; options?: Record<string, unknown> } | null = null;
  removed = false;
  handlers: Record<string, unknown> = {};
  constructor(options: MapLibreMapOptions) {
    this.options = options;
    mapsCreated.push(this);
  }
  on(event: string, cb: (...args: unknown[]) => void): void {
    this.handlers[event] = cb;
  }
  fitBounds(bounds: MapLibreBounds, options?: Record<string, unknown>): void {
    this.fitted = { bounds, options };
  }
  remove(): void {
    this.removed = true;
  }
}

function fakeGl(): MapLibreGlobal {
  return {
    Map: FakeMap as unknown as MapLibreGlobal['Map'],
    Marker: FakeMarker as unknown as MapLibreGlobal['Marker'],
    Popup: FakePopup as unknown as MapLibreGlobal['Popup'],
    LngLatBounds: FakeBounds as unknown as MapLibreGlobal['LngLatBounds'],
  };
}

beforeEach(() => {
  resetMapLibreCache();
  markersCreated = [];
  mapsCreated = [];
});

describe('loadMapLibre', () => {
  it('injects CSS + JS exactly once across concurrent calls', async () => {
    const gl = fakeGl();
    const win: { maplibregl?: MapLibreGlobal } = {};
    const loadScript = vi.fn().mockImplementation(async (_url: string) => {
      win.maplibregl = gl; // the CDN script sets the global
    });
    const loadCss = vi.fn();

    const [a, b, c] = await Promise.all([
      loadMapLibre(loadScript, loadCss, win),
      loadMapLibre(loadScript, loadCss, win),
      loadMapLibre(loadScript, loadCss, win),
    ]);

    expect(loadScript).toHaveBeenCalledTimes(1);
    expect(loadScript).toHaveBeenCalledWith(MAPLIBRE_JS_URL);
    expect(loadCss).toHaveBeenCalledTimes(1);
    expect(loadCss).toHaveBeenCalledWith(MAPLIBRE_CSS_URL);
    expect(a).toBe(gl);
    expect(b).toBe(gl);
    expect(c).toBe(gl);
  });

  it('resolves immediately without loading when maplibregl is already present', async () => {
    const gl = fakeGl();
    const win = { maplibregl: gl };
    const loadScript = vi.fn();
    const loadCss = vi.fn();

    const out = await loadMapLibre(loadScript, loadCss, win);

    expect(out).toBe(gl);
    expect(loadScript).not.toHaveBeenCalled();
    expect(loadCss).not.toHaveBeenCalled();
  });
});

describe('createMap adapter', () => {
  it('creates a map with the default style + flipped center', () => {
    const container = document.createElement('div');
    createMap(container, { maplibre: fakeGl(), center: { lat: 10, lon: 20 }, zoom: 5 });

    expect(mapsCreated).toHaveLength(1);
    expect(mapsCreated[0].options.style).toBe(DEFAULT_STYLE_URL);
    expect(mapsCreated[0].options.center).toEqual([20, 10]); // [lng, lat]
    expect(mapsCreated[0].options.zoom).toBe(5);
  });

  it('setMarkers adds markers with flipped coordinates and popups', () => {
    const adapter = createMap(document.createElement('div'), { maplibre: fakeGl() });
    adapter.setMarkers([
      { id: 'j1', lat: 51.5, lon: -0.12, popupHtml: '<b>Job 1</b>' },
      { id: 'j2', lat: 40.7, lon: -74 },
    ]);

    expect(markersCreated).toHaveLength(2);
    expect(markersCreated[0].lngLat).toEqual([-0.12, 51.5]); // flipped
    expect(markersCreated[1].lngLat).toEqual([-74, 40.7]);
    expect((markersCreated[0].popup as FakePopup).html).toBe('<b>Job 1</b>');
    expect(markersCreated[1].popup).toBeNull();
    expect(markersCreated[0].addedTo).toBe(mapsCreated[0]);
  });

  it('setMarkers removes the previous markers before adding new ones', () => {
    const adapter = createMap(document.createElement('div'), { maplibre: fakeGl() });
    adapter.setMarkers([{ id: 'a', lat: 1, lon: 2 }]);
    const first = markersCreated[0];
    adapter.setMarkers([{ id: 'b', lat: 3, lon: 4 }]);

    expect(first.removed).toBe(true);
    expect(markersCreated).toHaveLength(2);
  });

  it('fitToMarkers extends bounds with every flipped point and fits', () => {
    const adapter = createMap(document.createElement('div'), { maplibre: fakeGl() });
    adapter.setMarkers([
      { id: 'a', lat: 1, lon: 2 },
      { id: 'b', lat: 3, lon: 4 },
    ]);
    adapter.fitToMarkers();

    const map = mapsCreated[0];
    expect(map.fitted).not.toBeNull();
    expect((map.fitted?.bounds as FakeBounds).coords).toEqual([
      [2, 1],
      [4, 3],
    ]);
  });

  it('fitToMarkers is a no-op with no markers', () => {
    const adapter = createMap(document.createElement('div'), { maplibre: fakeGl() });
    adapter.fitToMarkers();
    expect(mapsCreated[0].fitted).toBeNull();
  });

  it('on delegates to the underlying map', () => {
    const adapter = createMap(document.createElement('div'), { maplibre: fakeGl() });
    const cb = vi.fn();
    adapter.on('click', cb);
    expect(mapsCreated[0].handlers.click).toBe(cb);
  });

  it('destroy removes markers and the map', () => {
    const adapter = createMap(document.createElement('div'), { maplibre: fakeGl() });
    adapter.setMarkers([{ id: 'a', lat: 1, lon: 2 }]);
    adapter.destroy();

    expect(markersCreated[0].removed).toBe(true);
    expect(mapsCreated[0].removed).toBe(true);
  });

  it('throws when MapLibre is not available', () => {
    expect(() => createMap(document.createElement('div'))).toThrow(/not loaded/);
  });
});
