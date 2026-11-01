import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const templates = readdirSync(here)
  .map((w) => join(here, w, 'content.hbs'))
  .filter((f) => existsSync(f));

// Duda's Handlebars context is the config root: {{lead}}, {{#each groups}}. A {{config.lead}} makes
// Duda show "We could not process your handlebars inputs properly" instead of the widget.
describe.each(templates)('%s', (file) => {
  it('uses root keys, never config.<key>', () => {
    expect(readFileSync(file, 'utf8')).not.toMatch(/config\./);
  });
});

it('finds at least one HTML template to check', () => {
  expect(templates.length).toBeGreaterThan(0);
});
