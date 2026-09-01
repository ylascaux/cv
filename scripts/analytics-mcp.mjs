import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod/v3';

const API_URL = (accountId) => `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`;
const DATASET_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;

export function analyticsConfiguration(environment = process.env) {
  const accountId = environment.CLOUDFLARE_ACCOUNT_ID;
  const token = environment.CLOUDFLARE_ANALYTICS_TOKEN;
  const dataset = environment.CLOUDFLARE_ANALYTICS_DATASET ?? 'cv_traffic_production';

  if (!accountId || !token) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_ANALYTICS_TOKEN must be configured.');
  }
  if (!DATASET_PATTERN.test(dataset)) {
    throw new Error('CLOUDFLARE_ANALYTICS_DATASET is not a valid Analytics Engine dataset name.');
  }

  return { accountId, dataset, token };
}

export function overviewQueries(dataset, days) {
  const timeWindow = `timestamp >= NOW() - INTERVAL '${days}' DAY`;
  return {
    visits: `SELECT blob2 AS audience, SUM(_sample_interval) AS visits FROM ${dataset} WHERE blob1 = 'page_view' AND ${timeWindow} GROUP BY audience ORDER BY visits DESC`,
    engagement: `SELECT SUM(_sample_interval * double1) / 60 AS minutes FROM ${dataset} WHERE blob1 = 'engagement' AND blob2 = 'human' AND ${timeWindow}`,
    downloads: `SELECT blob3 AS locale, blob2 AS audience, SUM(_sample_interval) AS downloads FROM ${dataset} WHERE blob1 = 'download' AND ${timeWindow} GROUP BY locale, audience ORDER BY downloads DESC`,
  };
}

export function timeseriesQuery(dataset, days) {
  return `SELECT toStartOfDay(timestamp) AS day, blob1 AS event, blob2 AS audience, SUM(_sample_interval) AS count, SUM(_sample_interval * double1) AS engagement_seconds FROM ${dataset} WHERE timestamp >= NOW() - INTERVAL '${days}' DAY GROUP BY day, event, audience ORDER BY day, event, audience`;
}

export async function queryAnalytics({ accountId, token }, sql, fetchImpl = fetch) {
  const response = await fetchImpl(API_URL(accountId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain; charset=utf-8',
    },
    body: sql,
  });
  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    const message = payload.errors?.map((error) => error.message).join('; ') ?? response.statusText;
    throw new Error(`Cloudflare Analytics Engine request failed: ${message}`);
  }

  return payload.result?.data ?? payload.data ?? [];
}

function toolResult(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

function toolError(error) {
  return { content: [{ type: 'text', text: error.message }], isError: true };
}

export function createAnalyticsServer(environment = process.env, fetchImpl = fetch) {
  const server = new McpServer({ name: 'cv-cloudflare-analytics', version: '1.0.0' });
  const daySchema = z.number().int().min(1).max(365).default(30);

  server.registerTool(
    'analytics_overview',
    {
      description: 'Returns estimated human, AI, and bot visits, human engagement minutes, and PDF downloads.',
      inputSchema: { days: daySchema.describe('Number of trailing days to include, from 1 to 365. Defaults to 30.') },
      annotations: { readOnlyHint: true },
    },
    async ({ days }) => {
      try {
        const configuration = analyticsConfiguration(environment);
        const queries = overviewQueries(configuration.dataset, days);
        const [visits, engagement, downloads] = await Promise.all(
          Object.values(queries).map((sql) => queryAnalytics(configuration, sql, fetchImpl)),
        );
        return toolResult({ days, visits, engagement, downloads });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'analytics_timeseries',
    {
      description: 'Returns daily counts for page views, downloads, and engagement split by human, AI, and bot.',
      inputSchema: { days: daySchema.describe('Number of trailing days to include, from 1 to 365. Defaults to 30.') },
      annotations: { readOnlyHint: true },
    },
    async ({ days }) => {
      try {
        const configuration = analyticsConfiguration(environment);
        const rows = await queryAnalytics(configuration, timeseriesQuery(configuration.dataset, days), fetchImpl);
        return toolResult({ days, rows });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  return server;
}

async function main() {
  const server = createAnalyticsServer();
  await server.connect(new StdioServerTransport());
}

if (import.meta.main) {
  main().catch((error) => {
    console.error('Analytics MCP server failed:', error);
    process.exitCode = 1;
  });
}
