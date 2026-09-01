import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Canonical host redirect, and the reason it lives here rather than in config.
 *
 * The apex serves a redirect to www, and hstspreload.org reads the HSTS header
 * on the redirect response itself, not on the page it lands on. Two earlier
 * homes for that redirect both fail to attach the header:
 *
 * 1. A Vercel project-level domain redirect runs above the app entirely, so no
 *    code in this repo executes and Vercel emits its platform default for
 *    custom domains: `max-age=63072000`, with no `includeSubDomains` and no
 *    `preload`. That is what every dcyfr apex served before this change, and it
 *    is why none of them were preload-eligible.
 *
 * 2. A `redirects` entry in vercel.json does not inherit the `headers` block.
 *    Measured on a preview deployment of this repo: a 308 produced that way came
 *    back with no Content-Security-Policy and no X-Frame-Options, both of which
 *    were present on a 200 from the same build. Redirects short-circuit ahead of
 *    headers in Vercel's route table.
 *
 * Proxy middleware runs before routing and owns its own response, so it is the
 * only place the redirect and the header can be emitted together.
 *
 * This is inert until the project-level domain redirect for the apex is cleared
 * in Vercel. While that redirect exists it wins, and this code never sees the
 * request.
 */
const APEX = 'dcyfr.io';
const CANONICAL = `www.${APEX}`;

/**
 * Mirrors the `/(.*)` headers block in vercel.json. That block covers rendered
 * responses; this covers the redirect, which never reaches it.
 */
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();

  const probing = request.nextUrl.searchParams.has("__hstsprobe"); // TEMPORARY
  if (host !== APEX && !probing) {
    return NextResponse.next();
  }

  const target = new URL(request.nextUrl.toString());
  target.protocol = 'https:';
  target.host = CANONICAL;
  target.port = '';

  const response = NextResponse.redirect(target, 308);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
