'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PricePreset = { id: string; label: string; min: number; max?: number };

type ProductFiltersDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: {
    category: string;
    subcategory: string;
    minPrice: string;
    maxPrice: string;
    search: string;
  };
  onApply: (params: {
    category: string;
    subcategory: string;
    minPrice: string;
    maxPrice: string;
    search: string;
  }) => void;
  subcategoryOptions: { value: string; label: string }[];
  pricePresets: PricePreset[];
};

export function ProductFiltersDrawer({
  open,
  onOpenChange,
  current,
  onApply,
  subcategoryOptions,
  pricePresets,
}: ProductFiltersDrawerProps) {
  const [category, setCategory] = useState(current.category);
  const [subcategory, setSubcategory] = useState(current.subcategory);
  const [minPrice, setMinPrice] = useState(current.minPrice);
  const [maxPrice, setMaxPrice] = useState(current.maxPrice);
  const [search, setSearch] = useState(current.search);

  useEffect(() => {
    if (open) {
      setCategory(current.category);
      setSubcategory(current.subcategory);
      setMinPrice(current.minPrice);
      setMaxPrice(current.maxPrice);
      setSearch(current.search);
    }
  }, [open, current.category, current.subcategory, current.minPrice, current.maxPrice, current.search]);

  const handleClearAll = () => {
    setCategory('');
    setSubcategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
  };

  const handleApply = () => {
    onApply({
      category,
      subcategory,
      minPrice,
      maxPrice,
      search,
    });
  };

  const applyPreset = (preset: PricePreset) => {
    setMinPrice(String(preset.min));
    setMaxPrice(preset.max != null ? String(preset.max) : '');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={() => onOpenChange(false)}
        />
        <Dialog.Content
          className={cn(
            'fixed left-0 right-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
          )}
        >
          <div className="flex items-center justify-between border-b border-neutral-200 p-4">
            <Dialog.Title className="font-display text-lg font-semibold text-primary">
              Filters
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full" aria-label="Close">
                ×
              </Button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-primary/70 mb-2">
                Search
              </label>
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-primary/70 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {['', 'RESIN', 'HANDLOOM', 'OTHERS'].map((c) => (
                  <button
                    key={c || 'all'}
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      if (!c) setSubcategory('');
                    }}
                    className={cn(
                      'rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
                      category === c
                        ? 'border-primary bg-primary text-white'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary/40'
                    )}
                  >
                    {c === '' ? 'All' : c === 'RESIN' ? 'Resin' : c === 'HANDLOOM' ? 'Handloom' : 'Others'}
                  </button>
                ))}
              </div>
            </div>
            {(category === 'RESIN' || category === 'HANDLOOM' || category === 'OTHERS') && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-primary/70 mb-2">
                  Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {subcategoryOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSubcategory(subcategory === opt.value ? '' : opt.value)}
                      className={cn(
                        'rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
                        subcategory === opt.value
                          ? 'border-primary bg-primary text-white'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary/40'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-primary/70 mb-2">
                Price
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {pricePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      'rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
                      minPrice === String(preset.min) && (preset.max == null ? !maxPrice : maxPrice === String(preset.max))
                        ? 'border-primary bg-primary text-white'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary/40'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min={0}
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-24 rounded-lg"
                />
                <span className="text-primary/50">–</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-24 rounded-lg"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 border-t border-neutral-200 p-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-full"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
