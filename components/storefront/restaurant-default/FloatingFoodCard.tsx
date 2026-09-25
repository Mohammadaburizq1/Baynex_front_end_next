import Image from 'next/image';
import type { CuisinePreset } from '@/lib/data/cuisine-presets';

interface FloatingFoodCardProps {
  productName: string;
  description: string;
  priceLabel: string;
  imageUrl: string;
  preset: CuisinePreset;
}

export default function FloatingFoodCard({
  productName,
  description,
  priceLabel,
  imageUrl,
  preset,
}: FloatingFoodCardProps) {
  const heading = '#0D102B';
  const body = '#6B6B78';
  const primary = preset.primary;

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 18,
        border: `1px solid ${primary}38`,
        boxShadow: '0 10px 40px rgba(0,0,0,0.13)',
        width: 220,
        padding: 14,
      }}
      className="flex items-center gap-2.5"
    >
      {/* Dish thumbnail */}
      <div className="relative w-[52px] h-[52px] flex-shrink-0 rounded-[12px] overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={productName}
          fill
          sizes="52px"
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          style={{ color: heading, fontWeight: 800, fontSize: 14 }}
          className="font-sans truncate"
        >
          {productName}
        </div>
        <div
          style={{ color: body, fontSize: 11 }}
          className="font-sans truncate"
        >
          {description}
        </div>
        <div
          style={{ color: primary, fontWeight: 900, fontSize: 14 }}
          className="font-sans mt-0.5"
        >
          {priceLabel}
        </div>
      </div>
    </div>
  );
}
