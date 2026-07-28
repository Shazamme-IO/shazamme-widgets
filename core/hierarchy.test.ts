import { describe, it, expect } from 'vitest';
import { toIndex, buildHierarchy, toggleFacet, pruneStale, type FacetTree } from './hierarchy';
import type { FacetLevel, FilterState } from './types';

const levels: FacetLevel[] = [
  { field: 'jobTypeID', labelKey: 'jobType', idKey: 'jobTypeID' },
  { field: 'professionID', labelKey: 'category', idKey: 'professionID', seoKey: 'professionSeo', parentField: 'jobTypeID' },
  { field: 'roleID', labelKey: 'subCategory', idKey: 'roleID', seoKey: 'roleSeo', parentField: 'professionID' },
];

const jobs = [
  { data: { jobTypeID: 'JT1', jobType: 'Permanent', professionID: 'P1', category: 'IT', professionSeo: 'it', roleID: 'R1', subCategory: 'Dev', roleSeo: 'dev' } },
  { data: { jobTypeID: 'JT1', jobType: 'Permanent', professionID: 'P1', category: 'IT', professionSeo: 'it', roleID: 'R2', subCategory: 'QA', roleSeo: 'qa' } },
  { data: { jobTypeID: 'JT2', jobType: 'Contract', professionID: 'P2', category: 'Finance', professionSeo: 'fin', roleID: 'R3', subCategory: 'Analyst', roleSeo: 'analyst' } },
  { data: { jobTypeID: 'JT1', jobType: 'Permanent', professionID: 'P1', category: 'IT', professionSeo: 'it', roleID: 'R1', subCategory: 'Dev', roleSeo: 'dev' } },
  { data: { jobType: 'Casual' } }, // id-fallback: no jobTypeID
];

function tree(): FacetTree {
  return buildHierarchy(jobs, { levels });
}

describe('toIndex', () => {
  it('falls back id -> value and seo -> id', () => {
    expect(toIndex('Permanent')).toEqual({ value: 'Permanent', id: 'Permanent', seo: undefined, parent: undefined });
    expect(toIndex('IT', 'P1')).toEqual({ value: 'IT', id: 'P1', seo: 'P1', parent: undefined });
    expect(toIndex('IT', 'P1', 'it', 'JT1')).toEqual({ value: 'IT', id: 'P1', seo: 'it', parent: 'JT1' });
  });
});

describe('buildHierarchy — 3-level linkage', () => {
  it('links role -> profession -> jobType (grandparent)', () => {
    const t = tree();
    expect(t.nodeById('roleID', 'R1')?.parent).toBe('P1');
    expect(t.nodeById('professionID', 'P1')?.parent).toBe('JT1');
    expect(t.nodeById('jobTypeID', 'JT1')?.parent).toBeUndefined();
  });

  it('resolves children and roots by level', () => {
    const t = tree();
    expect(t.children('roleID', 'P1').map((n) => n.id).sort()).toEqual(['R1', 'R2']);
    expect(t.children('professionID', 'JT1').map((n) => n.id)).toEqual(['P1']);
    expect(t.roots('jobTypeID').map((n) => n.id).sort()).toEqual(['Casual', 'JT1', 'JT2']);
  });
});

describe('buildHierarchy — id fallback + dedup + counts', () => {
  it('uses value as id when the *ID field is empty', () => {
    const t = tree();
    expect(t.nodeById('jobTypeID', 'Casual')).toMatchObject({ id: 'Casual', value: 'Casual' });
  });

  it('dedupes nodes by id (first-seen)', () => {
    const t = tree();
    expect(t.index.jobTypeID.map((n) => n.id)).toEqual(['JT1', 'JT2', 'Casual']);
    expect(t.index.professionID.map((n) => n.id)).toEqual(['P1', 'P2']);
    expect(t.index.roleID.map((n) => n.id)).toEqual(['R1', 'R2', 'R3']);
  });

  it('counts every occurrence', () => {
    const t = tree();
    expect(t.counts.jobTypeID).toEqual({ JT1: 3, JT2: 1, Casual: 1 });
    expect(t.counts.professionID).toEqual({ P1: 3, P2: 1 });
    expect(t.counts.roleID).toEqual({ R1: 2, R2: 1, R3: 1 });
  });

  it('carries the seo slug when present', () => {
    const t = tree();
    expect(t.nodeById('professionID', 'P1')?.seo).toBe('it');
  });
});

describe('toggleFacet — auto-select ancestors', () => {
  it('selecting a role auto-selects its profession and jobType', () => {
    const t = tree();
    const next = toggleFacet({}, t, 'roleID', 'R1');
    expect(next).toEqual({ roleID: ['R1'], professionID: ['P1'], jobTypeID: ['JT1'] });
  });

  it('is immutable — does not mutate the input state', () => {
    const t = tree();
    const start: FilterState = {};
    toggleFacet(start, t, 'roleID', 'R1');
    expect(start).toEqual({});
  });
});

describe('toggleFacet — cascade remove descendants', () => {
  it('removing a jobType cascades to profession and roles', () => {
    const t = tree();
    const start: FilterState = { jobTypeID: ['JT1'], professionID: ['P1'], roleID: ['R1', 'R2'] };
    const next = toggleFacet(start, t, 'jobTypeID', 'JT1');
    expect(next).toEqual({});
    // input untouched
    expect(start.roleID).toEqual(['R1', 'R2']);
  });

  it('removing a profession keeps unrelated jobType selection', () => {
    const t = tree();
    const start: FilterState = { jobTypeID: ['JT1'], professionID: ['P1'], roleID: ['R1'] };
    const next = toggleFacet(start, t, 'professionID', 'P1');
    expect(next).toEqual({ jobTypeID: ['JT1'] });
  });
});

describe('pruneStale', () => {
  it('drops ids no longer present and unknown fields', () => {
    const t = tree();
    const start: FilterState = { jobTypeID: ['JT1', 'JT9'], roleID: ['R1', 'R99'], bogus: ['x'] };
    expect(pruneStale(start, t)).toEqual({ jobTypeID: ['JT1'], roleID: ['R1'] });
  });
});
