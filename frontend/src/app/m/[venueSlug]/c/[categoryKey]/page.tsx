'use client';

import { useQuery } from '@tanstack/react-query';
import { menuApi, MenuItem } from '@/lib/api';
import { useLanguageStore, useCartStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NutritionModal from '@/components/NutritionModal';
import DirhamAmount from '@/components/DirhamAmount';

export default function CategoryPage({ params }: { params: { venueSlug: string; categoryKey: string } }) {
  const router = useRouter();
  const { lang } = useLanguageStore();
  const { t, dir } = useTranslation(lang);
  const addToCart = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.getTotalItems());
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedNutrition, setSelectedNutrition] = useState<MenuItem | null>(null);

  const { data } = useQuery({
    queryKey: ['menu', lang],
    queryFn: () => menuApi.getMenu(lang).then((res) => res.data),
  });

  const category = data?.categories.find((c) => c.key === params.categoryKey);
  const items = selectedFilter
    ? category?.items.filter((item) => item.tags.includes(selectedFilter))
    : category?.items;

  const allTags = Array.from(new Set(category?.items.flatMap((i) => i.tags) || []));

  const handleAddToCart = (item: any) => {
    addToCart({
      itemKey: item.key,
      name: item.name,
      price: item.price,
      qty: 1,
      selectedAddons: [],
    });
    // Don't redirect - let user continue browsing
    // Cart FAB will show updated count
  };

  return (
    <>
      <div dir={dir} className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 py-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="text-gray-600" aria-label="Go back">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{category?.name}</h1>
        </div>
      </header>

      {/* Filters */}
      {allTags.length > 0 && (
        <div className="bg-white px-4 py-3 overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                !selectedFilter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedFilter(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedFilter === tag ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tag.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {items?.map((item) => (
          <div key={item.key} className="card">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-3xl">🥤</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                {item.ingredients && item.ingredients.length > 0 && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1 mb-2">
                    {item.ingredients.join(', ')}
                  </p>
                )}
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
                <div className="flex items-center justify-between mt-3">
                  <DirhamAmount amount={item.price} size="lg" bold className="text-primary-600" />
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 active:scale-95 transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            {/* Nutrition Summary */}
            {item.nutrition && (item.nutrition.calories_kcal || item.nutrition.protein_g) && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-4 text-gray-600 flex-1">
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
                    onClick={() => setSelectedNutrition(item)}
                    className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors"
                  >
                    View Facts →
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cart FAB */}
      {cartItems > 0 && (
        <Link
          href={`/m/${params.venueSlug}/cart`}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full px-6 py-4 shadow-lg flex items-center gap-3 hover:shadow-xl hover:scale-105 transition-all duration-200 z-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="font-bold">{t('cart')} ({cartItems})</span>
        </Link>
      )}

      {/* Nutrition Modal */}
      <NutritionModal
        item={selectedNutrition}
        isOpen={!!selectedNutrition}
        onClose={() => setSelectedNutrition(null)}
      />
      </div>
    </>
  );
}
