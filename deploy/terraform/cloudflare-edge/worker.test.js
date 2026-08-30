import assert from 'node:assert/strict';
import test from 'node:test';

import { contentTypeForPath, isClientAllowed } from './worker.js';

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

test('allows every client when access restriction is disabled', () => {
  const request = new Request('https://cv.example.test/');

  assert.equal(isClientAllowed(request, { ACCESS_RESTRICTED: 'false', ALLOWED_IPS: '' }), true);
});

test('only allows configured Cloudflare client IPs when access restriction is enabled', () => {
  const allowedRequest = new Request('https://preview.example.test/', {
    headers: { 'CF-Connecting-IP': '203.0.113.10' },
  });
  const deniedRequest = new Request('https://preview.example.test/', {
    headers: { 'CF-Connecting-IP': '203.0.113.11' },
  });
  const env = { ACCESS_RESTRICTED: 'true', ALLOWED_IPS: '203.0.113.10,2001:db8::10' };

  assert.equal(isClientAllowed(allowedRequest, env), true);
  assert.equal(isClientAllowed(deniedRequest, env), false);
  assert.equal(isClientAllowed(new Request('https://preview.example.test/'), env), false);
  assert.equal(isClientAllowed(allowedRequest, { ACCESS_RESTRICTED: 'true', ALLOWED_IPS: '' }), false);
});

test('derives browser-safe content types from public asset paths', () => {
  for (const [path, expected] of cases) {
    assert.equal(contentTypeForPath(path), expected, path);
  }
});
