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
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WIDGETS_DIR = join(ROOT, 'widgets');
const DIST_DIR = join(ROOT, 'dist');
// Generated esbuild entry files for legacy ports (see wrapLegacy). Kept out of git
// via .gitignore — rebuilt from widgets/<name>/legacy.js on every run.
const GEN_DIR = join(DIST_DIR, '.gen');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const VERSION = pkg.version;

const banner = [
  `/* shazamme-widgets — ${pkg.name} v${VERSION}`,
  ` * Built ${new Date().toISOString()}. Registers window.ShazammeWidget["<name>"].`,
  ` */`,
].join('\n');

// A widget is either NATIVE (widgets/<name>/index.ts, a TS controller) or a
// LEGACY PORT (widgets/<name>/legacy.js, plain browser JS from duda-widget/*.js
// wrapped as-is). index.ts wins if both exist.
function discoverWidgets() {
  if (!existsSync(WIDGETS_DIR)) return [];
  return readdirSync(WIDGETS_DIR)
    .map((name) => {
      const nativeEntry = join(WIDGETS_DIR, name, 'index.ts');
      const legacyEntry = join(WIDGETS_DIR, name, 'legacy.js');
      if (existsSync(nativeEntry) && statSync(nativeEntry).isFile()) {
        return { name, kind: 'native' };
      }
      if (existsSync(legacyEntry) && statSync(legacyEntry).isFile()) {
        return { name, kind: 'legacy' };
      }
      return null;
    })
    .filter(Boolean);
}

// --- Legacy port support -------------------------------------------------------
//
// Legacy widgets bootstrap the SDK one of two ways, and BOTH must be routed
// through the shared window.__shazLoadScript so the SDK load coalesces (see
// core/script-loader.ts):
//
//   1. UX-helper form (e.g. login-dialog): a `this.loadScript = (src) => { ...
//      $.getScript(src, ...) ... }` method whose body wraps $.getScript in a
//      Promise, then a bootstrap `ux.loadScript(SDK).then(...)`. We replace the
//      helper body with `window.__shazLoadScript(src)`; the bootstrap is untouched.
//
//   2. Top-level form (e.g. job-app-sq-sr): NO loadScript helper — it calls
//      `$.getScript('<SDK url>', function(){...})` at top level (job-app ships the
//      404 URL sdk.shazamme.io/shazamme-1.0.3.min.js). We rewrite that single
//      SDK-url $.getScript call into `window.__shazLoadScript('<url>').then(cb)`.
//
// A non-SDK $.getScript (e.g. job-app's country-select plugin load) is left
// verbatim — it is not on the SDK-load path. If NEITHER SDK-load form is found we
// throw, so a widget never ships with an unrouted SDK bootstrap.

// Locates the start of the UX helper assignment; the arrow-function body that
// follows is delimited by a balanced-brace/paren scan (regex can't reliably span
// the nested `$.getScript(url, ()=>res(), ()=>rej())` callbacks).
const LEGACY_HELPER_START_RE = /this\.loadScript\s*=\s*\(([^)]*)\)\s*=>\s*/;

