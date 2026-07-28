import { describe, it, expect } from 'vitest';
import { matchKeyword, haversineKm, rangeToKm, withinRange, applyFilters } from './filters';
import type { Job, GeoPoint } from './types';

const LONDON: GeoPoint = { lat: 51.5074, lon: -0.1278 };
const PARIS: GeoPoint = { lat: 48.8566, lon: 2.3522 };

const jobs: Job[] = [
  { jobName: 'Senior React Developer', city: 'London', jobTypeID: 'JT1', professionID: 'P1', latitude: '51.5', longitude: '-0.12' },
  { jobName: 'Data Analyst', city: 'Paris', jobTypeID: 'JT2', professionID: 'P2', latitude: '48.85', longitude: '2.35' },
  { jobName: 'Node Engineer', city: 'Berlin', jobTypeID: 'JT1', professionID: 'P3', latitude: '52.52', longitude: '13.40' },
];

describe('matchKeyword', () => {
  it('matches case-insensitively across default fields', () => {
    expect(matchKeyword(jobs[0], 'react')).toBe(true);
    expect(matchKeyword(jobs[0], 'LONDON')).toBe(true);
    expect(matchKeyword(jobs[0], 'python')).toBe(false);
  });

  it('an empty term matches everything', () => {
    expect(matchKeyword(jobs[0], '   ')).toBe(true);
  });
});

describe('haversineKm', () => {
  it('London to Paris is ~344 km', () => {
    const d = haversineKm(LONDON, PARIS);
    expect(d).toBeGreaterThan(340);
    expect(d).toBeLessThan(348);
  });

  it('distance to self is 0', () => {
    expect(haversineKm(LONDON, LONDON)).toBeCloseTo(0, 5);
  });
});

describe('rangeToKm — unit conversion', () => {
  it('treats the slider as miles when proximityDiameter is 6371', () => {
    expect(rangeToKm(50, '6371')).toBeCloseTo(80.467, 2);
  });

  it('treats the slider as km when proximityDiameter is 12756', () => {
    expect(rangeToKm(50, '12756')).toBe(50);
  });

  it('defaults to miles when unset', () => {
    expect(rangeToKm(10)).toBeCloseTo(16.0934, 3);
  });
});

describe('withinRange', () => {
  it('includes a job with coords inside the radius', () => {
    expect(withinRange(jobs[0], [LONDON], 50)).toBe(true);
  });

  it('excludes a job outside the radius', () => {
    expect(withinRange(jobs[1], [LONDON], 50)).toBe(false);
  });

  it('excludes jobs with no coordinates', () => {
    expect(withinRange({ jobName: 'x' }, [LONDON], 500)).toBe(false);
  });
});

describe('applyFilters', () => {
  it('returns all jobs when state is empty', () => {
    expect(applyFilters(jobs, {})).toHaveLength(3);
  });

  it('filters by keyword', () => {
    const out = applyFilters(jobs, { keyword: ['engineer'] });
    expect(out.map((j) => j.jobName)).toEqual(['Node Engineer']);
  });

  it('OR within a facet field', () => {
    const out = applyFilters(jobs, { jobTypeID: ['JT1'] });
    expect(out.map((j) => j.city).sort()).toEqual(['Berlin', 'London']);
  });

  it('AND across facet fields', () => {
    const out = applyFilters(jobs, { jobTypeID: ['JT1'], professionID: ['P1'] });
    expect(out.map((j) => j.city)).toEqual(['London']);
  });

  it('applies geo radius with miles conversion', () => {
    // 30 miles ~= 48 km around London — only the London job qualifies.
    const out = applyFilters(jobs, { geo: [LONDON] as unknown[], geoRange: [30] }, { proximityDiameter: '6371' });
    expect(out.map((j) => j.city)).toEqual(['London']);
  });
});
