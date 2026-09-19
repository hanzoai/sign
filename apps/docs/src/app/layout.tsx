import type { ComponentProps } from 'react';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { RootProvider } from 'fumadocs-ui/provider/next';
import PlausibleProvider from 'next-plausible';

import './global.css';

// next-plausible 4 takes a script URL instead of a domain. This is the script 3
// rendered for `domain`: Plausible's shared script, told the site by data-domain.
const plausibleScript: ComponentProps<'script'> & { 'data-domain': string } = {
  'data-domain': 'esign.hanzo.ai',
};

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://docs.esign.hanzo.ai'),
  title: {
    template: '%s | Hanzo Sign Docs',
    default: 'Hanzo Sign Docs',
  },
  description:
    'The official documentation for Hanzo Sign, the open-source document signing platform.',
  openGraph: {
    siteName: 'Hanzo Sign Docs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hanzoai',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <PlausibleProvider src="https://plausible.io/js/script.js" scriptProps={plausibleScript}>
          <RootProvider>{children}</RootProvider>
        </PlausibleProvider>
      </body>
    </html>
  );
}
