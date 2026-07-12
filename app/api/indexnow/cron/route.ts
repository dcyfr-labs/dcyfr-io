import { NextResponse } from 'next/server';
import { PROJECT_HOSTS, submitHost, type SubmitResult } from '@/lib/indexnow';

export const runtime = 'nodejs';

/**
 * Weekly Vercel Cron backstop: submit every mapped host's sitemap to
 * IndexNow, regardless of deployment activity. Catches hosts whose
 * webhook-triggered submission failed or that deployed before the
 * webhook existed.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const results: (SubmitResult | { host: string; error: string })[] = [];
  for (const host of Object.values(PROJECT_HOSTS)) {
    try {
      results.push(await submitHost(host));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ host, error: message });
    }
  }

  return NextResponse.json(results);
}
