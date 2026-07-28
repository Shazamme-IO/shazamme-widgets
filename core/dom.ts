// DOM helpers that kill the slow legacy render patterns:
//   #8  handlers rebound on every showJobs -> bind ONCE via event delegation.
//   #11 jQuery .find() re-queries + full .html() rebuilds -> a tiny createElement
//       helper plus a keyed list reconcile that touches only changed children.
// Plain DOM API — core stays framework-light; widgets keep their own jQuery.

/** Handler for a delegated event: the raw event + the matched descendant. */
export type DelegatedHandler = (event: Event, matched: Element) => void;

/**
 * Attach ONE listener on `root` that fires `handler` when the event's target is
 * (or is inside) an element matching `selector`, scoped within `root`.
 * Returns a detach function. Bind once — never rebind inside a render loop.
 */
export function delegate(
  root: Element,
  eventType: string,
  selector: string,
  handler: DelegatedHandler,
): () => void {
  const listener = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const matched = target.closest(selector);
    if (matched && root.contains(matched)) {
      handler(event, matched);
    }
  };
  root.addEventListener(eventType, listener);
  return (): void => root.removeEventListener(eventType, listener);
}

/** Attributes accepted by `el`. `class`/`text`/`html`/`dataset` are special. */
export interface ElAttrs {
  class?: string;
  text?: string;
  html?: string;
  dataset?: Record<string, string>;
  [attr: string]: string | Record<string, string> | undefined;
}

/** Tiny createElement helper. No global state — returns a fresh node. */
export function el(
  tag: string,
  attrs: ElAttrs = {},
  children: ReadonlyArray<Node | string> = [],
): HTMLElement {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue;
    if (key === 'class') {
      node.className = String(value);
    } else if (key === 'text') {
      node.textContent = String(value);
    } else if (key === 'html') {
      node.innerHTML = String(value);
    } else if (key === 'dataset') {
      for (const [dk, dv] of Object.entries(value as Record<string, string>)) {
        node.dataset[dk] = String(dv);
      }
    } else {
      node.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

/** Guarded innerHTML set (single assignment, no re-query). */
export function setHtml(node: Element, html: string): void {
  node.innerHTML = html;
}

/** Remove all children without an innerHTML round-trip. */
export function clear(node: Element): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

const KEY_ATTR = 'data-key';

/**
 * Keyed list reconcile. Adds, moves, and removes ONLY changed children instead
 * of rebuilding the container. `renderItem` receives the existing keyed node (or
 * null) so callers can reuse and mutate it — node identity is preserved across
 * renders that keep a key. Deliberately simple: keyed diff by data-key, no vdom.
 */
export function renderList<T>(
  container: Element,
  items: readonly T[],
  keyOf: (item: T) => string,
  renderItem: (item: T, existing: Element | null) => Element,
): void {
  const existing = new Map<string, Element>();
  for (const child of Array.from(container.children)) {
    const key = child.getAttribute(KEY_ATTR);
    if (key !== null) existing.set(key, child);
  }

  const nextKeys = new Set<string>();
  let ref: Node | null = container.firstChild;

  for (const item of items) {
    const key = keyOf(item);
    nextKeys.add(key);
    const prev = existing.get(key) ?? null;
    const node = renderItem(item, prev);
    node.setAttribute(KEY_ATTR, key);

    if (node === ref) {
      ref = node.nextSibling;
    } else {
      container.insertBefore(node, ref);
    }
  }

  for (const [key, node] of existing) {
    if (!nextKeys.has(key)) container.removeChild(node);
  }
}
