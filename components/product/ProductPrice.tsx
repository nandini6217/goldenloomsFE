'use client';

type ProductPriceProps = {
  price: number;
  discountedPrice?: number | null;
  expectedDeliveryTime?: string | null;
  /** Compact for cards, default false for detail */
  compact?: boolean;
  /** Show delivery on same line as price when compact */
  showDelivery?: boolean;
};

export function ProductPrice({
  price,
  discountedPrice,
  expectedDeliveryTime,
  compact = false,
  showDelivery = true,
}: ProductPriceProps) {
  const hasDiscount = discountedPrice != null && discountedPrice > 0 && discountedPrice < price;
  const displayPrice = hasDiscount ? discountedPrice! : price;

  return (
    <div className={compact ? 'space-y-0.5' : 'space-y-1'}>
      <div className={`flex items-baseline gap-2 flex-wrap ${compact ? 'text-sm' : ''}`}>
        <span className={hasDiscount ? 'text-accent font-semibold' : 'text-accent font-medium'}>
          ₹{displayPrice.toLocaleString('en-IN')}
        </span>
        {hasDiscount && (
          <span className="text-primary/60 line-through text-[0.9em]">
            ₹{price.toLocaleString('en-IN')}
          </span>
        )}
      </div>
      {showDelivery && expectedDeliveryTime && (
        <p className={`text-primary/60 ${compact ? 'text-xs' : 'text-sm'}`}>
          Delivery: {expectedDeliveryTime}
        </p>
      )}
    </div>
  );
}
