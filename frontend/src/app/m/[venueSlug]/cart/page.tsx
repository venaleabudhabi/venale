'use client';

import { useLanguageStore, useCartStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import DirhamAmount from '@/components/DirhamAmount';

export default function CartPage({ params }: { params: { venueSlug: string } }) {
  const router = useRouter();
  const { lang } = useLanguageStore();
  const { t, dir } = useTranslation(lang);
  const { items, removeItem, updateQty, getTotalPrice } = useCartStore();

  const subtotal = getTotalPrice();

  return (
    <div dir={dir} className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 py-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="text-gray-600" title="Go back" aria-label="Go back">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{t('yourCart')}</h1>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('emptyCart')}</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.itemKey} className="card">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <div className="mt-1">
                      <DirhamAmount amount={item.price} size="sm" className="text-gray-600" />
                    </div>
                    {item.selectedAddons.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        + {item.selectedAddons.map((a) => a.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => item.qty > 1 && updateQty(item.itemKey, item.qty - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                        aria-label="Decrease quantity"
                        title="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.itemKey, item.qty + 1)}
                        className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center"
                        aria-label="Increase quantity"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.itemKey)}
                      className="text-red-600 hover:text-red-700"
                      title="Remove item from cart"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">{t('subtotal')}</span>
              <DirhamAmount amount={subtotal} size="md" bold />
            </div>
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            onClick={() => router.push(`/m/${params.venueSlug}/checkout`)}
            className="w-full btn-primary"
          >
            {t('continueToCheckout')}
          </button>
        </div>
      )}
    </div>
  );
}
