'use client';

import { MenuCategory } from '@/lib/api';
import Link from 'next/link';

interface CategoryGridProps {
  categories: MenuCategory[];
  venueSlug: string;
  className?: string;
}

export default function CategoryGrid({ categories, venueSlug, className = '' }: CategoryGridProps) {
  const getCategoryEmoji = (key: string): string => {
    const emojiMap: Record<string, string> = {
      protein_shakes: '🥤',
      healthy_bowls: '🥗',
      chia_oats_delights: '🥣',
      smoothies: '🍹',
      wellness_shots: '💉',
      fruits_cup: '🍎',
      fresh_juices: '🧃',
    };
    return emojiMap[key] || '🍽️';
  };

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {categories.map((category) => (
        <Link
          key={category.key}
          href={`/m/${venueSlug}/c/${category.key}`}
          className="card hover:shadow-md transition-all active:scale-95"
        >
          {/* Image/Icon */}
          <div className="aspect-square bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg mb-3 flex items-center justify-center">
            <span className="text-5xl">{getCategoryEmoji(category.key)}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-center text-gray-900 mb-1">{category.name}</h3>

          {/* Count */}
          <p className="text-sm text-gray-500 text-center">
            {category.items.length} {category.items.length === 1 ? 'item' : 'items'}
          </p>
        </Link>
      ))}
    </div>
  );
}
