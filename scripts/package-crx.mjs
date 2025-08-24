#!/usr/bin/env node
// Create a .crx (Chrome extension package) using Chrome's --pack-extension flag.
// Requires Google Chrome / Chromium installed and accessible in PATH.
// For Manifest V3 distribution via Chrome Web Store you usually upload ZIP,
// but .crx is useful for internal distribution / side-load in enterprise.

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const distDir = resolve(root, 'dist');
const outDir = resolve(root, 'packages');
const keyPath = resolve(root, 'extension.pem'); // developer private key (persist for stable ID)

if (!existsSync(distDir)) {
  console.error('[package-crx] dist not found. Run build first.');
  process.exit(1);
}

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

// Detect Chrome executable candidates
const chromeCandidates = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev',
  'google-chrome',
  'google-chrome-stable',
  'chromium-browser',
  'chromium'
];

let chromeBin = null;
for (const c of chromeCandidates) {
  try {
    const cmd = c.includes(' ') ? `"${c}" --version` : `${c} --version`;
    execSync(cmd, { stdio: 'ignore' });
    chromeBin = c;
    break;
  } catch {}
}

if (!chromeBin) {
  console.error('[package-crx] Chrome/Chromium not found in PATH. Install Chrome or adjust script.');
  process.exit(1);
}

// Read version from manifest (prefer) else package.json
let version = '0.0.0';
try {
  const manifest = JSON.parse(readFileSync(resolve(distDir, 'manifest.json'), 'utf-8'));
  version = manifest.version || version;
} catch {
  try {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
    version = pkg.version || version;
  } catch {}
}

const crxBase = `kreo-canvas-${version}`;
const crxOutput = resolve(outDir, `${crxBase}.crx`);
const pubkeyOutput = resolve(outDir, `${crxBase}.pub`);

// Prepare pack command
const packCmdParts = [
  `"${chromeBin}"`,
  `--pack-extension="${distDir}"`,
  existsSync(keyPath) ? `--pack-extension-key="${keyPath}"` : '',
];
const packCmd = packCmdParts.filter(Boolean).join(' ');

console.log('[package-crx] Using Chrome binary:', chromeBin);
if (existsSync(keyPath)) {
  console.log('[package-crx] Reusing existing key for stable extension ID');
} else {
  console.log('[package-crx] No key found, Chrome will generate new extension.pem (ID will change next time unless you keep it)');
}

try {
  execSync(packCmd, { stdio: 'inherit' });
} catch (e) {
  console.error('[package-crx] Chrome pack command failed');
  process.exit(1);
}

// Chrome drops .crx and .pem next to extension source or current working dir.
// Move outputs into packages/ for consistency.
const generatedCrx = resolve(root, `${distDir}.crx`); // Chrome naming pattern if no key
const generatedPem = resolve(root, `${distDir}.pem`);
const altCrx = resolve(root, 'dist.crx'); // fallback patterns

let sourceCrx = null;
if (existsSync(generatedCrx)) sourceCrx = generatedCrx;
else if (existsSync(altCrx)) sourceCrx = altCrx;
else {
  console.error('[package-crx] Could not find generated .crx file');
  process.exit(1);
}

// Clean existing outputs
if (existsSync(crxOutput)) rmSync(crxOutput);

import { copyFileSync } from 'node:fs';
copyFileSync(sourceCrx, crxOutput);
if (existsSync(generatedPem) && !existsSync(keyPath)) {
  // Persist key for future stable ID
  copyFileSync(generatedPem, keyPath);
  console.log('[package-crx] Saved developer key to extension.pem');
}

console.log(`[package-crx] Created ${crxOutput}`);
if (existsSync(pubkeyOutput)) {
  // Some Chrome versions output a .pub; optional
  console.log(`[package-crx] Public key: ${pubkeyOutput}`);
}

console.log('[package-crx] Done. You can distribute the .crx for internal installs (drag into chrome://extensions).');
