#!/usr/bin/env node
// esbuild bundler for shazamme-widgets.
//
// For each `widgets/<name>/index.ts`, emit an IIFE bundle to
// `dist/<name>/<version>/widget.js` (+ `widget.min.js`). The IIFE self-registers
// the widget controller as `window.ShazammeWidget["<name>"] = <controller>`, so a
// one-line Duda loader can call it with `{ element, data, $, shazamme }`.
//
// There are no widgets yet (Phase 4/5), so this loop is a no-op-safe scan that
// exits cleanly, logging "no widgets yet".

import { build } from 'esbuild';
import { readFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WIDGETS_DIR = join(ROOT, 'widgets');
const DIST_DIR = join(ROOT, 'dist');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const VERSION = pkg.version;

const banner = [
  `/* shazamme-widgets — ${pkg.name} v${VERSION}`,
  ` * Built ${new Date().toISOString()}. Registers window.ShazammeWidget["<name>"].`,
  ` */`,
].join('\n');

function discoverWidgets() {
  if (!existsSync(WIDGETS_DIR)) return [];
  return readdirSync(WIDGETS_DIR)
    .filter((name) => {
      const entry = join(WIDGETS_DIR, name, 'index.ts');
      return existsSync(entry) && statSync(entry).isFile();
    });
}

// Gather a widget's CSS and self-inject it from the bundle, so a site never has
// to paste CSS into Duda (which broke half-styled on chandler: only the
// multi-select block was pasted, so native fields fell back to Duda's theme).
// styles.desktop.css / styles.mobile.css are wrapped in the Duda breakpoint media
// queries (Duda scopes those per-device; we replicate that in one stylesheet).
function gatherCss(widgetDir) {
  const read = (f) => {
    const p = join(widgetDir, f);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
  };
  let css = read('styles.css');
  const desktop = read('styles.desktop.css');
  const mobile = read('styles.mobile.css');
  if (desktop.trim()) css += `\n@media (min-width: 768px) {\n${desktop}\n}`;
  if (mobile.trim()) css += `\n@media (max-width: 767px) {\n${mobile}\n}`;
  return css;
}

// An IIFE prelude that injects the CSS once (id-deduped), before the controller
// renders. Runs at bundle-eval time (script load), so styles are in place first.
function cssPrelude(name, css) {
  if (!css.trim()) return '';
  const id = `shm-css-${name}`;
  return [
    `(function(){`,
    `  if (typeof document === 'undefined') return;`,
    `  if (document.getElementById(${JSON.stringify(id)})) return;`,
    `  var s = document.createElement('style');`,
    `  s.id = ${JSON.stringify(id)};`,
    `  s.textContent = ${JSON.stringify(css)};`,
    `  (document.head || document.documentElement).appendChild(s);`,
    `})();`,
  ].join('\n');
}

// Wrap the compiled module so its default export becomes the registered controller.
function footer(name) {
  return [
    `(function(){`,
    `  var reg = (typeof module !== 'undefined' && module.exports) || {};`,
    `  var controller = reg.default || reg;`,
    `  if (typeof window !== 'undefined') {`,
    `    window.ShazammeWidget = window.ShazammeWidget || {};`,
    `    window.ShazammeWidget[${JSON.stringify(name)}] = controller;`,
    `  }`,
    `})();`,
  ].join('\n');
}

async function bundleWidget(name) {
  const entry = join(WIDGETS_DIR, name, 'index.ts');
  const outDir = join(DIST_DIR, name, VERSION);
  mkdirSync(outDir, { recursive: true });

  const css = gatherCss(join(WIDGETS_DIR, name));
  const widgetBanner = [banner, cssPrelude(name, css)].filter(Boolean).join('\n');

  const common = {
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    globalName: 'module.exports',
    target: 'es2018',
    banner: { js: widgetBanner },
    footer: { js: footer(name) },
    logLevel: 'info',
  };

  await build({ ...common, outfile: join(outDir, 'widget.js'), minify: false });
  await build({ ...common, outfile: join(outDir, 'widget.min.js'), minify: true });

  console.log(`✓ built ${name} → dist/${name}/${VERSION}/widget.{js,min.js}`);
}

async function main() {
  const widgets = discoverWidgets();
  if (widgets.length === 0) {
    console.log('no widgets yet — nothing to bundle (core-only phase). ✓');
    return;
  }
  for (const name of widgets) {
    await bundleWidget(name);
  }
  console.log(`✓ built ${widgets.length} widget(s) at v${VERSION}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
