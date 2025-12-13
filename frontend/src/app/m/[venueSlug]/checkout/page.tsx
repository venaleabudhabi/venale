'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { menuApi, orderApi, CreateOrderInput } from '@/lib/api';
import { useLanguageStore, useCartStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import DirhamAmount from '@/components/DirhamAmount';

export default function CheckoutPage({ params }: { params: { venueSlug: string } }) {
  const router = useRouter();
  const { lang } = useLanguageStore();
  const { t, dir } = useTranslation(lang);
  const { items, clearCart, getTotalPrice } = useCartStore();
  
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD');
  const [isMember, setIsMember] = useState(false);

  const { data: menuData } = useQuery({
    queryKey: ['menu', lang],
    queryFn: () => menuApi.getMenu(lang).then((res) => res.data),
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderInput) => orderApi.createOrder(data),
    onSuccess: (response) => {
      clearCart();
      toast.success(t('orderPlaced'));
      router.push(`/o/${response.data.orderId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create order');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.match(/^\+971[0-9]{9}$/)) {
      toast.error('Please enter a valid UAE phone number (+971XXXXXXXXX)');
      return;
    }

    if (fulfillmentType === 'DELIVERY' && !address) {
      toast.error('Please enter delivery address');
      return;
    }

    const orderData: CreateOrderInput = {
      venueSlug: params.venueSlug,
      channel: 'WEB',
      customer: {
        name: name || undefined,
        phone,
      },
      fulfillment: {
        type: fulfillmentType,
        address: fulfillmentType === 'DELIVERY' ? address : undefined,
        notes: notes || undefined,
      },
      payment: {
        method: paymentMethod,
      },
      items: items.map((item) => ({
        itemKey: item.itemKey,
        qty: item.qty,
        selectedAddons: item.selectedAddons.map((addon) => ({
          groupKey: addon.groupKey,
          optionKey: addon.optionKey,
        })),
      })),
      isMember,
    };

    createOrderMutation.mutate(orderData);
  };

  const subtotal = getTotalPrice();
  const discount = isMember ? (subtotal * (menuData?.venue.member_discount_percent || 0)) / 100 : 0;
  const total = subtotal - discount;

  return (
    <div dir={dir} className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{t('checkout')}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Customer Info */}
        <div className="card">
          <h2 className="font-bold text-lg mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('phone')} *</label>
              <input
                type="tel"
                placeholder="+971512345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Fulfillment */}
        {menuData?.venue.delivery_enabled && (
          <div className="card">
            <h2 className="font-bold text-lg mb-4">Fulfillment</h2>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setFulfillmentType('PICKUP')}
                className={`flex-1 py-3 rounded-lg font-medium ${
                  fulfillmentType === 'PICKUP' ? 'bg-primary-600 text-white' : 'bg-gray-100'
                }`}
              >
                {t('pickup')}
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentType('DELIVERY')}
                className={`flex-1 py-3 rounded-lg font-medium ${
                  fulfillmentType === 'DELIVERY' ? 'bg-primary-600 text-white' : 'bg-gray-100'
                }`}
              >
                {t('delivery')}
              </button>
            </div>
            {fulfillmentType === 'DELIVERY' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('address')} *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field"
                    rows={3}
                    required
                  />
                </div>
              </div>
            )}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">{t('notes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="card">
          <h2 className="font-bold text-lg mb-4">{t('paymentMethod')}</h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('COD')}
              className={`w-full p-4 rounded-lg border-2 text-left ${
                paymentMethod === 'COD' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
              }`}
            >
              <span className="font-medium">{t('cod')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              className={`w-full p-4 rounded-lg border-2 text-left ${
                paymentMethod === 'CARD' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
              }`}
            >
              <span className="font-medium">{t('card')}</span>
            </button>
          </div>
        </div>

        {/* Member Discount */}
        {menuData && menuData.venue.member_discount_percent > 0 && (
          <div className="card">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isMember}
                onChange={(e) => setIsMember(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="font-medium">{t('iAmMember')}</span>
            </label>
            {isMember && (
              <p className="text-sm text-primary-700 mt-2">{menuData.venue.member_discount_note}</p>
            )}
          </div>
        )}

        {/* Order Summary */}
        <div className="card">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t('subtotal')}</span>
              <DirhamAmount amount={subtotal} size="sm" />
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary-600">
                <span>{t('memberDiscount')}</span>
                <DirhamAmount amount={-discount} size="sm" className="text-primary-600" />
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>{t('total')}</span>
              <DirhamAmount amount={total} size="lg" bold />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={createOrderMutation.isPending}
          className="w-full btn-primary"
        >
          {createOrderMutation.isPending ? 'Processing...' : t('placeOrder')}
        </button>
      </form>
    </div>
  );
}
