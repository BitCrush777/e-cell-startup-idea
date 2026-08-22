import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { ToastProvider } from '@/components/ToastProvider';
import { PwaProvider } from '@/components/PwaProvider';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://templink.in'),
  title: 'TempLink — Ephemeral Privacy Platform',
  description: 'Private conversations. Temporary by design. Connect with anyone without phone numbers, accounts, or permanent traces.',
  applicationName: 'TempLink',
  authors: [{ name: 'TempLink Privacy Systems' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TempLink',
  },
  openGraph: {
    type: 'website',
    url: 'https://templink.in',
    title: 'TempLink — Private conversations. Temporary by design.',
    description: 'Disposable 1-on-1 encrypted channels that vaporize on expiration. Zero permanent digital footprint.',
    siteName: 'TempLink',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'TempLink Security Platform',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'TempLink — Private conversations. Temporary by design.',
    description: 'Disposable 1-on-1 encrypted channels with zero permanent server trace.',
    images: ['/icons/icon-512.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#05070B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-background text-on-surface min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container pb-16 md:pb-0">
        <ToastProvider>
          <AuthProvider>
            <PwaProvider>
              <Navbar />
              {children}
              <MobileBottomNav />
            </PwaProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
