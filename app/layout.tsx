import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import './globals.css';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { CustomerAuthProvider } from '@/components/CustomerAuthProvider';
import { RootJsonLd } from '@/components/seo/RootJsonLd';
import { SITE_URL, BRAND_NAME } from '@/config/constants';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Golden Looms | Resin Jewelry & Handloom Heritage',
    template: '%s | Golden Looms',
  },
  description:
    'Where Resin Elegance Meets Handloom Heritage. Premium handcrafted resin jewelry and woolen handloom products.',
  keywords: [
    'resin jewelry',
    'handloom',
    'handcrafted jewelry',
    'woolen handloom',
    'Golden Looms',
    'artisan jewelry',
  ],
  category: 'E-commerce',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: BRAND_NAME,
    title: 'Golden Looms | Resin Jewelry & Handloom Heritage',
    description:
      'Where Resin Elegance Meets Handloom Heritage. Premium handcrafted resin jewelry and woolen handloom products.',
    images: [
      {
        url: 'https://images.pexels.com/photos/7256261/pexels-photo-7256261.jpeg',
        width: 1200,
        height: 630,
        alt: BRAND_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Golden Looms | Resin Jewelry & Handloom Heritage',
    description:
      'Where Resin Elegance Meets Handloom Heritage. Premium handcrafted resin jewelry and woolen handloom products.',
    images: ['https://images.pexels.com/photos/7256261/pexels-photo-7256261.jpeg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <body className="min-h-screen flex flex-col font-body antialiased">
        <RootJsonLd />
        <CustomerAuthProvider>
          <LayoutWrapper>
            <main className="flex-1">{children}</main>
          </LayoutWrapper>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
