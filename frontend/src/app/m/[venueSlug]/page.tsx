'use client';

import { useQuery } from '@tanstack/react-query';
import { menuApi } from '@/lib/api';
import { useLanguageStore, useCartStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import Link from 'next/link';

export default function MenuPage({ params }: { params: { venueSlug: string } }) {
  const { lang, setLang } = useLanguageStore();
  const { t, dir } = useTranslation(lang);
  const cartItems = useCartStore((state) => state.getTotalItems());
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['menu', lang],
    queryFn: () => menuApi.getMenu(lang).then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <header className="header-sticky">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                {data?.venue.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">🥗 Healthy & Fresh</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  lang === 'en'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ar')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  lang === 'ar'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                عربي
              </button>
            </div>
          </div>
          
          <input
            type="search"
            placeholder={t('search')}
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Member Discount Banner */}
      {data?.venue.member_discount_percent > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-l-4 border-primary-600 p-4 mx-4 mt-6 rounded-lg">
          <p className="text-sm font-medium text-primary-800">
            ✨ {data.venue.member_discount_note}
          </p>
        </div>
      )}

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="section-title">Menu Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.categories.map((category) => (
            <Link
              key={category.key}
              href={`/m/${params.venueSlug}/c/${category.key}`}
              className="category-card"
            >
              <div className="text-5xl mb-3">🥗</div>
              <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-500 mt-2">{category.items.length} items</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Cart FAB */}
      {cartItems > 0 && (
        <Link
          href={`/m/${params.venueSlug}/cart`}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full px-6 py-4 shadow-lg flex items-center gap-3 hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="font-bold">{t('cart')} ({cartItems})</span>
        </Link>
      )}
    </div>
  );
}
