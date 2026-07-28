import { describe, it, expect, vi } from 'vitest';
import { wrapSdk, jobsFetchDesc, type ShazammeClient } from './sdk';

function stubClient(overrides: Partial<ShazammeClient> = {}): ShazammeClient {
  return {
    fetch: vi.fn().mockResolvedValue({ values: [] }),
    submit: vi.fn().mockResolvedValue({ ok: true }),
    site: vi.fn().mockResolvedValue({ siteID: 'S1' }),
    pub: vi.fn(),
    sub: vi.fn(),
    unsub: vi.fn(),
    ...overrides,
  };
}

describe('jobsFetchDesc', () => {
  it('builds the cached jobs descriptor and NEVER includes limit', () => {
    const desc = jobsFetchDesc('SITE42');
    expect(desc).toMatchObject({
      action: 'Get Jobs',
      useCache: true,
      path: '/job-results/SITE42',
      isExternal: true,
    });
    expect('limit' in desc).toBe(false);
  });
});

describe('Sdk wrapper', () => {
  it('forwards fetchJobs with the limit-free descriptor', async () => {
    const client = stubClient();
    const sdk = wrapSdk(client);
    await sdk.fetchJobs('SITE42');
    expect(client.fetch).toHaveBeenCalledOnce();
    const arg = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(arg.path).toBe('/job-results/SITE42');
    expect('limit' in arg).toBe(false);
  });

  it('forwards submit with the action merged in', async () => {
    const client = stubClient();
    const sdk = wrapSdk(client);
    await sdk.submit('Save Job', { jobID: 'J1', candidateID: 'C1' });
    expect(client.submit).toHaveBeenCalledWith({
      action: 'Save Job',
      jobID: 'J1',
      candidateID: 'C1',
    });
  });

  it('forwards site/pub/sub/unsub', () => {
    const client = stubClient();
    const sdk = wrapSdk(client);
    const cb = () => {};
    sdk.pub('login', { u: 1 });
    sdk.sub('filter', cb);
    sdk.unsub('filter', cb);
    expect(client.pub).toHaveBeenCalledWith('login', { u: 1 });
    expect(client.sub).toHaveBeenCalledWith('filter', cb);
    expect(client.unsub).toHaveBeenCalledWith('filter', cb);
  });
});
