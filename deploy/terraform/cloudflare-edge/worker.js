const encoder = new TextEncoder();
const EMPTY_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

function toOriginPath(pathname) {
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
  const canonicalUri = toOriginPath(pathname);
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalHeaders =
    `host:${env.ORIGIN_HOSTNAME}\n` +
    `x-amz-content-sha256:${EMPTY_SHA256}\n` +
    `x-amz-date:${amzDate}\n`;

  const canonicalRequest = [
    method,
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    EMPTY_SHA256,
  ].join('\n');

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
    return fetch(originRequest);
  },
};
