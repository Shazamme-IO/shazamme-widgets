// In-editor company finder, the Elfsight-style lookup: type the company name,
// pick it from Google's suggestions, and the widget previews that business and
// shows its Place ID to paste into the Source tab. Rendered only when Duda says
// we're in the editor (data.inEditor), so site visitors never see it.

import { searchBusinesses, type Business, type Suggestion } from './data';
import { esc } from './format';

const DEBOUNCE_MS = 300;
const MIN_CHARS = 3;

export interface FinderOpts {
  lang: string;
  onPick: (s: Suggestion) => void;
  search?: typeof searchBusinesses;
}

export interface Finder {
  setCurrent: (b: Business | null) => void;
}

export function mountFinder(host: HTMLElement, o: FinderOpts): Finder {
  const search = o.search ?? searchBusinesses;
  host.className = 'es-embed-root es-finder';
  host.innerHTML =
    `<div class="es-finder-current" hidden></div>` +
    `<label class="es-finder-label">Find the business on Google` +
    `<input class="es-finder-input" type="search" autocomplete="off" placeholder="Start typing the company name…"></label>` +
    `<ul class="es-finder-results" role="listbox" hidden></ul>` +
    `<div class="es-finder-picked" hidden></div>` +
    `<p class="es-finder-note">Only shown in the Duda editor.</p>`;
  const input = host.querySelector<HTMLInputElement>('.es-finder-input')!;
  const results = host.querySelector<HTMLUListElement>('.es-finder-results')!;
  const picked = host.querySelector<HTMLElement>('.es-finder-picked')!;
  const current = host.querySelector<HTMLElement>('.es-finder-current')!;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let seq = 0;
  let found: Suggestion[] = [];

  async function run(q: string): Promise<void> {
    const mine = ++seq;
    try {
      const list = await search(q, o.lang);
      if (mine !== seq) return; // a newer keystroke won
      found = list;
      results.innerHTML = list.length
        ? list.map((r, i) => `<li><button type="button" data-i="${i}"><strong>${esc(r.name)}</strong><span>${esc(r.address)}</span></button></li>`).join('')
        : `<li class="es-finder-empty">No businesses found. Try adding the suburb.</li>`;
      results.hidden = false;
    } catch (e) {
      if (mine !== seq) return;
      results.innerHTML = `<li class="es-finder-empty">${esc((e as Error).message)}</li>`;
      results.hidden = false;
    }
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < MIN_CHARS) {
      seq++; // drop any answer still in flight for a longer query
      found = [];
      results.hidden = true;
      return;
    }
    timer = setTimeout(() => void run(q), DEBOUNCE_MS);
  });

  results.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLElement>('[data-i]');
    const choice = btn ? found[Number(btn.dataset.i)] : undefined;
    if (!choice) return;
    seq++;
    results.hidden = true;
    input.value = choice.name;
    picked.hidden = false;
    picked.innerHTML =
      `<div><strong>${esc(choice.name)}</strong> ${esc(choice.address)}</div>` +
      `<div class="es-finder-id">Place ID: <code>${esc(choice.placeId)}</code> ` +
      `<button type="button" class="es-finder-copy">Copy</button></div>` +
      `<div class="es-finder-hint">Paste it into <b>Google Place ID</b> in the Source tab to save it. The preview below already shows this business.</div>`;
    picked.querySelector<HTMLButtonElement>('.es-finder-copy')!.addEventListener('click', (ev) => {
      const b = ev.currentTarget as HTMLButtonElement;
      navigator.clipboard?.writeText(choice.placeId).then(() => { b.textContent = 'Copied'; }, () => { b.textContent = 'Select and copy'; });
    });
    o.onPick(choice);
  });

  return {
    setCurrent(b) {
      current.hidden = !b?.name;
      if (b?.name) current.innerHTML = `Showing <strong>${esc(b.name)}</strong>${b.address ? `, ${esc(b.address)}` : ''}. Wrong business? Search below.`;
    },
  };
}
