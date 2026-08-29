import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve(import.meta.dirname, '..');
const baseUrl = 'http://127.0.0.1:4323';
const outputDirectory = resolve(root, 'dist/downloads');
const documents = [
  { path: '/', output: 'yoann-lascaux-cv-fr.pdf' },
  { path: '/en/', output: 'yoann-lascaux-cv-en.pdf' },
];

const astroCli = resolve(root, 'node_modules/astro/bin/astro.mjs');
const server = spawn(process.execPath, [astroCli, 'preview', '--host', '127.0.0.1', '--port', '4323'], {
  cwd: root,
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
const serverExited = new Promise((resolveExit, rejectExit) => {
  server.once('exit', resolveExit);
  server.once('error', rejectExit);
});

let serverOutput = '';
server.stdout.on('data', (data) => (serverOutput += data));
server.stderr.on('data', (data) => (serverOutput += data));

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The preview server is still starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error(`Astro preview did not start.\n${serverOutput}`);
}

try {
  await waitForServer();
  await mkdir(outputDirectory, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    for (const document of documents) {
      const page = await browser.newPage();
      await page.goto(`${baseUrl}${document.path}`, { waitUntil: 'networkidle' });
      await page.emulateMedia({ media: 'print' });
      await page.pdf({
        path: resolve(outputDirectory, document.output),
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        tagged: true,
        outline: true,
      });
      await page.close();
      console.log(`Generated dist/downloads/${document.output}`);
    }
  } finally {
    await browser.close();
  }
} finally {
  if (server.exitCode === null) {
    server.kill('SIGTERM');
    const stopped = await Promise.race([
      serverExited.then(() => true),
      new Promise((resolveTimeout) => setTimeout(() => resolveTimeout(false), 5_000)),
    ]);

    if (!stopped && server.exitCode === null) {
      server.kill('SIGKILL');
      await serverExited;
    }
  }
}
