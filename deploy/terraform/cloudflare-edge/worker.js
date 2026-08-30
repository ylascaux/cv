const encoder = new TextEncoder();
const EMPTY_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

function toObjectPath(pathname) {
  if (pathname === '/') {
    return '/index.html';
  }

  if (pathname.endsWith('/')) {
    return `${pathname}index.html`;
  }

  const lastSegment = pathname.split('/').at(-1) ?? '';
  if (!lastSegment.includes('.')) {
    return `${pathname}/index.html`;
  }

  return pathname;
}

export function isClientAllowed(request, env) {
  if (env.ACCESS_RESTRICTED !== 'true') {
    return true;
  }

  const clientIp = request.headers.get('CF-Connecting-IP')?.trim();
  const allowedIps = (env.ALLOWED_IPS ?? '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);

  return clientIp !== undefined && allowedIps.includes(clientIp);
}

export function contentTypeForPath(pathname) {
  const objectPath = toObjectPath(pathname);
  const filename = objectPath.split('/').at(-1) ?? '';
  const extensionIndex = filename.lastIndexOf('.');
  const extension = extensionIndex === -1 ? '' : filename.slice(extensionIndex).toLowerCase();

  return CONTENT_TYPES[extension] ?? 'application/octet-stream';
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256(value) {
  return crypto.subtle.digest('SHA-256', encoder.encode(value));
}

async function hmac(key, value) {
  const rawKey = typeof key === 'string' ? encoder.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey('raw', rawKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(value));
}

async function signedOriginRequest(method, pathname, env) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const objectPath = toObjectPath(pathname);
  const canonicalUri = `/${env.S3_BUCKET}${objectPath}`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalHeaders =
    `host:${env.ORIGIN_HOSTNAME}\n` + `x-amz-content-sha256:${EMPTY_SHA256}\n` + `x-amz-date:${amzDate}\n`;

  const canonicalRequest = [method, canonicalUri, '', canonicalHeaders, signedHeaders, EMPTY_SHA256].join('\n');

  const credentialScope = `${dateStamp}/${env.S3_REGION}/s3/aws4_request`;
  const canonicalRequestHash = toHex(await sha256(canonicalRequest));
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, canonicalRequestHash].join('\n');

  const dateKey = await hmac(`AWS4${env.S3_SECRET_KEY}`, dateStamp);
  const regionKey = await hmac(dateKey, env.S3_REGION);
  const serviceKey = await hmac(regionKey, 's3');
  const signingKey = await hmac(serviceKey, 'aws4_request');
  const signature = toHex(await hmac(signingKey, stringToSign));

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${env.S3_ACCESS_KEY}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const originUrl = new URL(`https://${env.ORIGIN_HOSTNAME}`);
  originUrl.pathname = canonicalUri;

  return new Request(originUrl, {
    method,
    headers: {
      Authorization: authorization,
      'x-amz-content-sha256': EMPTY_SHA256,
      'x-amz-date': amzDate,
    },
  });
}

export default {
  async fetch(request, env) {
    if (!isClientAllowed(request, env)) {
      return new Response('Forbidden', {
        status: 403,
        headers: {
          'Cache-Control': 'private, no-store',
        },
      });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: {
          Allow: 'GET, HEAD',
        },
      });
    }

    const incomingUrl = new URL(request.url);
    const originRequest = await signedOriginRequest(request.method, incomingUrl.pathname, env);
    const originResponse = await fetch(originRequest);
    const headers = new Headers(originResponse.headers);
    headers.set('Content-Type', contentTypeForPath(incomingUrl.pathname));

    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers,
    });
  },
};
