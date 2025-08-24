#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import fs from 'node:fs';

const root = resolve(process.cwd());
const distDir = resolve(root, 'dist');
const outDir = resolve(root, 'packages');
const pkgPath = resolve(root, 'package.json');
const manifestPath = resolve(distDir, 'manifest.json');

if (!existsSync(distDir)) {
  console.error('[package-extension] dist directory not found. Run build first.');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
let version = pkg.version || '0.0.0';
try {
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    version = manifest.version || version;
  }
} catch {
  // ignore manifest parse error
}

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

const zipName = `kreo-canvas-${version}.zip`;
const zipPath = resolve(outDir, zipName);
if (existsSync(zipPath)) {
  rmSync(zipPath);
}

try {
  // Use system zip for simplicity (macOS / Linux). -r recurse, -q quiet
  execSync(`cd "${distDir}" && zip -qr "${zipPath}" .`);
  const size = fs.statSync(zipPath).size;
  console.log(`[package-extension] Created ${zipName} (${(size/1024).toFixed(1)} KB)`);
  console.log(`[package-extension] Output: ${zipPath}`);
} catch (e) {
  console.error('[package-extension] Failed to create zip:', e.message);
  process.exit(1);
}
