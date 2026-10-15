import { NextResponse } from 'next/server';

const TLD_SITEMAPS = [
  'https://dcyfr.io/sitemap.xml',
  'https://dcyfr.app/sitemap.xml',
  'https://dcyfr.tech/sitemap.xml',
  'https://dcyfr.codes/sitemap.xml',
  'https://dcyfr.bot/sitemap.xml',
  'https://dcyfr.build/sitemap.xml',
  'https://dcyfr.work/sitemap.xml',
];

export function GET() {
  const lastmod = new Date().toISOString().split('T')[0];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...TLD_SITEMAPS.map(
      (loc) =>
        `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
    ),
    '</sitemapindex>',
  ].join('\n');

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  });
}
