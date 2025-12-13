'use client';

import { useCartStore } from '@/lib/store';
import Link from 'next/link';

interface CartButtonProps {
  venueSlug: string;
  label?: string;
}

export default function CartButton({ venueSlug, label }: CartButtonProps) {
  const totalItems = useCartStore((state) => state.getTotalItems());

  if (totalItems === 0) return null;

  return (
    <Link
      href={`/m/${venueSlug}/cart`}
      className="fixed bottom-6 right-6 z-50 bg-primary-600 text-white rounded-full px-6 py-4 shadow-lg flex items-center gap-3 hover:bg-primary-700 active:scale-95 transition-all"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <div className="flex flex-col">
        <span className="text-xs opacity-90">{label || 'Cart'}</span>
        <span className="font-bold">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
      </div>
    </Link>
  );
}
