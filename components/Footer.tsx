import Link from 'next/link';
import { FooterSocialLinks } from './FooterSocialLinks';

import { BRAND_NAME } from '@/config/constants';

export function Footer() {
  return (
    <footer className="mt-auto bg-primary text-secondary">
      <div className="container-custom py-12">
        <div className="lg:max-w-5xl lg:mx-auto">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-12 lg:gap-16">
          <div>
            <p className="font-display text-2xl font-semibold text-accent">{BRAND_NAME}</p>
            <p className="mt-2 max-w-sm text-sm opacity-90">
              Where Resin Elegance Meets Handloom Heritage.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <h4 className="mb-3 font-semibold text-accent">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products" className="hover:text-accent">All Products</Link></li>
                <li><Link href="/products?category=RESIN" className="hover:text-accent">Resin Collection</Link></li>
                <li><Link href="/products?category=HANDLOOM" className="hover:text-accent">Handloom Collection</Link></li>
                <li><Link href="/products?category=OTHERS" className="hover:text-accent">Others Collection</Link></li>
                <li><Link href="/campaigns" className="hover:text-accent">Campaigns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-accent">Connect</h4>
              <FooterSocialLinks />
            </div>
          </div>
        </div>
        </div>
        <div className="divider-gold mt-10" />
        <p className="mt-6 text-center text-sm opacity-80">
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
