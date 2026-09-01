import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/theme-provider';
import { PageShell, SiteNav, SiteFooter } from '@/components/chrome';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  // Named for the face, not the role. The theme engine binds <body> and
  // headings to --font-body / --font-display, and the theme resolves each
  // through a --font-<role>-loaded hook; globals.css points those hooks and
  // the `font-sans` utility at this one variable. Naming it for the face means
  // three roles can share it without any Tailwind theme key pointing at
  // another, and swapping Inter out later is a one-line change here.
  //
  // (v4 also emits its own `--font-sans` default onto this same <html>, but
  // inside `@layer theme`, and next/font injects this class unlayered —
  // unlayered beats layered regardless of source order, so there is no
  // clobber. Verified in the browser rather than reasoned about.)
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dcyfr.io'),
  title: {
    default: 'DCYFR — The Control Center for AI-Powered Development',
    template: '%s | DCYFR',
  },
  description:
    'The unified portal for the DCYFR product ecosystem. Explore templates, research, agent tools, and infrastructure solutions built for AI-powered development.',
  keywords: [
    'dcyfr',
    'ai development platform',
    'agent framework',
    'developer tools',
    'next.js templates',
    'rag pipeline',
    'code generation',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dcyfr.io',
    siteName: 'DCYFR',
    title: 'DCYFR — The Control Center for AI-Powered Development',
    description: 'Unified portal for the DCYFR product ecosystem.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'DCYFR Portal' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DCYFR',
    description: 'The control center for AI-powered development.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const DcyfrIoLogo = (
  <span className="text-lg font-bold tracking-tight">
    dcyfr<span className="text-accent-600">.io</span>
  </span>
);

const NAV_LINKS = [
  { href: '/#products', label: 'Products' },
  { href: 'https://dcyfr.app', label: 'Templates', external: true },
  { href: 'https://dcyfr.tech', label: 'Research', external: true },
  { href: 'https://dcyfr.codes', label: 'Codes', external: true },
  { href: 'https://github.com/dcyfr', label: 'GitHub', external: true },
];

const FOOTER_COLUMNS = [
  {
    title: 'Products',
    links: [
      { href: 'https://dcyfr.app', label: 'Templates', external: true },
      { href: 'https://dcyfr.tech', label: 'Research', external: true },
      { href: 'https://dcyfr.codes', label: 'Codes', external: true },
      { href: 'https://dcyfr.work', label: 'Work', external: true },
      { href: 'https://dcyfr.build', label: 'Build', external: true },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: 'https://github.com/dcyfr', label: 'GitHub', external: true },
      { href: 'mailto:hello@dcyfr.dev', label: 'Contact' },
    ],
  },
];

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: 'https://dcyfr.ai/terms', label: 'Terms', external: true },
  { href: 'https://dcyfr.ai/security', label: 'Security', external: true },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-identity selects the theme package; the .dark class (added by
    // ThemeProvider) selects the scheme. They are orthogonal by construction —
    // the theme is scoped [data-identity="slate"] / [data-identity="slate"].dark
    // — which is what removes the old two-single-classes-tie-on-specificity
    // clobber described in globals.css. Stamped server-side, so it is present
    // in the first paint rather than after hydration.
    <html
      lang="en"
      suppressHydrationWarning
      data-identity="slate"
      className={`${inter.variable} theme-dcyfr-io`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PageShell
            nav={<SiteNav logo={DcyfrIoLogo} links={NAV_LINKS} />}
            footer={
              <SiteFooter
                brand={{
                  name: 'dcyfr.io',
                  tagline: 'The control center for AI-powered development',
                }}
                columns={FOOTER_COLUMNS}
                legal={LEGAL_LINKS}
                copyright="© 2026 DCYFR. All rights reserved."
              />
            }
            padding="none"
            maxWidth="full"
          >
            {children}
          </PageShell>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
