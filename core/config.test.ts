import { describe, it, expect } from 'vitest';
import { readConfig, coerceBool, coerceInt } from './config';

describe('coerceBool', () => {
  it('passes through real booleans', () => {
    expect(coerceBool(true)).toBe(true);
    expect(coerceBool(false)).toBe(false);
  });

  it('coerces truthy strings Duda sends', () => {
    expect(coerceBool('true')).toBe(true);
    expect(coerceBool('TRUE')).toBe(true);
    expect(coerceBool('1')).toBe(true);
    expect(coerceBool('on')).toBe(true);
  });

  it('coerces falsy strings and empty to false', () => {
    expect(coerceBool('false')).toBe(false);
    expect(coerceBool('0')).toBe(false);
    expect(coerceBool('')).toBe(false);
    expect(coerceBool(undefined)).toBe(false);
  });

  it('honours the fallback for unknown input', () => {
    expect(coerceBool(undefined, true)).toBe(true);
    expect(coerceBool('maybe', true)).toBe(true);
  });
});

describe('coerceInt', () => {
  it('parses numeric strings', () => {
    expect(coerceInt('25', 20)).toBe(25);
  });

  it('falls back on empty or NaN', () => {
    expect(coerceInt('', 20)).toBe(20);
    expect(coerceInt('abc', 20)).toBe(20);
    expect(coerceInt(undefined, 20)).toBe(20);
  });
});

describe('readConfig', () => {
  it('returns sensible defaults when config is absent', () => {
    const cfg = readConfig(undefined);
    expect(cfg.pageSize).toBe(20);
    expect(cfg.proximityDiameter).toBe('6371');
    expect(cfg.showJobTypeFilter).toBe(false);
    expect(cfg.useSubFilters).toBe(false);
    expect(cfg.jobCollection).toBe('');
  });

  it('coerces string booleans from Duda', () => {
    const cfg = readConfig({
      config: {
        showJobTypeFilter: 'true',
        showClassificationFilter: 'false',
        useSubFilters: 'true',
        showLocationFilter: 'true',
      },
    });
    expect(cfg.showJobTypeFilter).toBe(true);
    expect(cfg.showClassificationFilter).toBe(false);
    expect(cfg.useSubFilters).toBe(true);
    expect(cfg.showLocationFilter).toBe(true);
  });

  it('reads JobCollection and coerces pageSize + proximity', () => {
    const cfg = readConfig({
      config: {
        JobCollection: 'jobs-abc',
        pageSize: '50',
        proximityDiameter: '12756',
        geocodeApiKey: 'key123',
        applicationPage: '/apply',
        detailsPage: '/job',
      },
    });
    expect(cfg.jobCollection).toBe('jobs-abc');
    expect(cfg.pageSize).toBe(50);
    expect(cfg.proximityDiameter).toBe('12756');
    expect(cfg.geocodeApiKey).toBe('key123');
    expect(cfg.applicationPage).toBe('/apply');
    expect(cfg.detailsPage).toBe('/job');
  });

  it('defaults an unknown proximityDiameter to miles (6371)', () => {
    const cfg = readConfig({ config: { proximityDiameter: 'weird' } });
    expect(cfg.proximityDiameter).toBe('6371');
  });
});