// Rewrites a top-level SDK-url $.getScript(...) into __shazLoadScript(...).then(.
// Only matches a shazamme SDK bundle URL, so plugin getScripts are untouched.
const LEGACY_SDK_GETSCRIPT_RE =
  /\$\.getScript\(\s*(['"])(https?:\/\/[^'"]*shazamme(?:-1\.0\.\d+(?:-test)?)?\.min\.js)\1\s*,/;

// Emitted as the loader arg for the top-level form. The loader ignores the passed
// SDK url and always loads the canonical one — but the ORIGINAL url is often a dead
// variant (job-app ships the 404 sdk.shazamme.io/shazamme-1.0.3.min.js), so we emit
// the canonical url rather than leave a known-404 first-party string in the bundle
// (which the post-build validator correctly blocks on).
const CANONICAL_SDK_URL = 'https://sdk.shazamme.io/js/shazamme-1.0.3.min.js';

// Find the end index (exclusive) of the arrow-function body starting at `start`.
// Handles a block body `{ ... }` and a concise expression body `new Promise(...)`
// by tracking {}, (), and [] depth; the concise body also ends at a depth-0 `;`.
function arrowBodyEnd(src, start) {
  let i = start;
  while (i < src.length && /\s/.test(src[i])) i++;
  const block = src[i] === '{';
  let depth = 0;
  let entered = false;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '{' || c === '(' || c === '[') {
      depth++;
      entered = true;
    } else if (c === '}' || c === ')' || c === ']') {
      depth--;
      if (depth === 0) {
        if (block) return i + 1; // include the closing brace
        // concise body: the expression ends when its own parens close
        return i + 1;
      }
    } else if (!block && entered && depth === 0 && c === ';') {
      return i;
    }
  }
  throw new Error('unterminated loadScript arrow body');
}

function wrapLegacy(name, source) {
  let patched = source;
  let helperPatched = false;
  let bootstrapPatched = false;

  // 1) UX-helper form.
  const startMatch = LEGACY_HELPER_START_RE.exec(patched);
  if (startMatch) {
    const bodyStart = startMatch.index + startMatch[0].length;
    const bodyEnd = arrowBodyEnd(patched, bodyStart);
    const span = patched.slice(startMatch.index, bodyEnd);
    if (!span.includes('$.getScript')) {
      throw new Error(
        `[${name}] found a this.loadScript helper but its body has no $.getScript — refusing to emit unpatched code.`,
      );
    }
    const argName = (startMatch[1] || 'src').trim() || 'src';
    patched =
      patched.slice(0, startMatch.index) +
      `this.loadScript = (${argName}) => window.__shazLoadScript(${argName});` +
      patched.slice(bodyEnd);
    helperPatched = true;
  }

  // 2) Top-level SDK-url $.getScript form.
  if (LEGACY_SDK_GETSCRIPT_RE.test(patched)) {
    patched = patched.replace(
      LEGACY_SDK_GETSCRIPT_RE,
      () => `window.__shazLoadScript(${JSON.stringify(CANONICAL_SDK_URL)}).then(`,
    );
    bootstrapPatched = true;
  }

  if (!helperPatched && !bootstrapPatched) {
    throw new Error(
      `[${name}] no SDK-load path found (no this.loadScript helper and no $.getScript SDK url). Cannot port without routing the SDK load through window.__shazLoadScript.`,
    );
  }

  // Confidence check: no SDK-url $.getScript may survive the transform.
  if (LEGACY_SDK_GETSCRIPT_RE.test(patched)) {
    throw new Error(`[${name}] an SDK-url $.getScript survived patching — aborting.`);
  }

  return { patched, helperPatched, bootstrapPatched };
}

// Write a generated esbuild entry that installs the shared loader, binds the four
// Duda runtime globals as locals, then runs the patched legacy body verbatim. Its
// default export is the controller the build footer registers on
// window.ShazammeWidget[name].
function generateLegacyEntry(name) {
  const legacyPath = join(WIDGETS_DIR, name, 'legacy.js');
  const { patched, helperPatched, bootstrapPatched } = wrapLegacy(
    name,
    readFileSync(legacyPath, 'utf8'),
  );

  mkdirSync(GEN_DIR, { recursive: true });
  const genPath = join(GEN_DIR, `${name}.index.js`);
  const loaderImport = relative(GEN_DIR, join(ROOT, 'core', 'script-loader')).split(sep).join('/');

  const entry = [
    `// GENERATED by build/build.mjs — do not edit. Legacy port of widgets/${name}/legacy.js.`,
    `import { ensureScriptLoader } from ${JSON.stringify(loaderImport)};`,
    ``,
    `export default function legacyController(ctx) {`,
    `  ensureScriptLoader();`,
    `  var data = ctx.data,`,
    `      element = ctx.element,`,
    `      $ = ctx.$ || window.jQuery || window.$,`,
    `      shazamme = ctx.shazamme || window.shazamme;`,
    ``,
    `// --- begin legacy body (verbatim except the loadScript patch) ---`,
    patched,
    `// --- end legacy body ---`,
    `}`,
    ``,
  ].join('\n');

  writeFileSync(genPath, entry, 'utf8');
  console.log(
    `  ↳ legacy port ${name}: helper=${helperPatched ? 'patched' : 'n/a'}, ` +
      `bootstrap=${bootstrapPatched ? 'patched' : 'n/a'}`,
  );
  return genPath;
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

async function bundleWidget(name, kind) {
  const entry =
    kind === 'legacy' ? generateLegacyEntry(name) : join(WIDGETS_DIR, name, 'index.ts');
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
  for (const { name, kind } of widgets) {
    await bundleWidget(name, kind);
  }
  console.log(`✓ built ${widgets.length} widget(s) at v${VERSION}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
