import assert from 'node:assert/strict';
import test from 'node:test';

import { analyticsConfiguration, overviewQueries, queryAnalytics, timeseriesQuery } from './analytics-mcp.mjs';

test('requires Cloudflare credentials and accepts an Analytics Engine dataset', () => {
  assert.throws(() => analyticsConfiguration({}), /CLOUDFLARE_ACCOUNT_ID/);
  assert.throws(
    () =>
      analyticsConfiguration({
        CLOUDFLARE_ACCOUNT_ID: 'account',
        CLOUDFLARE_ANALYTICS_TOKEN: 'token',
        CLOUDFLARE_ANALYTICS_DATASET: 'invalid-name',
      }),
    /dataset name/,
  );
  assert.deepEqual(
    analyticsConfiguration({
      CLOUDFLARE_ACCOUNT_ID: 'account',
      CLOUDFLARE_ANALYTICS_TOKEN: 'token',
      CLOUDFLARE_ANALYTICS_DATASET: 'cv_traffic_production',
    }),
    { accountId: 'account', dataset: 'cv_traffic_production', token: 'token' },
  );
});

test('builds fixed read-only queries for the requested analytics window', () => {
  const queries = overviewQueries('cv_traffic_production', 30);
  assert.match(queries.visits, /blob1 = 'page_view'/);
  assert.match(queries.engagement, /blob1 = 'engagement'/);
  assert.match(queries.downloads, /blob1 = 'download'/);
  assert.match(timeseriesQuery('cv_traffic_production', 7), /INTERVAL '7' DAY/);
});

test('unwraps Cloudflare SQL API rows and sends a bearer token', async () => {
  const calls = [];
  const rows = await queryAnalytics({ accountId: 'account-id', token: 'secret' }, 'SELECT 1', async (url, options) => {
    calls.push({ options, url });
    return new Response(JSON.stringify({ success: true, result: { data: [{ visits: 12 }] } }), { status: 200 });
  });

  assert.deepEqual(rows, [{ visits: 12 }]);
  assert.equal(calls[0].url, 'https://api.cloudflare.com/client/v4/accounts/account-id/analytics_engine/sql');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer secret');
});
