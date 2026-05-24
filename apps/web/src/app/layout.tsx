import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Betless – Saudi League Prediction Platform',
    template: '%s | Betless',
  },
  description:
    'Predict Saudi Pro League match results, earn points, climb leaderboards and unlock achievements. The #1 football prediction platform for Saudi football fans.',
  keywords: [
    'Saudi Pro League', 'football predictions', 'Saudi football', 'Al Hilal', 'Al Nassr',
    'prediction platform', 'football ranking', 'دوري روشن', 'تنبؤات كرة القدم',
  ],
  authors: [{ name: 'Betless', url: 'https://betless.app' }],
  creator: 'Betless',
  publisher: 'Betless',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://betless.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    url: 'https://betless.app',
    siteName: 'Betless',
    title: 'Betless – Saudi League Prediction Platform',
    description: 'Predict Saudi Pro League match results, earn points, climb leaderboards and unlock achievements.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Betless' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Betless',
    description: 'Saudi League Prediction Platform',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#00E676',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#16161F',
              color: '#fff',
              border: '1px solid #1E1E2E',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00E676', secondary: '#000' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#000' } },
          }}
        />
      </body>
    </html>
  );
}
