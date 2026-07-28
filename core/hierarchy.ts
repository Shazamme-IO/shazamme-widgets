// The marquee feature: a TRUE N-level, parent-linked facet tree.
//
// Configure levels as [jobType, profession, role] where profession.parentField
// = 'jobTypeID' and role.parentField = 'professionID'. jobType is the
// grandparent — this is the NEW behaviour; legacy had jobType flat.
//
// Two load-bearing legacy behaviours are preserved:
//   1. `id` falls back to `value` when the *ID field is empty (`toIndex`).
//   2. picking a child auto-selects its ancestors; removing a parent cascades
//      removal to its descendants.

import type { FacetNode, FacetLevel, FilterState, Hierarchy } from './types';

/** Legacy node factory. `id` falls back to `value`; `seo` falls back to `id`. */
export function toIndex(
  value: string,
  id?: string,
  seo?: string,
  parent?: string,
): FacetNode {
  return {
    value,
    id: id || value,
    seo: seo || id,
    parent: parent || undefined,
  };
}

export interface BuildOptions {
  levels: FacetLevel[];
}

/** Rich tree returned by buildHierarchy — satisfies Hierarchy plus link helpers. */
export interface FacetTree extends Hierarchy {
  levels: FacetLevel[];
  nodeById(field: string, id: string): FacetNode | undefined;
  parentField(field: string): string | undefined;
  childFields(field: string): string[];
}

function readField(job: Record<string, unknown>, key: string): string {
  const v = job[key];
  return v == null ? '' : String(v);
}

function resolveId(job: Record<string, unknown>, level: FacetLevel): string {
  return readField(job, String(level.idKey)) || readField(job, String(level.labelKey));
}

/** Build the parent-linked, deduped, counted facet tree from raw jobs. */
export function buildHierarchy(
  jobs: ReadonlyArray<{ data: Record<string, unknown> }>,
  opts: BuildOptions,
): FacetTree {
  const { levels } = opts;

  const idKeyToLevel = new Map<string, FacetLevel>();
  for (const l of levels) idKeyToLevel.set(String(l.idKey), l);

  const parentFieldMap = new Map<string, string | undefined>();
  const childFieldsMap = new Map<string, string[]>();
  for (const l of levels) {
    const parentLevel = l.parentField ? idKeyToLevel.get(String(l.parentField)) : undefined;
    parentFieldMap.set(l.field, parentLevel?.field);
    if (parentLevel) {
      const arr = childFieldsMap.get(parentLevel.field) ?? [];
      arr.push(l.field);
      childFieldsMap.set(parentLevel.field, arr);
    }
  }

  const index: Record<string, FacetNode[]> = {};
  const counts: Record<string, Record<string, number>> = {};
  const seen: Record<string, Map<string, FacetNode>> = {};
  for (const l of levels) {
    index[l.field] = [];
    counts[l.field] = {};
    seen[l.field] = new Map();
  }

  for (const { data } of jobs) {
    for (const level of levels) {
      const id = resolveId(data, level);
      if (!id) continue;

      const value = readField(data, String(level.labelKey)) || id;
      const seo = level.seoKey ? readField(data, String(level.seoKey)) : '';

      // Parent linkage: resolve the PARENT level's id off this same job row,
      // applying the same id-fallback so linkage survives empty *ID fields.
      let parent: string | undefined;
      if (level.parentField) {
        const parentLevel = idKeyToLevel.get(String(level.parentField));
        parent = parentLevel
          ? resolveId(data, parentLevel) || undefined
          : readField(data, String(level.parentField)) || undefined;
      }

      counts[level.field][id] = (counts[level.field][id] ?? 0) + 1;

      if (!seen[level.field].has(id)) {
        const node = toIndex(value, id, seo || undefined, parent);
        seen[level.field].set(id, node);
        index[level.field].push(node);
      }
    }
  }

  const nodeById = (field: string, id: string): FacetNode | undefined =>
    seen[field]?.get(id);

  const children = (field: string, parentId: string): FacetNode[] =>
    (index[field] ?? []).filter((n) => n.parent === parentId);

  const roots = (field: string): FacetNode[] =>
    (index[field] ?? []).filter((n) => !n.parent);

  return {
    index,
    counts,
    children,
    roots,
    levels,
    nodeById,
    parentField: (field) => parentFieldMap.get(field),
    childFields: (field) => childFieldsMap.get(field) ?? [],
  };
}

function without(arr: string[], id: string): string[] {
  return arr.filter((x) => x !== id);
}

function withId(arr: string[], id: string): string[] {
  return arr.includes(id) ? arr : [...arr, id];
}

/**
 * Immutable toggle of a facet id.
 * - Adding a child auto-selects its ancestor chain.
 * - Removing a parent cascades removal to all selected descendants.
 */
export function toggleFacet(
  state: FilterState,
  tree: FacetTree,
  field: string,
  id: string,
): FilterState {
  const next: FilterState = {};
  for (const k of Object.keys(state)) next[k] = [...state[k]];

  const isSelected = (next[field] ?? []).includes(id);

  if (isSelected) {
    next[field] = without(next[field] ?? [], id);
    cascadeRemove(next, tree, field, id);
  } else {
    next[field] = withId(next[field] ?? [], id);
    autoSelectAncestors(next, tree, field, id);
  }

  // Drop any keys that emptied out.
  for (const k of Object.keys(next)) {
    if (next[k].length === 0) delete next[k];
  }
  return next;
}

function autoSelectAncestors(
  state: FilterState,
  tree: FacetTree,
  field: string,
  id: string,
): void {
  const node = tree.nodeById(field, id);
  if (!node || !node.parent) return;
  const pField = tree.parentField(field);
  if (!pField) return;
  state[pField] = withId(state[pField] ?? [], node.parent);
  autoSelectAncestors(state, tree, pField, node.parent);
}

function cascadeRemove(
  state: FilterState,
  tree: FacetTree,
  field: string,
  id: string,
): void {
  for (const childField of tree.childFields(field)) {
    const selected = state[childField];
    if (!selected || selected.length === 0) continue;
    const descendants = selected.filter(
      (childId) => tree.nodeById(childField, childId)?.parent === id,
    );
    for (const d of descendants) {
      state[childField] = without(state[childField], d);
      cascadeRemove(state, tree, childField, d);
    }
  }
}

/** Immutably drop selected ids that no longer exist in the tree. */
export function pruneStale(state: FilterState, tree: FacetTree): FilterState {
  const next: FilterState = {};
  for (const field of Object.keys(state)) {
    const nodes = tree.index[field];
    if (!nodes) continue; // field not part of this tree — drop it
    const kept = state[field].filter((id) => nodes.some((n) => n.id === id));
    if (kept.length > 0) next[field] = kept;
  }
  return next;
}
