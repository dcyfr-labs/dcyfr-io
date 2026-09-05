import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/chrome/theme-provider';
import { SiteHeader, type HeaderNavItem } from '@/components/chrome/site-header';
import { SiteFooter, type FooterLink } from '@/components/chrome/site-footer';
import type { ChromeNavSection } from '@/components/chrome/nav-utils';
import './globals.css';

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

// The v1 nav list, minus nothing (there was no "/" entry) and minus the
// `external` flag: v2 nav items carry no such flag and every off-site link
// opens in the same tab.
const NAV: HeaderNavItem[] = [
  { href: '/#products', label: 'Products' },
  { href: 'https://dcyfr.app', label: 'Templates' },
  { href: 'https://dcyfr.tech', label: 'Research' },
  { href: 'https://dcyfr.codes', label: 'Codes' },
  { href: 'https://github.com/dcyfr', label: 'GitHub' },
];

// The drawer is the only place every link is reachable below `md`: the header
// link row and the footer link row are both `hidden md:flex`. Ecosystem is the
// v1 footer's "Products" column, renamed for what it actually lists (sibling
// sites, not this site's products); the new Products section carries the
// on-page anchor the header row would otherwise own alone.
//
// No item may carry `icon`. This file is a Server Component and SiteHeader is
// 'use client', so an ElementType cannot cross the boundary.
const SECTIONS: ChromeNavSection[] = [
  {
    id: 'products',
    label: 'Products',
    items: [{ href: '/#products', label: 'All products' }],
  },
  {
    id: 'ecosystem',
    label: 'Ecosystem',
    items: [
      { href: 'https://dcyfr.app', label: 'Templates' },
      { href: 'https://dcyfr.tech', label: 'Research' },
      { href: 'https://dcyfr.codes', label: 'Codes' },
      { href: 'https://dcyfr.work', label: 'Work' },
      { href: 'https://dcyfr.build', label: 'Build' },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    items: [
      { href: 'https://github.com/dcyfr', label: 'GitHub' },
      { href: 'mailto:hello@dcyfr.dev', label: 'Contact' },
    ],
  },
  {
    id: 'legal',
    label: 'Legal',
    items: [
      { href: '/privacy', label: 'Privacy' },
      { href: 'https://dcyfr.ai/terms', label: 'Terms' },
      { href: 'https://dcyfr.ai/security', label: 'Security' },
    ],
  },
];

// Flat, and short by design: the v2 footer link row sits on one line beside the
// copyright. The five sibling sites live in the drawer's Ecosystem section and
// in the `#products` grid on the home page.
const FOOTER: FooterLink[] = [
  { href: 'mailto:hello@dcyfr.dev', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: 'https://dcyfr.ai/terms', label: 'Terms' },
  { href: 'https://dcyfr.ai/security', label: 'Security' },
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
      className={`${GeistSans.variable} ${GeistMono.variable} theme-dcyfr-io`}
    >
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* focus:z-50 clears the fixed header, which is z-40. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
          >
            Skip to content
          </a>
          <SiteHeader
            logo={DcyfrIoLogo}
            logoAriaLabel="dcyfr.io home"
            links={NAV}
            mobileNavSections={SECTIONS}
          />
          {/* pt-18 clears the fixed h-18 header. */}
          <main id="main-content" className="flex-1 pt-18">
            {children}
          </main>
          <SiteFooter brand="DCYFR" links={FOOTER} />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
