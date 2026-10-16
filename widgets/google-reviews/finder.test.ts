// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { mountFinder } from './finder';

describe('in-editor company finder', () => {
  it('debounces typing, lists suggestions, and picking previews + shows the Place ID', async () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    const search = vi.fn().mockResolvedValue([{ placeId: 'ChIJ1', name: 'HRA <b>Recruitment</b>', address: 'Wolverhampton' }]);
    const onPick = vi.fn();
    mountFinder(host, { lang: 'en', onPick, search });
    const input = host.querySelector<HTMLInputElement>('.es-finder-input')!;
    input.value = 'h'; input.dispatchEvent(new Event('input'));
    input.value = 'hra'; input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(300);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('hra', 'en');
    expect(host.innerHTML).not.toContain('<b>Recruitment</b>');
    host.querySelector<HTMLButtonElement>('[data-i="0"]')!.click();
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ placeId: 'ChIJ1' }));
    expect(host.querySelector('.es-finder-id code')!.textContent).toBe('ChIJ1');
    vi.useRealTimers();
  });

  it('shows which business is on screen', () => {
    const host = document.createElement('div');
    const f = mountFinder(host, { lang: 'en', onPick: vi.fn(), search: vi.fn() });
    f.setCurrent({ name: 'Acme', address: '1 St', rating: 5, reviewCount: 1, reviewsUrl: '', writeReviewUrl: '' });
    expect(host.querySelector('.es-finder-current')!.textContent).toContain('Showing Acme, 1 St');
  });
});
