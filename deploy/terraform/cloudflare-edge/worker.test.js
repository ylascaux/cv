import assert from 'node:assert/strict';
import test from 'node:test';

import { contentTypeForPath } from './worker.js';

const cases = [
  ['/', 'text/html; charset=utf-8'],
  ['/en/', 'text/html; charset=utf-8'],
  ['/_astro/content.AmP9OzKb.css', 'text/css; charset=utf-8'],
  ['/_astro/runtime.js', 'text/javascript; charset=utf-8'],
  ['/favicon.svg', 'image/svg+xml'],
  ['/logos/company.png', 'image/png'],
  ['/fonts/open-sans.woff2', 'font/woff2'],
  ['/downloads/cv.pdf', 'application/pdf'],
  ['/unknown.bin', 'application/octet-stream'],
];

test('derives browser-safe content types from public asset paths', () => {
  for (const [path, expected] of cases) {
    assert.equal(contentTypeForPath(path), expected, path);
  }
});
