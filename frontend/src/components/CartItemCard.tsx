'use client';

import { CartItem } from '@/lib/store';
import DirhamAmount from '@/components/DirhamAmount';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQty: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
}

export default function CartItemCard({ item, onUpdateQty, onRemove }: CartItemCardProps) {
  const addonTotal = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const itemTotal = (item.price + addonTotal) * item.qty;

  return (
    <div className="card">
      <div className="flex gap-4">
        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
          <div className="mb-2">
            <DirhamAmount amount={item.price} size="sm" className="text-gray-600" />
          </div>

          {/* Addons */}
          {item.selectedAddons.length > 0 && (
            <div className="mb-2">
              {item.selectedAddons.map((addon, idx) => (
                <div key={idx} className="text-xs text-gray-500 flex items-center gap-1">
                  <span>+ {addon.name}</span>
                  {addon.price > 0 && (
                    <span className="inline-flex items-center">
                      (<DirhamAmount amount={addon.price} size="xs" />)
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Total for this item */}
          <DirhamAmount amount={itemTotal} size="sm" bold className="text-primary-600" />
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => item.qty > 1 && onUpdateQty(item.itemKey, item.qty - 1)}
              disabled={item.qty <= 1}
              className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center font-medium text-gray-900">{item.qty}</span>
            <button
              onClick={() => onUpdateQty(item.itemKey, item.qty + 1)}
              className="w-8 h-8 rounded-md bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.itemKey)}
            className="text-red-600 hover:text-red-700 p-1"
            aria-label="Remove item"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
