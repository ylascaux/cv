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
    const originUrl = new URL(`http://${env.ORIGIN_HOSTNAME}`);
    originUrl.pathname = toOriginPath(incomingUrl.pathname);
    originUrl.search = incomingUrl.search;

    const originRequest = new Request(originUrl, request);
    return fetch(originRequest);
  },
};
