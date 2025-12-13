import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  itemKey: string;
  name: string;
  price: number;
  qty: number;
  selectedAddons: {
    groupKey: string;
    optionKey: string;
    name: string;
    price: number;
  }[];
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemKey: string) => void;
  updateQty: (itemKey: string, qty: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.itemKey === item.itemKey);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.itemKey === item.itemKey ? { ...i, qty: i.qty + item.qty } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (itemKey) =>
        set((state) => ({
          items: state.items.filter((i) => i.itemKey !== itemKey),
        })),

      updateQty: (itemKey, qty) =>
        set((state) => ({
          items: state.items.map((i) => (i.itemKey === itemKey ? { ...i, qty } : i)),
        })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => {
          const addonTotal = item.selectedAddons.reduce((a, addon) => a + addon.price, 0);
          return sum + (item.price + addonTotal) * item.qty;
        }, 0);
      },
    }),
    {
      name: 'revive-cart',
    }
  )
);

interface LanguageStore {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'revive-lang',
    }
  )
);
