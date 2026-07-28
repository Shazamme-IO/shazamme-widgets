// Lazy MapLibre view. MapLibre GL is fetched from the CDN ONLY when the Map view
// is first engaged (fix #5: no map JS in the bootstrap path). Markers come from
// the current page's jobs; coordinate flipping lives entirely in core/maps.

import type { Job } from '../../core/types';
import { loadMapLibre, createMap, type MapAdapter, type MapPoint } from '../../core/maps';
import { escapeHtml } from './cards';

function str(job: Job, key: string): string {
  const v = (job as Record<string, unknown>)[key];
  return v == null ? '' : String(v);
}

function toPoint(job: Job): MapPoint | null {
  const lat = parseFloat(str(job, 'latitude'));
  const lon = parseFloat(str(job, 'longitude'));
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  const name = escapeHtml(str(job, 'jobName') || str(job, 'title'));
  const loc = escapeHtml([str(job, 'city'), str(job, 'state')].filter(Boolean).join(', '));
  return {
    id: str(job, 'jobID') || str(job, 'referenceNumber') || name,
    lat,
    lon,
    popupHtml: `<div class="gmapInfoContainer"><div class="gmapTitle">${name}</div><div>${loc}</div></div>`,
  };
}

/** Owns the lazily-created map and keeps its markers in sync with the results. */
export class MapView {
  private adapter: MapAdapter | null = null;
  private pending: Job[] = [];

  constructor(private readonly container: HTMLElement) {}

  get isReady(): boolean {
    return this.adapter !== null;
  }

  /** Load MapLibre (once) and create the map, then paint the pending markers. */
  async ensure(): Promise<void> {
    if (this.adapter) return;
    await loadMapLibre();
    this.adapter = createMap(this.container);
    this.setJobs(this.pending);
  }

  /** Update markers from a set of jobs. Buffers until the map is ready. */
  setJobs(jobs: readonly Job[]): void {
    this.pending = jobs.slice();
    if (!this.adapter) return;
    const points = jobs.map(toPoint).filter((p): p is MapPoint => p !== null);
    this.adapter.setMarkers(points);
    this.adapter.fitToMarkers();
  }

  destroy(): void {
    this.adapter?.destroy();
    this.adapter = null;
  }
}
