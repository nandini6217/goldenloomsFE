'use client';

import { useState, useEffect } from 'react';
import { Instagram, Facebook } from 'lucide-react';

export function FooterSocialLinks() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex gap-4">
        <a href="#" className="text-secondary hover:text-accent inline-block h-5 w-5" aria-label="Instagram" />
        <a href="#" className="text-secondary hover:text-accent inline-block h-5 w-5" aria-label="Facebook" />
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <a href="#" className="text-secondary hover:text-accent" aria-label="Instagram">
        <Instagram className="h-5 w-5" />
      </a>
      <a href="#" className="text-secondary hover:text-accent" aria-label="Facebook">
        <Facebook className="h-5 w-5" />
      </a>
    </div>
  );
}
