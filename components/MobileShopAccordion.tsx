'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { campaignsApi, type CampaignFromApi } from '@/lib/api';
import { cn } from '@/lib/utils';

type MobileNavLinkProps = {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

function MobileNavLink({ href, onClick, children, className = '' }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn('flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/5', className)}
    >
      {children}
    </Link>
  );
}

export function MobileShopAccordion({ onLinkClick }: { onLinkClick: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignFromApi[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (expanded && !loaded) {
      campaignsApi.listActive().then(setCampaigns).catch(() => setCampaigns([])).finally(() => setLoaded(true));
    }
  }, [expanded, loaded]);

  return (
    <div className="flex flex-col gap-0">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 w-full text-left"
        aria-expanded={expanded}
      >
        Shop
        <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && (
        <div className="pl-3 pb-2 flex flex-col gap-0 border-l border-primary/10 ml-3 min-w-0 max-w-full">
          <MobileNavLink href="/products" onClick={onLinkClick}>
            Shop all
          </MobileNavLink>
          <MobileNavLink href="/products?category=RESIN" onClick={onLinkClick}>
            Resin Collection
          </MobileNavLink>
          <MobileNavLink href="/products?category=HANDLOOM" onClick={onLinkClick}>
            Woolen Handloom
          </MobileNavLink>
          <MobileNavLink href="/products?featured=true" onClick={onLinkClick}>
            Featured
          </MobileNavLink>
          {campaigns.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/60 mt-2 mb-1 px-3">Current offers</p>
              <div className="flex flex-col min-w-0">
                {campaigns.map((c) => (
                  <MobileNavLink key={c._id} href={`/campaigns/${c.slug}`} onClick={onLinkClick} className="min-w-0 break-words">
                    {c.name}
                  </MobileNavLink>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
