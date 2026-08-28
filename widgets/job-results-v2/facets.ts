// Facet panels: the 3-level classification tree (jobType → profession → role),
// the location pair (state → city), and flat attribute facets (workType,
// workModel, shiftType). One master FacetTree is built from ALL jobs so options
// stay stable while filtering; toggling routes through core/hierarchy toggleFacet
// (parent auto-select + child cascade). The whole panel is a single innerHTML
// write into the stable [data-rel=filter-attribute] host — the click listener is
// delegated on the sidebar once, so a rebuild never rebinds handlers (fix #8).

import type { Job, FacetLevel, FacetNode, FilterState } from '../../core/types';
import type { WidgetConfig } from '../../core/config';
import { buildHierarchy, type FacetTree } from '../../core/hierarchy';
import { setHtml } from '../../core/dom';
import { escapeHtml } from './cards';

/** Master levels — one connected structure; disconnected fields become roots. */
export const MASTER_LEVELS: FacetLevel[] = [
  { field: 'jobTypeID', labelKey: 'jobType', idKey: 'jobTypeID' },
  { field: 'professionID', labelKey: 'category', idKey: 'professionID', seoKey: 'professionSeo', parentField: 'jobTypeID' },
  { field: 'roleID', labelKey: 'subCategory', idKey: 'roleID', seoKey: 'roleSeo', parentField: 'professionID' },
  { field: 'state', labelKey: 'state', idKey: 'state' },
  { field: 'city', labelKey: 'city', idKey: 'city', parentField: 'state' },
  { field: 'workTypeID', labelKey: 'workType', idKey: 'workTypeID' },
  { field: 'workModelID', labelKey: 'workModel', idKey: 'workModelID' },
  { field: 'shiftType', labelKey: 'shiftType', idKey: 'shiftType' },
];

export function buildFacetTree(jobs: readonly Job[]): FacetTree {
  return buildHierarchy(
    jobs.map((j) => ({ data: j as Record<string, unknown> })),
    { levels: MASTER_LEVELS },
  );
}

interface FacetGroup {
  title: string;
  field: string;
  /** When set, render this field's nodes nested under each parent node. */
  childField?: string;
}

/** Resolve which groups to render (and how) from the widget config. */
export function groupsFor(cfg: WidgetConfig): FacetGroup[] {
  const groups: FacetGroup[] = [];
  if (cfg.showJobTypeFilter) groups.push({ title: 'Job Type', field: 'jobTypeID' });

  if (cfg.showClassificationFilter) {
    const nest = cfg.useSubFilters && cfg.showSubClassificationFilter;
    groups.push({ title: 'Classification', field: 'professionID', childField: nest ? 'roleID' : undefined });
  }
  if (cfg.showSubClassificationFilter && !cfg.useSubFilters) {
    groups.push({ title: 'Sub Classification', field: 'roleID' });
  }

  if (cfg.showLocationFilter) {
    groups.push({ title: 'Location', field: 'state', childField: cfg.useSubFilters ? 'city' : undefined });
    if (!cfg.useSubFilters) groups.push({ title: 'Area', field: 'city' });
  }

  groups.push({ title: 'Work Type', field: 'workTypeID' });
  groups.push({ title: 'Work Model', field: 'workModelID' });
  groups.push({ title: 'Shift', field: 'shiftType' });
  return groups;
}

function isActive(state: FilterState, field: string, id: string): boolean {
  return (state[field] ?? []).includes(id);
}

function toggleHtml(node: FacetNode, field: string, count: number, active: boolean, nested: boolean): string {
  const tag = nested ? 'a' : 'div';
  const classes = ['filter-toggle'];
  if (nested) classes.push('filter-nested', 'visible');
  if (active) classes.push('active');
  const seo = node.seo ? ` data-filter-path="${escapeHtml(node.seo)}"` : '';
  const parent = node.parent ? ` data-filter-parent-value="${escapeHtml(node.parent)}"` : '';
  const label = `${escapeHtml(node.value)} (${count})`;
  return `<${tag} class="${classes.join(' ')}" href="javascript:void(0)" data-rel="filter-toggle" data-filter-type="${escapeHtml(field)}" data-filter-value="${escapeHtml(node.id)}"${seo}${parent}><input type="checkbox"${active ? ' checked' : ''} /> ${label}</${tag}>`;
}

function groupHtml(group: FacetGroup, tree: FacetTree, state: FilterState): string {
  const nodes = tree.index[group.field] ?? [];
  if (nodes.length === 0) return '';

  const parts: string[] = [
    `<p class="filter-title" data-rel="filter-group" data-filter-type="${escapeHtml(group.field)}">${escapeHtml(group.title)}</p>`,
  ];

  for (const node of nodes) {
    const count = tree.counts[group.field]?.[node.id] ?? 0;
    parts.push(toggleHtml(node, group.field, count, isActive(state, group.field, node.id), false));

    if (group.childField) {
      for (const child of tree.children(group.childField, node.id)) {
        const childCount = tree.counts[group.childField]?.[child.id] ?? 0;
        parts.push(
          toggleHtml(child, group.childField, childCount, isActive(state, group.childField, child.id), true),
        );
      }
    }
  }
  return parts.join('');
}

/** Rebuild the entire facet panel from state (cheap; delegated handler stays bound). */
export function renderFacets(
  host: Element,
  tree: FacetTree,
  cfg: WidgetConfig,
  state: FilterState,
): void {
  const html = groupsFor(cfg).map((g) => groupHtml(g, tree, state)).join('');
  setHtml(host, html);
}
