import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { UnifiedSearch } from '@/components/UnifiedSearch';
import { BlogCarousel } from '@/components/BlogCarousel';
import { DcyfrButton } from '@/components/ui/dcyfr-button';
import { DcyfrBadge } from '@/components/ui/dcyfr-badge';
import { PRODUCTS, TIER_ORDER, TIER_LABELS } from '@/lib/products';
import type { RssFeedItem } from '@/lib/types';

// ISR: revalidate blog feed every hour
export const revalidate = 3600;

async function fetchBlogFeed(): Promise<RssFeedItem[]> {
  try {
    const res = await fetch('https://dcyfr.tech/rss.xml', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: RssFeedItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let itemMatch: RegExpExecArray | null;
    while ((itemMatch = itemRegex.exec(xml)) !== null) {
      const content = itemMatch[1];
      const get = (tag: string) =>
        new RegExp(String.raw`<${tag}>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/${tag}>`).exec(content)?.[1]?.trim() ?? '';
      items.push({
        title: get('title'),
        link: get('link'),
        description: get('description'),
        pubDate: get('pubDate'),
        category: get('category'),
      });
    }
    return items.slice(0, 3);
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'DCYFR — The Control Center for AI-Powered Development',
};

// Schema.org Organization markup (task 5.5)
function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'DCYFR',
          url: 'https://dcyfr.io',
          logo: 'https://dcyfr.io/logo.png',
          description:
            'DCYFR builds AI-powered development frameworks, tools, and infrastructure for modern software teams.',
          sameAs: [
            'https://github.com/dcyfr',
            'https://dcyfr.app',
            'https://dcyfr.tech',
            'https://dcyfr.codes',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'hello@dcyfr.dev',
            contactType: 'customer support',
          },
        }),
      }}
    />
  );
}

export default async function HomePage() {
  const blogItems = await fetchBlogFeed();

  // Group products by tier in defined order
  const byTier = TIER_ORDER.reduce<Record<string, typeof PRODUCTS>>((acc, tier) => {
    const products = PRODUCTS.filter((p) => p.tier === tier);
    if (products.length > 0) acc[tier] = products;
    return acc;
  }, {});

  return (
    <>
      <OrganizationJsonLd />
      <div>
        {/* Hero */}
        <section
          className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-card/60 px-4 py-20 sm:px-6 lg:px-8"
          aria-labelledby="hero-heading"
        >
          {/* Background grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            aria-hidden="true"
            style={{
              backgroundImage:
                'linear-gradient(to right, hsl(222,47%,50%) 1px, transparent 1px), linear-gradient(to bottom, hsl(222,47%,50%) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative mx-auto max-w-4xl text-center">
            <DcyfrBadge
              variant="secure"
              size="md"
              className="mb-4 rounded-full border-secure/20 bg-secure/10 text-secure"
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-secure animate-pulse"
                aria-hidden="true"
              />
              Phase 3 — In Progress
            </DcyfrBadge>
            <h1
              id="hero-heading"
              className="mb-5 text-5xl font-bold tracking-tight text-foreground sm:text-6xl"
            >
              The control center for{' '}
              <span className="text-secure">AI-powered</span> development
            </h1>
            <p className="mb-8 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              DCYFR builds the frameworks, templates, agents, and infrastructure
              you need to ship AI-powered applications faster.
            </p>

            {/* Primary CTAs — @dcyfr-labs/dcyfr-button */}
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <DcyfrButton asChild variant="brand" size="lg">
                <Link href="https://dcyfr.app">Browse Templates</Link>
              </DcyfrButton>
              <DcyfrButton asChild variant="ghostly" size="lg">
                <Link href="#products">Explore Products</Link>
              </DcyfrButton>
            </div>

            {/* Unified search */}
            <UnifiedSearch />
          </div>
        </section>

        {/* Stats */}
        <div className="border-b border-border/40 bg-card/40">
          <div className="mx-auto flex max-w-7xl flex-wrap divide-x divide-border/60 px-4 sm:px-6 lg:px-8">
            {[
              { value: '26+', label: 'Packages' },
              { value: '8', label: 'Starter Templates' },
              { value: '32', label: 'Workspace Agents' },
              { value: '7', label: 'TLDs' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex-1 min-w-[120px] px-6 py-4 text-center"
              >
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <DcyfrBadge
                  variant="info"
                  size="sm"
                  className="mt-1 border-0 bg-transparent text-muted-foreground"
                >
                  {label}
                </DcyfrBadge>
              </div>
            ))}
          </div>
        </div>

        {/* Product sections */}
        <div id="products" className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-14">
            {Object.entries(byTier).map(([tier, products]) => (
              <section key={tier} aria-labelledby={`section-${tier}`}>
                <h2
                  id={`section-${tier}`}
                  className="mb-6 text-xs font-semibold uppercase tracking-widest text-secure"
                >
                  {TIER_LABELS[tier as keyof typeof TIER_LABELS]}
                </h2>
                <div
                  className={
                    products.length === 1
                      ? 'max-w-md'
                      : 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
                  }
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Blog carousel — ISR from dcyfr.tech RSS */}
        <BlogCarousel items={blogItems} />
      </div>
    </>
  );
}
