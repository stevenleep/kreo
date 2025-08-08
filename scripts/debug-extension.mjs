#!/usr/bin/env node
/**
 * Debug launcher for the extension.
 * Features:
 *  - Builds & loads unpacked extension
 *  - Serves local test page ( /test/test-page.html )
 *  - Attempts to auto-pin the extension in the Chrome toolbar (2-phase launch)
 *  - Basic CLI flags
 *    --url <startUrl>   (default: local test page)
 *    --port <number>    (default: 5175)
 *    --no-pin           Skip auto pin attempt
 *    --headless         Attempt new headless (extensions usually need headful)
 */
import puppeteer from 'puppeteer';
import { resolve, dirname } from 'node:path';
import { existsSync, createReadStream, promises as fsp } from 'node:fs';
import http from 'node:http';
import process from 'node:process';

const ROOT = process.cwd();
const EXT_PATH = resolve(ROOT, 'dist');
const USER_PROFILE_DIR = resolve(ROOT, '.chromium-profile-debug');
const DEFAULT_PORT = 5175;

// ---------- CLI PARSING ----------
function parseArgs(argv) {
  const args = { url: undefined, port: DEFAULT_PORT, pin: true, headless: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url' && argv[i + 1]) { args.url = argv[++i]; continue; }
    if (a === '--port' && argv[i + 1]) { args.port = Number(argv[++i]); continue; }
    if (a === '--no-pin') { args.pin = false; continue; }
    if (a === '--headless') { args.headless = true; continue; }
  }
  return args;
}
const CLI = parseArgs(process.argv);

function startStaticServer(rootDir, port) {
  return new Promise((resolveServer, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = urlPath === '/' ? '/test-page.html' : urlPath;
      const absPath = resolve(rootDir, '.' + filePath);
      if (!absPath.startsWith(rootDir)) { // directory traversal guard
        res.writeHead(403); res.end('Forbidden'); return;
      }
      if (!existsSync(absPath)) {
        res.writeHead(404); res.end('Not Found'); return;
      }
      const ext = absPath.split('.').pop();
      const ctype = {
        html: 'text/html; charset=utf-8',
        js: 'text/javascript; charset=utf-8',
        css: 'text/css; charset=utf-8',
        png: 'image/png',
        svg: 'image/svg+xml'
      }[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', ctype);
      createReadStream(absPath).pipe(res);
    });
    server.listen(port, () => resolveServer({ server, port }));
    server.on('error', reject);
  });
}

async function readManifest() {
  const manifestPath = resolve(EXT_PATH, 'manifest.json');
  const raw = await fsp.readFile(manifestPath, 'utf-8');
  return JSON.parse(raw);
}

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function findInstalledExtensionId(userDataDir, expectedName, expectedVersion) {
  const extRoot = resolve(userDataDir, 'Default', 'Extensions');
  if (!existsSync(extRoot)) return null;
  const candidates = await fsp.readdir(extRoot).catch(() => []);
  for (const id of candidates) {
    const idPath = resolve(extRoot, id);
    const versions = await fsp.readdir(idPath).catch(() => []);
    for (const ver of versions) {
      if (expectedVersion && ver !== expectedVersion) continue; // narrow down
      const manifestPath = resolve(idPath, ver, 'manifest.json');
      if (!existsSync(manifestPath)) continue;
      try {
        const parsed = JSON.parse(await fsp.readFile(manifestPath, 'utf-8'));
        if (parsed.name === expectedName) return { id, version: ver };
      } catch { /* ignore */ }
    }
  }
  return null;
}

