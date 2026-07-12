import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { PROJECT_HOSTS, submitHost } from '@/lib/indexnow';

export const runtime = 'nodejs';

interface VercelWebhookEvent {
  type?: string;
  payload?: {
    target?: string;
    deployment?: { name?: string; target?: string };
    project?: { name?: string };
  };
}

/**
 * Vercel team webhook receiver: on `deployment.succeeded` for a production
 * deployment of a mapped dcyfr-* project, submit that host's sitemap to
 * IndexNow. Signature is HMAC-SHA1 of the raw body keyed with
 * INDEXNOW_WEBHOOK_SECRET (Vercel's webhook signing scheme).
 */
export async function POST(request: Request) {
  const secret = process.env.INDEXNOW_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Signature is computed over the raw bytes — read text before parsing.
  const rawBody = await request.text();
  const signature = request.headers.get('x-vercel-signature') ?? '';
  const expected = createHmac('sha1', secret).update(rawBody).digest('hex');
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (
    signatureBuf.length !== expectedBuf.length ||
    !timingSafeEqual(signatureBuf, expectedBuf)
  ) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let event: VercelWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  // Be defensive about payload shape across Vercel webhook versions.
  const payload = event?.payload;
  const target = payload?.target ?? payload?.deployment?.target;
  const project = payload?.deployment?.name ?? payload?.project?.name;

  if (event?.type !== 'deployment.succeeded' || target !== 'production') {
    return NextResponse.json({ ignored: true });
  }

  const host = project ? PROJECT_HOSTS[project] : undefined;
  if (!host) {
    return NextResponse.json({
      ignored: true,
      reason: 'unmapped project',
      project,
    });
  }

  try {
    const result = await submitHost(host);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ host, error: message }, { status: 500 });
  }
}
