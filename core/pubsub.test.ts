import { describe, it, expect, vi } from 'vitest';
import { wrapSdk, type ShazammeClient } from './sdk';
import {
  MESSAGES,
  defineChannel,
  publishFilterChange,
  onFilterChange,
  type FilterChangePayload,
} from './pubsub';

/** An in-memory pub/sub bus so we can prove delivery + unsubscribe. */
function busClient(): ShazammeClient {
  const listeners = new Map<string, Set<(p?: unknown) => void>>();
  return {
    fetch: async () => ({ values: [] }),
    submit: async () => ({}),
    site: async () => ({ siteID: 'S' }),
    pub(msg: string, payload?: unknown): void {
      for (const cb of listeners.get(msg) ?? []) cb(payload);
    },
    sub(msg: string, cb: (p?: unknown) => void): void {
      const set = listeners.get(msg) ?? new Set();
      set.add(cb);
      listeners.set(msg, set);
    },
    unsub(msg: string, cb: (p?: unknown) => void): void {
      listeners.get(msg)?.delete(cb);
    },
  };
}

describe('MESSAGES', () => {
  it('exposes the legacy-compatible string values', () => {
    expect(MESSAGES.FILTER_CHANGE).toBe('job-search-submit');
    expect(MESSAGES.RESULTS_READY).toBe('shazamme:results-ready');
    expect(MESSAGES.LOGIN).toBe('site-auth');
    expect(MESSAGES.SAVE_JOB).toBe('job-results-save-job');
  });

  it('is frozen', () => {
    expect(Object.isFrozen(MESSAGES)).toBe(true);
  });
});

describe('filter-change channel', () => {
  it('delivers the typed payload from publish to subscriber', () => {
    const sdk = wrapSdk(busClient());
    const received: FilterChangePayload[] = [];
    onFilterChange(sdk, (p) => received.push(p));

    const payload: FilterChangePayload = {
      state: { jobTypeID: ['1'] },
      keyword: 'nurse',
      geo: { lat: 51.5, lon: -0.12 },
      geoRange: 25,
    };
    publishFilterChange(sdk, payload);

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual(payload);
    expect(received[0].state.jobTypeID).toEqual(['1']);
  });

  it('stops delivery after the returned unsubscribe is called', () => {
    const sdk = wrapSdk(busClient());
    const cb = vi.fn();
    const unsubscribe = onFilterChange(sdk, cb);

    publishFilterChange(sdk, { state: {}, keyword: 'a' });
    expect(cb).toHaveBeenCalledTimes(1);

    unsubscribe();
    publishFilterChange(sdk, { state: {}, keyword: 'b' });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('unsubscribing one subscriber leaves the other receiving', () => {
    const sdk = wrapSdk(busClient());
    const a = vi.fn();
    const b = vi.fn();
    const unsubA = onFilterChange(sdk, a);
    onFilterChange(sdk, b);

    unsubA();
    publishFilterChange(sdk, { state: {}, keyword: 'x' });

    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });
});

describe('defineChannel', () => {
  it('builds a working channel for an arbitrary message + payload type', () => {
    interface Ping {
      seq: number;
    }
    const pingChannel = defineChannel<Ping>('shazamme:test-ping');
    const sdk = wrapSdk(busClient());
    const seen: Ping[] = [];

    const off = pingChannel.subscribe(sdk, (p) => seen.push(p));
    pingChannel.publish(sdk, { seq: 7 });
    expect(seen).toEqual([{ seq: 7 }]);

    off();
    pingChannel.publish(sdk, { seq: 8 });
    expect(seen).toEqual([{ seq: 7 }]);
  });
});
