// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { delegate, el, setHtml, clear, renderList } from './dom';

describe('delegate', () => {
  it('fires for a matching descendant and passes the matched element', () => {
    const root = el('div', { html: '<button class="go">Go</button>' });
    const handler = vi.fn();
    delegate(root, 'click', '.go', handler);

    const btn = root.querySelector('.go') as HTMLElement;
    btn.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][1]).toBe(btn);
  });

  it('fires for a descendant added AFTER binding (bind once)', () => {
    const root = el('div');
    const handler = vi.fn();
    delegate(root, 'click', '.go', handler);

    const btn = el('button', { class: 'go' });
    root.appendChild(btn);
    btn.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks on non-matching elements', () => {
    const root = el('div', {}, [el('span', { class: 'nope' })]);
    const handler = vi.fn();
    delegate(root, 'click', '.go', handler);

    (root.querySelector('.nope') as HTMLElement).click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('stops firing after detach', () => {
    const root = el('div', {}, [el('button', { class: 'go' })]);
    const handler = vi.fn();
    const detach = delegate(root, 'click', '.go', handler);
    const btn = root.querySelector('.go') as HTMLElement;

    btn.click();
    detach();
    btn.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('el', () => {
  it('sets class, dataset, text, and attributes', () => {
    const node = el('a', {
      class: 'card',
      href: '/jobs/1',
      dataset: { jobId: '1' },
      text: 'View',
    });
    expect(node.tagName).toBe('A');
    expect(node.className).toBe('card');
    expect(node.getAttribute('href')).toBe('/jobs/1');
    expect(node.dataset.jobId).toBe('1');
    expect(node.textContent).toBe('View');
  });

  it('appends string and node children in order', () => {
    const child = el('em', { text: 'b' });
    const node = el('p', {}, ['a', child]);
    expect(node.childNodes).toHaveLength(2);
    expect(node.firstChild?.textContent).toBe('a');
    expect(node.lastChild).toBe(child);
  });
});

describe('setHtml / clear', () => {
  it('setHtml replaces content', () => {
    const node = el('div', { html: '<span>old</span>' });
    setHtml(node, '<span>new</span>');
    expect(node.innerHTML).toBe('<span>new</span>');
  });

  it('clear removes all children', () => {
    const node = el('div', {}, [el('span'), el('span')]);
    clear(node);
    expect(node.childNodes).toHaveLength(0);
  });
});

interface Row {
  id: string;
  label: string;
}

/** renderItem that reuses the existing node (updates text) to prove reuse. */
function renderRow(item: Row, existing: Element | null): Element {
  const node = existing ?? el('li');
  node.textContent = item.label;
  return node;
}

function keys(container: Element): string[] {
  return Array.from(container.children).map((c) => c.getAttribute('data-key') ?? '');
}

describe('renderList', () => {
  it('adds nodes for new items', () => {
    const ul = el('ul');
    renderList(ul, [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], (r) => r.id, renderRow);
    expect(keys(ul)).toEqual(['a', 'b']);
    expect(ul.textContent).toBe('AB');
  });

  it('reuses the SAME node instance across re-renders with the same key', () => {
    const ul = el('ul');
    const items: Row[] = [{ id: 'a', label: 'A' }];
    renderList(ul, items, (r) => r.id, renderRow);
    const firstNode = ul.children[0];

    renderList(ul, [{ id: 'a', label: 'A2' }], (r) => r.id, renderRow);
    expect(ul.children[0]).toBe(firstNode); // identity preserved
    expect(firstNode.textContent).toBe('A2'); // content updated in place
  });

  it('removes nodes for dropped items', () => {
    const ul = el('ul');
    renderList(ul, [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], (r) => r.id, renderRow);
    renderList(ul, [{ id: 'a', label: 'A' }], (r) => r.id, renderRow);
    expect(keys(ul)).toEqual(['a']);
  });

  it('reorders existing nodes without recreating them', () => {
    const ul = el('ul');
    renderList(
      ul,
      [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }],
      (r) => r.id,
      renderRow,
    );
    const nodeA = ul.children[0];
    const nodeC = ul.children[2];

    renderList(
      ul,
      [{ id: 'c', label: 'C' }, { id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
      (r) => r.id,
      renderRow,
    );

    expect(keys(ul)).toEqual(['c', 'a', 'b']);
    expect(ul.children[0]).toBe(nodeC); // moved, not recreated
    expect(ul.children[1]).toBe(nodeA);
  });
});
