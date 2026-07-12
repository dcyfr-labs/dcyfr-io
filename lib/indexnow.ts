/**
 * Shared IndexNow submission logic for the dcyfr-entity receiver.
 *
 * Keys are Vercel project names (assumed = repo names; adjust if a project
 * is named differently). Values are the canonical production hosts whose
 * sitemaps get submitted to api.indexnow.org.
 */
export const PROJECT_HOSTS: Record<string, string> = {
  'dcyfr-labs': 'www.dcyfr.ai',
  'dcyfr-io': 'www.dcyfr.io',
  'dcyfr-tech': 'www.dcyfr.tech',
  'dcyfr-codes': 'www.dcyfr.codes',
  'dcyfr-build': 'www.dcyfr.build',
  'dcyfr-work': 'www.dcyfr.work',
  'dcyfr-app': 'www.dcyfr.app',
  'dcyfr-bot': 'www.dcyfr.bot',
  // 'dcyfr-labs-unified-cms': 'www.dcyfr.ai', // enable after its dcyfr.ai cutover
};

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const URL_LIST_CAP = 10000;

export interface SubmitResult {
  host: string;
  submitted?: number;
  status?: number;
  skipped?: string;
}

/**
 * Submit every sitemap URL for `host` to IndexNow.
 *
 * Gracefully skips (rather than throws) when the shared key is not
 * configured or the host has not yet deployed its /indexnow.txt key route —
 * expected during staged rollout across the dcyfr-* sites.
 */
export async function submitHost(host: string): Promise<SubmitResult> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return { host, skipped: 'INDEXNOW_KEY not configured' };
  }

  // Verify the host serves the key file before submitting on its behalf.
  const keyLocation = `https://${host}/indexnow.txt`;
  const keyRes = await fetch(keyLocation, { redirect: 'manual' });
  if (!keyRes.ok) {
    return { host, skipped: `key file not served (${keyRes.status})` };
  }
  const served = (await keyRes.text()).trim();
  if (served !== key) {
    return { host, skipped: 'key file content mismatch' };
  }

  const sitemapRes = await fetch(`https://${host}/sitemap.xml`);
  if (!sitemapRes.ok) {
    throw new Error(`sitemap fetch failed for ${host}: ${sitemapRes.status}`);
  }
  const xml = await sitemapRes.text();

  // Extract <loc> URLs and normalize each to the canonical host (apex/www).
  const urlList = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)]
    .map((m) => {
      const url = new URL(m[1]);
      url.host = host;
      return url.toString();
    })
    .slice(0, URL_LIST_CAP);

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });
  if (!res.ok && res.status !== 202) {
    const body = await res.text();
    throw new Error(`IndexNow rejected ${host}: ${res.status} ${body}`);
  }

  return { host, submitted: urlList.length, status: res.status };
}
