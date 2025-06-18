import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Next.js Migration Template',
    template: '%s | Next.js Migration Template',
  },
  description: 'A Next.js App Router migration template with best-practice configurations',
  keywords: ['Next.js', 'React', 'TypeScript', 'App Router', 'Migration'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    title: 'Next.js Migration Template',
    description: 'A Next.js App Router migration template with best-practice configurations',
    siteName: 'Next.js Migration Template',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next.js Migration Template',
    description: 'A Next.js App Router migration template with best-practice configurations',
    creator: '@yourusername',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

