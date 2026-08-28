#!/usr/bin/env node
// Deploy one built widget bundle to S3 + invalidate CloudFront.
//
//   node scripts/deploy.mjs <name> [--run]
//
// Uploads dist/<name>/<version>/widget.min.js to BOTH:
//   js/widget/<name>/<version>/widget.min.js   (immutable, version-pinned)
//   js/widget/<name>/widget.min.js             (stable pointer the loader stub uses)
// then invalidates /js/widget/<name>/* on the CloudFront distribution.
//
// DEFAULTS TO DRY-RUN. It prints the exact aws commands and does NOT touch AWS
// unless you pass --run.
//
// ⚠ IAM: the `sdk-deployer` profile may currently be scoped to js/plugin/* and
//   js/* only, NOT js/widget/*. A real deploy needs the bucket policy / IAM policy
//   extended to grant s3:PutObject on
//     arn:aws:s3:::shazamme.io-us-east-1-public-file/js/widget/*
//   Until then, --run will 403 on the upload. Keep this in dry-run.
//
// Uses the aws CLI via child_process (no AWS SDK dependency), matching the repo's
// zero-runtime-deps build/validate scripts.

import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = join(ROOT, 'dist');

const BUCKET = 'shazamme.io-us-east-1-public-file';
const PROFILE = 'sdk-deployer';
const REGION = 'us-east-1';
const CF_DISTRIBUTION = 'E1NO6IQHVJQ8NV';
const CONTENT_TYPE = 'application/javascript';
const CACHE_CONTROL = 'public, max-age=300';

function usage(msg) {
  if (msg) console.error(`✗ ${msg}\n`);
  console.error('Usage: node scripts/deploy.mjs <name> [--run]');
  console.error('       (default is --dry-run: prints the aws commands, touches nothing)');
  process.exit(msg ? 1 : 0);
}

const args = process.argv.slice(2);
const run = args.includes('--run');
const name = args.find((a) => !a.startsWith('--'));

if (!name) usage('missing widget <name>');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const VERSION = pkg.version;

const localBundle = join(DIST_DIR, name, VERSION, 'widget.min.js');
if (!existsSync(localBundle)) {
  usage(`built bundle not found: dist/${name}/${VERSION}/widget.min.js — run "npm run build" first`);
}

const immutableKey = `js/widget/${name}/${VERSION}/widget.min.js`;
const stableKey = `js/widget/${name}/widget.min.js`;

// Each entry is an argv array so we can print it exactly and run it safely
// (execFileSync — no shell interpolation).
const commands = [
  [
    'aws', 's3', 'cp', localBundle, `s3://${BUCKET}/${immutableKey}`,
    '--content-type', CONTENT_TYPE,
    '--cache-control', CACHE_CONTROL,
    '--profile', PROFILE, '--region', REGION,
  ],
  [
    'aws', 's3', 'cp', localBundle, `s3://${BUCKET}/${stableKey}`,
    '--content-type', CONTENT_TYPE,
    '--cache-control', CACHE_CONTROL,
    '--profile', PROFILE, '--region', REGION,
  ],
  [
    'aws', 'cloudfront', 'create-invalidation',
    '--distribution-id', CF_DISTRIBUTION,
    '--paths', `/js/widget/${name}/*`,
    '--profile', PROFILE, '--region', REGION,
  ],
];

// Quote an argv for human-readable printing only (not used for execution).
const printable = (argv) =>
  argv.map((a) => (/[\s'"$]/.test(a) ? JSON.stringify(a) : a)).join(' ');

console.log(`Deploy ${name} v${VERSION}  (${run ? 'LIVE --run' : 'DRY RUN'})`);
console.log(`  bundle: ${localBundle}`);
console.log(`  → s3://${BUCKET}/${immutableKey}`);
console.log(`  → s3://${BUCKET}/${stableKey}`);
console.log(`  → CloudFront invalidate /js/widget/${name}/*\n`);

for (const argv of commands) {
  console.log(`  ${printable(argv)}`);
}

if (!run) {
  console.log('\n(dry run — nothing executed. Re-run with --run to deploy.)');
  console.log(
    'NOTE: a real deploy needs the sdk-deployer IAM policy extended to\n' +
      `      arn:aws:s3:::${BUCKET}/js/widget/*  (currently likely js/plugin/* + js/* only).`,
  );
  process.exit(0);
}

for (const [cmd, ...rest] of commands) {
  console.log(`\n$ ${printable([cmd, ...rest])}`);
  execFileSync(cmd, rest, { stdio: 'inherit' });
}
console.log(`\n✓ deployed ${name} v${VERSION}.`);
