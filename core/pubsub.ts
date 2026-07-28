// Typed message contract shared by the search-bar and results widgets.
// They communicate ONLY through shazamme.pub/sub — this module is the one
// place the message names and payload shapes are declared, so neither widget
// hand-writes a magic string. Values match the legacy bus so a rebuilt widget
// interoperates with any not-yet-rebuilt counterpart:
//   FILTER_CHANGE -> 'job-search-submit'    (jobsearch2026 pub, results sub)
//   SAVE_JOB      -> 'job-results-save-job'  (Message.saveJob)
//   LOGIN         -> 'site-auth'             (Subscribe.auth, carries the user)
//   RESULTS_READY -> new (no legacy equivalent) — namespaced.

import type { Sdk } from './sdk';
import type { FilterState, GeoPoint } from './types';

/** Frozen map of message-name constants. The only source of these strings. */
export const MESSAGES = Object.freeze({
  FILTER_CHANGE: 'job-search-submit',
  RESULTS_READY: 'shazamme:results-ready',
  LOGIN: 'site-auth',
  SAVE_JOB: 'job-results-save-job',
} as const);

export type MessageName = (typeof MESSAGES)[keyof typeof MESSAGES];

/** Search bar -> results: a new filter selection to apply. */
export interface FilterChangePayload {
  state: FilterState;
  keyword: string;
  geo?: GeoPoint | null;
  geoRange?: number;
}

/** Results -> search bar (or host): a query finished, N jobs matched. */
export interface ResultsReadyPayload {
  total: number;
}

/** Auth state broadcast. Fields optional — a logout carries no user. */
export interface LoginPayload {
  userID?: string;
  email?: string;
  [key: string]: unknown;
}

/** A save-job request raised from a results card. */
export interface SaveJobPayload {
  jobID: string;
  candidateID?: string;
}

/** A typed publish/subscribe pair bound to one message. */
export interface Channel<T> {
  readonly message: string;
  publish(sdk: Sdk, payload: T): void;
  /** Subscribe; returns an unsubscribe function. */
  subscribe(sdk: Sdk, cb: (payload: T) => void): () => void;
}

/**
 * Build a typed channel for a message. Adding a new message is one line —
 * declare its payload interface and call defineChannel with its constant.
 */
export function defineChannel<T>(message: string): Channel<T> {
  return {
    message,
    publish(sdk: Sdk, payload: T): void {
      sdk.pub(message, payload);
    },
    subscribe(sdk: Sdk, cb: (payload: T) => void): () => void {
      const handler = (payload?: unknown): void => cb(payload as T);
      sdk.sub(message, handler);
      return (): void => sdk.unsub(message, handler);
    },
  };
}

export const filterChangeChannel: Channel<FilterChangePayload> =
  defineChannel<FilterChangePayload>(MESSAGES.FILTER_CHANGE);
export const resultsReadyChannel: Channel<ResultsReadyPayload> =
  defineChannel<ResultsReadyPayload>(MESSAGES.RESULTS_READY);
export const loginChannel: Channel<LoginPayload> =
  defineChannel<LoginPayload>(MESSAGES.LOGIN);
export const saveJobChannel: Channel<SaveJobPayload> =
  defineChannel<SaveJobPayload>(MESSAGES.SAVE_JOB);

/** Publish a filter change from the search bar to the results widget. */
export function publishFilterChange(sdk: Sdk, payload: FilterChangePayload): void {
  filterChangeChannel.publish(sdk, payload);
}

/** Subscribe to filter changes. Returns an unsubscribe function. */
export function onFilterChange(
  sdk: Sdk,
  cb: (payload: FilterChangePayload) => void,
): () => void {
  return filterChangeChannel.subscribe(sdk, cb);
}
