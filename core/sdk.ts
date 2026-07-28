// Thin typed wrapper over the Duda-injected `shazamme` SDK client.
// Core never calls the raw global directly — it takes this wrapper as a param,
// which keeps everything unit-testable with a plain stub.

import type { JobCollection } from './types';

/** Descriptor for a `shazamme.fetch` call. NEVER include `limit` for jobs. */
export interface FetchDesc {
  name?: string;
  action?: string;
  useCache?: boolean;
  path?: string;
  isExternal?: boolean;
  [key: string]: unknown;
}

/** The raw injected client surface we depend on (a subset of the real SDK). */
export interface ShazammeClient {
  fetch(desc: FetchDesc): Promise<JobCollection | unknown>;
  submit(payload: Record<string, unknown>): Promise<unknown>;
  site(): Promise<SiteInfo>;
  pub(msg: string, payload?: unknown): void;
  sub(msg: string, cb: (payload?: unknown) => void): void;
  unsub?(msg: string, cb: (payload?: unknown) => void): void;
  bag?: Record<string, unknown>;
}

export interface SiteInfo {
  siteID: string;
  configuration?: {
    jobFieldMap?: Record<string, unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export type SubmitAction =
  | 'Save Job'
  | 'Create Job Alert'
  | 'Delete Saved Job'
  | 'Get Saved Jobs';

/** Build the jobs fetch descriptor. Deliberately has no `limit` (the nesco trap). */
export function jobsFetchDesc(siteID: string, name = 'Get Jobs'): FetchDesc {
  return {
    name,
    action: 'Get Jobs',
    useCache: true,
    path: `/job-results/${siteID}`,
    isExternal: true,
  };
}

/** A typed facade over the raw client. */
export class Sdk {
  constructor(private readonly client: ShazammeClient) {}

  /** Fetch the cached job collection for a site. Never passes `limit`. */
  fetchJobs(siteID: string): Promise<JobCollection | unknown> {
    return this.client.fetch(jobsFetchDesc(siteID));
  }

  /** Generic cached fetch (workModel / locationSeo lookups). */
  fetch(desc: FetchDesc): Promise<JobCollection | unknown> {
    return this.client.fetch(desc);
  }

  submit(action: SubmitAction, payload: Record<string, unknown> = {}): Promise<unknown> {
    return this.client.submit({ action, ...payload });
  }

  site(): Promise<SiteInfo> {
    return this.client.site();
  }

  pub(msg: string, payload?: unknown): void {
    this.client.pub(msg, payload);
  }

  sub(msg: string, cb: (payload?: unknown) => void): void {
    this.client.sub(msg, cb);
  }

  unsub(msg: string, cb: (payload?: unknown) => void): void {
    this.client.unsub?.(msg, cb);
  }
}

/** Wrap a raw injected client. */
export function wrapSdk(client: ShazammeClient): Sdk {
  return new Sdk(client);
}