async function patchPreferencesPin(userDataDir, extensionId) {
  const prefFile = resolve(userDataDir, 'Default', 'Preferences');
  if (!existsSync(prefFile)) return false;
  try {
    const raw = await fsp.readFile(prefFile, 'utf-8');
    const json = JSON.parse(raw);
    json.extensions = json.extensions || {};
    json.extensions.toolbar = json.extensions.toolbar || {};
    json.extensions.toolbar.pinnedExtensions = json.extensions.toolbar.pinnedExtensions || {};
    json.extensions.toolbar.pinnedExtensions[extensionId] = true;
    await fsp.writeFile(prefFile, JSON.stringify(json, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.warn('[debug-extension] Failed to patch Preferences for pin:', e.message);
    return false;
  }
}

async function launchBrowser({ headless }) {
  return puppeteer.launch({
    headless: headless || false,
    args: [
      `--disable-extensions-except=${EXT_PATH}`,
      `--load-extension=${EXT_PATH}`,
      '--no-first-run',
      '--no-default-browser-check',
    ],
    defaultViewport: null,
    userDataDir: USER_PROFILE_DIR,
  });
}

async function openStartPage(browser, testServer, startUrl) {
  const pages = await browser.pages();
  const page = pages.length ? pages[0] : await browser.newPage();
  const targetUrl = startUrl || (testServer ? `http://localhost:${testServer.port}/test-page.html` : 'about:blank');
  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  } catch (e) {
    console.warn('[debug-extension] Navigation failed, staying on about:blank');
  }
  return { page, targetUrl };
}

async function ensurePinned(manifest) {
  if (!CLI.pin) {
    console.log('[debug-extension] Pin skipped (--no-pin).');
    return;
  }
  console.log('[debug-extension] Attempting to auto-pin extension...');
  let found; let retries = 5;
  while (retries-- > 0 && !found) {
    await wait(600);
    found = await findInstalledExtensionId(USER_PROFILE_DIR, manifest.name, manifest.version);
  }
  if (!found) {
    console.warn('[debug-extension] Could not determine extension id. Pin aborted.');
    return;
  }
  console.log(`[debug-extension] Detected extension id: ${found.id}`);
  console.log('[debug-extension] Closing first browser instance to modify Preferences...');
}

async function main() {
  if (!existsSync(resolve(EXT_PATH, 'manifest.json'))) {
    console.error('[debug-extension] dist/manifest.json not found. Run build first.');
    process.exit(1);
  }
  const manifest = await readManifest();

  // Start local static server serving /test
  let srvInfo;
  try {
    srvInfo = await startStaticServer(resolve(ROOT, 'test'), CLI.port);
    console.log(`[debug-extension] Local test server running at http://localhost:${srvInfo.port}`);
  } catch (err) {
    console.warn('[debug-extension] Failed to start test server:', err);
  }

  // Phase 1: Launch to discover extension id (if pin enabled)
  let browser = await launchBrowser({ headless: CLI.headless });
  await openStartPage(browser, srvInfo, CLI.url);

  let extInfo = null;
  if (CLI.pin) {
    // Try detect id while browser still running
    let retries = 6;
    while (retries-- > 0 && !extInfo) {
      await wait(500);
      extInfo = await findInstalledExtensionId(USER_PROFILE_DIR, manifest.name, manifest.version);
    }
    if (extInfo) {
      console.log(`[debug-extension] Found extension id: ${extInfo.id}`);
      // Close & patch preferences
      await browser.close();
      const patched = await patchPreferencesPin(USER_PROFILE_DIR, extInfo.id);
      if (patched) {
        console.log('[debug-extension] Preferences patched (pin=true). Relaunching...');
        browser = await launchBrowser({ headless: CLI.headless });
        await openStartPage(browser, srvInfo, CLI.url);
      } else {
        console.warn('[debug-extension] Failed to patch preferences, continuing without auto pin.');
        browser = await launchBrowser({ headless: CLI.headless });
        await openStartPage(browser, srvInfo, CLI.url);
      }
    } else {
      console.warn('[debug-extension] Could not determine extension id, skip auto pin.');
    }
  }

  console.log('\n[debug-extension] Chrome launched with extension loaded.');
  console.log('[debug-extension] Start page =>', CLI.url || (srvInfo ? `http://localhost:${srvInfo.port}/test-page.html` : 'about:blank'));
  console.log('[debug-extension] Open DevTools (Cmd+Option+I) to inspect background/content scripts.');
  if (CLI.pin) {
    console.log('[debug-extension] If toolbar icon not pinned automatically, you can pin manually via Chrome toolbar puzzle button.');
  }
  console.log('[debug-extension] Press Ctrl+C to exit.');
}

main().catch(err => {
  console.error('[debug-extension] Failed:', err);
  process.exit(1);
});
