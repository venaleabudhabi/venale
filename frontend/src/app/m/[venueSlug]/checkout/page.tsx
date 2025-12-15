'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { menuApi, orderApi, CreateOrderInput } from '@/lib/api';
import { useLanguageStore, useCartStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import DirhamAmount from '@/components/DirhamAmount';
import ApplePayButton from '@/components/ApplePayButton';
import GooglePayButton from '@/components/GooglePayButton';
import { isApplePayAvailable, isGooglePayAvailable } from '@/lib/device';

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
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY'>('COD');
  const [isMember, setIsMember] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [applePayEnabled, setApplePayEnabled] = useState(false);
  const [googlePayEnabled, setGooglePayEnabled] = useState(false);

  useEffect(() => {
    // Detect available payment methods
    setApplePayEnabled(isApplePayAvailable());
    setGooglePayEnabled(isGooglePayAvailable());
  }, []);

  const { data: menuData } = useQuery({
    queryKey: ['menu', lang],
    queryFn: () => menuApi.getMenu(lang).then((res) => res.data),
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderInput) => orderApi.createOrder(data),
    onSuccess: (response) => {
      const orderId = response.data.orderId;
      setCreatedOrderId(orderId);
      
      // For COD, redirect immediately
      if (paymentMethod === 'COD') {
        clearCart();
        toast.success(t('orderPlaced'));
        router.push(`/o/${orderId}`);
      }
      // For wallet payments, buttons will handle the flow
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create order');
    },
  });

  const handleWalletPaymentSuccess = (data: any) => {
    clearCart();
    toast.success('Payment successful!');
    router.push(`/o/${data.order.id}`);
  };

  const handleWalletPaymentError = (error: string) => {
    toast.error(error);
  };

  const formatPhoneNumber = (phoneInput: string): string => {
    // Remove all non-digit characters
    const digits = phoneInput.replace(/\D/g, '');
    
    // Handle different formats:
    // 05XXXXXXXX -> +9715XXXXXXXX
    // 5XXXXXXXX -> +9715XXXXXXXX
    // 9715XXXXXXXX -> +9715XXXXXXXX
    if (digits.startsWith('05')) {
      return '+971' + digits.substring(1);
    } else if (digits.startsWith('5') && digits.length === 9) {
      return '+971' + digits;
    } else if (digits.startsWith('971')) {
      return '+' + digits;
    }
    return phoneInput;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name is required
    if (!name || name.trim().length === 0) {
      toast.error(lang === 'ar' ? 'الرجاء إدخال الاسم' : 'Please enter your name');
      return;
    }

    // Format phone number automatically
    const formattedPhone = formatPhoneNumber(phone);
    
    // Validate formatted phone
    if (!formattedPhone.match(/^\+971[0-9]{9}$/)) {
      toast.error(lang === 'ar' ? 'الرجاء إدخال رقم هاتف صحيح' : 'Please enter a valid UAE phone number');
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
        name: name.trim(),
        phone: formattedPhone,
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
              <label className="block text-sm font-medium mb-2">
                {t('name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                required
              />
            </div>
          </div>
        </div>

        {/* Fulfillment - Always show both options */}
        <div className="card">
          <h2 className="font-bold text-lg mb-4">Fulfillment Type</h2>
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setFulfillmentType('PICKUP')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                fulfillmentType === 'PICKUP' 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>{t('pickup')}</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentType('DELIVERY')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                fulfillmentType === 'DELIVERY' 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <span>{t('delivery')}</span>
              </div>
            </button>
          </div>
          
          {/* Fulfillment info messages */}
          {fulfillmentType === 'PICKUP' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-800">
                  Welcome! Your order will be ready for pickup at our store
                </p>
              </div>
            </div>
          )}
          
          {fulfillmentType === 'DELIVERY' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-800">
                  Your order will be delivered to Revive Gym
                </p>
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
              placeholder="Special instructions..."
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="card">
          <h2 className="font-bold text-lg mb-4">{t('paymentMethod')}</h2>
          
          {/* Device-specific Digital Wallet - Show only if available and before order creation */}
          {!createdOrderId && (applePayEnabled || googlePayEnabled) && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Express Checkout</p>
              {applePayEnabled && (
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('APPLE_PAY'); setShowCardForm(false); }}
                  className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 mb-3 ${
                    paymentMethod === 'APPLE_PAY' ? 'border-black bg-gray-50 ring-2 ring-black' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">Apple Pay</p>
                    <p className="text-xs text-gray-500">Fast & secure payment</p>
                  </div>
                </button>
              )}
              {googlePayEnabled && (
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('GOOGLE_PAY'); setShowCardForm(false); }}
                  className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 ${
                    paymentMethod === 'GOOGLE_PAY' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">Google Pay</p>
                    <p className="text-xs text-gray-500">Fast & secure payment</p>
                  </div>
                </button>
              )}
            </div>
          )}
          
          {/* Standard Payment Methods - Always visible */}
          {!createdOrderId && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-3">{(applePayEnabled || googlePayEnabled) ? 'Other Payment Options' : 'Choose Payment Method'}</p>
              
              {/* Cash on Delivery - Always show */}
              <button
                type="button"
                onClick={() => { setPaymentMethod('COD'); setShowCardForm(false); }}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  paymentMethod === 'COD' ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when you receive</p>
                  </div>
                </div>
              </button>
              
              {/* Card Payment - Always show */}
              <button
                type="button"
                onClick={() => { setPaymentMethod('CARD'); setShowCardForm(true); }}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  paymentMethod === 'CARD' || showCardForm ? 'border-green-600 bg-green-50 ring-2 ring-green-600' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Credit / Debit Card</p>
                    <p className="text-xs text-gray-500">Visa, Mastercard, Amex</p>
                  </div>
                </div>
              </button>
              
              {/* Card Entry Form - Always show when Card is selected */}
              {showCardForm && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="input-field"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="input-field"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="input-field"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Your card details are encrypted and secure
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Show wallet payment buttons after order is created */}
          {createdOrderId && (paymentMethod === 'APPLE_PAY' || paymentMethod === 'GOOGLE_PAY') && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-2">Complete your payment</p>
              {paymentMethod === 'APPLE_PAY' && (
                <ApplePayButton
                  orderId={createdOrderId}
                  amount={total}
                  onSuccess={handleWalletPaymentSuccess}
                  onError={handleWalletPaymentError}
                />
              )}
              {paymentMethod === 'GOOGLE_PAY' && (
                <GooglePayButton
                  orderId={createdOrderId}
                  amount={total}
                  onSuccess={handleWalletPaymentSuccess}
                  onError={handleWalletPaymentError}
                />
              )}
            </div>
          )}
        </div>

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
        {!createdOrderId && (
          <button
            type="submit"
            disabled={createOrderMutation.isPending}
            className="w-full btn-primary"
          >
            {createOrderMutation.isPending 
              ? 'Processing...' 
              : (paymentMethod === 'APPLE_PAY' || paymentMethod === 'GOOGLE_PAY')
                ? 'Continue to Payment'
                : t('placeOrder')
            }
          </button>
        )}
        
        {createdOrderId && (paymentMethod === 'APPLE_PAY' || paymentMethod === 'GOOGLE_PAY') && (
          <div className="text-center text-sm text-gray-600">
            <p>Order created! Complete payment above.</p>
          </div>
        )}
      </form>
    </div>
  );
}
