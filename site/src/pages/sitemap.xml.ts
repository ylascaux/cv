import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('The Astro site URL is required to generate the sitemap.');

  const frenchUrl = new URL('/', site).href;
  const englishUrl = new URL('/en/', site).href;
  const entries = [
    { url: frenchUrl, language: 'fr' },
    { url: englishUrl, language: 'en' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map(
    ({ url, language }) => `  <url>
    <loc>${url}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${frenchUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${englishUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${frenchUrl}" />
    <changefreq>monthly</changefreq>
    <priority>${language === 'fr' ? '1.0' : '0.9'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
