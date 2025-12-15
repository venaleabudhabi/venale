'use client';

import { useState } from 'react';
import { MenuItem } from '@/lib/api';
import NutritionModal from './NutritionModal';

interface ItemCardProps {
  item: MenuItem;
  currency: string;
  onAddToCart: (item: MenuItem) => void;
  className?: string;
}

export default function ItemCard({ item, currency, onAddToCart, className = '' }: ItemCardProps) {
  const [showNutrition, setShowNutrition] = useState(false);

  return (
    <>
      <div className={`card hover:shadow-md transition-shadow ${className}`}>
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex-shrink-0 overflow-hidden">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">🥤</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{item.name}</h3>
            
            {/* Ingredients */}
            {item.ingredients && item.ingredients.length > 0 && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {item.ingredients.join(', ')}
              </p>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full"
                  >
                    {tag.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            )}

            {/* Price and CTA */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-bold text-primary-600">
                {currency} {item.price}
              </span>
              <button
                onClick={() => onAddToCart(item)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 active:scale-95 transition-all"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Nutrition Info Summary */}
        {item.nutrition && (item.nutrition.calories_kcal || item.nutrition.protein_g) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-xs text-gray-600 flex-1">
                {item.nutrition.calories_kcal && (
                  <div>
                    <span className="font-medium">{item.nutrition.calories_kcal}</span> kcal
                  </div>
                )}
                {item.nutrition.protein_g && (
                  <div>
                    <span className="font-medium">{item.nutrition.protein_g}g</span> protein
                  </div>
                )}
                {item.nutrition.carbs_g && (
                  <div>
                    <span className="font-medium">{item.nutrition.carbs_g}g</span> carbs
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowNutrition(true)}
                className="text-primary-600 hover:text-primary-700 text-xs font-semibold hover:underline transition-colors"
              >
                View Facts →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nutrition Modal */}
      <NutritionModal 
        item={item}
        isOpen={showNutrition}
        onClose={() => setShowNutrition(false)}
      />
    </>
  );
}
