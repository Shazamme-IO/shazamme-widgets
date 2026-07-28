#!/usr/bin/env node
// Zero-dependency post-build validator for shazamme-widgets bundles.
// Ported from duda-widget/scripts/validate.mjs. Catches the two failure classes
// that ship silently to Duda today:
//   1. JS that won't parse (syntax errors).
//   2. Broken/malformed asset URLs (e.g. a stray `>` -> 403/404 on load).
//
// Usage:  node scripts/validate.mjs [file.js ...]
//         node scripts/validate.mjs            # validates every dist/**/*.js
//
// Exit code 0 = clean (including when dist is empty), 1 = problems found.

import { readFileSync } from 'node:fs';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = join(ROOT, 'dist');

// Duda executes each widget's code inside a function wrapper, so top-level
// `return`/`await` are legal. Compile (not run) with the same shape to catch
// real syntax errors without false-flagging top-level returns.
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

// First-party hosts we control: a broken URL here is a real, blocking bug.
const FIRST_PARTY_RE = /^https?:\/\/[^/]*shazamme\.(io|com)\//i;

// Any http(s) URL up to the first whitespace/quote/backtick/paren.
// NOTE: `>` is intentionally NOT excluded so a malformed `...css>` is captured.
const URL_RE = /https?:\/\/[^\s'"`)]+/g;
const ASSET_RE = /\.(css|js|mjs|json|woff2?|ttf|otf|png|svg|jpe?g|gif|webp|ico)\b/i;

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith('.js')) out.push(full);
  }
  return out;
}

const lineOf = (src, index) => src.slice(0, index).split('\n').length;

const args = process.argv.slice(2);
const files = args.length ? args : walk(DIST_DIR);

if (!files.length) {
  console.log('✓ nothing to validate (dist is empty — core-only phase).');
  process.exit(0);
}

let problems = 0;
const report = (msg) => {
  problems++;
  console.error(msg);
};

for (const file of files) {
  let src;
  try {
    src = readFileSync(file, 'utf8');
  } catch {
    report(`✗ READ    ${file}  (cannot read)`);
    continue;
  }

  // 1) Syntax gate — a file that won't parse must never publish.
  try {
    AsyncFunction(src);
  } catch (e) {
    report(`✗ SYNTAX  ${file}: ${e.message}`);
    continue;
  }

  // 2) Asset URL reachability — dedupe, then HEAD each once.
  const seen = new Set();
  for (const m of src.matchAll(URL_RE)) {
    const url = m[0];
    if (!ASSET_RE.test(url) || seen.has(url)) continue;
    seen.add(url);
    const line = lineOf(src, m.index);
    try {
      let res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (res.status === 405 || res.status === 501) {
        res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' }, redirect: 'follow' });
      }
      if (res.status >= 400) {
        if (FIRST_PARTY_RE.test(url)) {
          report(`✗ URL ${res.status}  ${file}:${line}  ${url}`);
        } else {
          console.warn(`⚠ URL ${res.status}  ${file}:${line}  ${url}  (third-party, non-blocking)`);
        }
      }
    } catch (e) {
      if (FIRST_PARTY_RE.test(url)) {
        report(`✗ URL ERR ${file}:${line}  ${url}  (${e.message})`);
      } else {
        console.warn(`⚠ URL ERR ${file}:${line}  ${url}  (${e.message}; third-party, non-blocking)`);
      }
    }
  }
}

if (problems) {
  console.error(`\n✗ ${problems} problem(s) found — publish blocked.`);
  process.exit(1);
}
console.log(`✓ ${files.length} file(s) validated — all asset URLs reachable, all parse clean.`);
