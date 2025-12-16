'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import axios from 'axios';
import { useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import DirhamAmount from '@/components/DirhamAmount';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
});

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED';

interface Order {
  _id: string;
  orderNumber: string;
  currentStatus: OrderStatus;
  customer: {
    name?: string;
    phone: string;
  };
  fulfillment: {
    type: 'PICKUP' | 'DELIVERY';
    address?: string;
    notes?: string;
  };
  items: {
    itemKey: string;
    name_en: string;
    name_ar: string;
    price: number;
    qty: number;
    selectedAddons: any[];
  }[];
  totals: {
    subtotal: number;
    vat: number;
    discount: number;
    deliveryFee: number;
    total: number;
  };
  payment: {
    method: 'COD' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY';
    status: string;
    cardLast4?: string;
    cardBrand?: string;
  };
  createdAt: string;
  statusTimeline: {
    status: OrderStatus;
    at: string;
  }[];
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<OrderStatus, { en: string; ar: string }> = {
  PENDING: { en: 'Pending', ar: 'قيد الانتظار' },
  CONFIRMED: { en: 'Confirmed', ar: 'مؤكد' },
  PREPARING: { en: 'Preparing', ar: 'قيد التحضير' },
  READY: { en: 'Ready', ar: 'جاهز' },
  OUT_FOR_DELIVERY: { en: 'Out for Delivery', ar: 'في التوصيل' },
  COMPLETED: { en: 'Completed', ar: 'مكتمل' },
  CANCELLED: { en: 'Cancelled', ar: 'ملغي' },
};

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'COMPLETED',
  OUT_FOR_DELIVERY: 'COMPLETED',
  COMPLETED: null,
  CANCELLED: null,
};

export default function StaffOrdersPage() {
  const { lang, setLang } = useLanguageStore();
  const { t, dir } = useTranslation(lang);
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // PWA Install Prompt
  useState(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  });

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['staff-orders'],
    queryFn: async () => {
      const res = await api.get('/orders/staff/list');
      return res.data as Order[];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      await api.patch(`/orders/staff/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-orders'] });
      setSelectedOrder(null);
    },
  });

  const filteredOrders = orders?.filter(
    (order) => filterStatus === 'ALL' || order.currentStatus === filterStatus
  );

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من تحديث الحالة؟' : 'Are you sure you want to update the status?')) {
      updateStatusMutation.mutate({ orderId, status });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      {/* Install Banner */}
      {showInstallBanner && (
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-sm">Install REVIVE Staff App</p>
                <p className="text-xs opacity-90">Quick access to order management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-4 py-2 bg-white text-orange-600 rounded-lg font-medium text-sm hover:bg-orange-50 transition-colors"
              >
                Install
              </button>
              <button
                type="button"
                onClick={() => setShowInstallBanner(false)}
                className="p-2 hover:bg-orange-500 rounded-lg transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {lang === 'ar' ? 'طلبات الموظفين' : 'Staff Orders'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {lang === 'ar' ? `${filteredOrders?.length || 0} طلب` : `${filteredOrders?.length || 0} orders`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  lang === 'en' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ar')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  lang === 'ar' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                عربي
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                filterStatus === 'ALL' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {lang === 'ar' ? 'الكل' : 'All'}
            </button>
            {(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'] as OrderStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  filterStatus === status ? 'bg-primary-600 text-white' : statusColors[status]
                }`}
              >
                {lang === 'ar' ? statusLabels[status].ar : statusLabels[status].en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredOrders && filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{lang === 'ar' ? 'لا توجد طلبات' : 'No orders found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders?.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="p-4">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-gray-900">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.currentStatus]}`}>
                      {lang === 'ar' ? statusLabels[order.currentStatus].ar : statusLabels[order.currentStatus].en}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-3 pb-3 border-b">
                    <p className="text-sm font-medium text-gray-700">
                      {order.customer.name || (lang === 'ar' ? 'عميل' : 'Customer')}
                    </p>
                    <p className="text-sm text-gray-600">{order.customer.phone}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.fulfillment.type === 'PICKUP' 
                        ? (lang === 'ar' ? '🏪 استلام' : '🏪 Pickup')
                        : (lang === 'ar' ? '🚗 توصيل' : '🚗 Delivery')}
                    </p>
                  </div>

                  {/* Items Summary */}
                  <div className="mb-3">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <p key={idx} className="text-sm text-gray-700">
                        {item.qty}x {lang === 'ar' ? item.name_ar : item.name_en}
                      </p>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {lang === 'ar' 
                          ? `+${order.items.length - 2} عناصر أخرى` 
                          : `+${order.items.length - 2} more items`}
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <DirhamAmount
                      amount={order.totals.total}
                      size="lg"
                      bold
                      className="text-primary-600"
                    />
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.payment.method === 'COD' 
                        ? 'bg-orange-100 text-orange-800' 
                        : order.payment.method === 'APPLE_PAY'
                        ? 'bg-gray-900 text-white'
                        : order.payment.method === 'GOOGLE_PAY'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {order.payment.method === 'COD' 
                        ? (lang === 'ar' ? 'نقدي عند الاستلام' : 'Cash on Delivery')
                        : order.payment.method === 'APPLE_PAY'
                        ? ' Pay'
                        : order.payment.method === 'GOOGLE_PAY'
                        ? 'G Pay'
                        : order.payment.cardLast4
                        ? `${order.payment.cardBrand || 'Card'} •••• ${order.payment.cardLast4}`
                        : (lang === 'ar' ? 'بطاقة' : 'Card')
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {lang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'} #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Status */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">{lang === 'ar' ? 'الحالة' : 'Status'}</p>
                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${statusColors[selectedOrder.currentStatus]}`}>
                  {lang === 'ar' ? statusLabels[selectedOrder.currentStatus].ar : statusLabels[selectedOrder.currentStatus].en}
                </span>
              </div>

              {/* Customer Details */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{lang === 'ar' ? 'معلومات العميل' : 'Customer Information'}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm"><strong>{lang === 'ar' ? 'الاسم:' : 'Name:'}</strong> {selectedOrder.customer.name || '-'}</p>
                  <p className="text-sm"><strong>{lang === 'ar' ? 'الهاتف:' : 'Phone:'}</strong> {selectedOrder.customer.phone}</p>
                  <p className="text-sm"><strong>{lang === 'ar' ? 'النوع:' : 'Type:'}</strong> {
                    selectedOrder.fulfillment.type === 'PICKUP' 
                      ? (lang === 'ar' ? 'استلام' : 'Pickup')
                      : (lang === 'ar' ? 'توصيل' : 'Delivery')
                  }</p>
                  {selectedOrder.fulfillment.address && (
                    <p className="text-sm"><strong>{lang === 'ar' ? 'العنوان:' : 'Address:'}</strong> {selectedOrder.fulfillment.address}</p>
                  )}
                  {selectedOrder.fulfillment.notes && (
                    <p className="text-sm"><strong>{lang === 'ar' ? 'ملاحظات:' : 'Notes:'}</strong> {selectedOrder.fulfillment.notes}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{lang === 'ar' ? 'العناصر' : 'Items'}</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.qty}x {lang === 'ar' ? item.name_ar : item.name_en}
                      </span>
                      <DirhamAmount amount={item.price * item.qty} size="sm" className="font-medium" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{lang === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                    <DirhamAmount amount={selectedOrder.totals.subtotal} size="sm" />
                  </div>
                  {selectedOrder.totals.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{lang === 'ar' ? 'الخصم:' : 'Discount:'}</span>
                      <DirhamAmount amount={-selectedOrder.totals.discount} size="sm" className="text-green-600" />
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>{lang === 'ar' ? 'ضريبة القيمة المضافة:' : 'VAT:'}</span>
                    <DirhamAmount amount={selectedOrder.totals.vat} size="sm" />
                  </div>
                  {selectedOrder.totals.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>{lang === 'ar' ? 'رسوم التوصيل:' : 'Delivery Fee:'}</span>
                      <DirhamAmount amount={selectedOrder.totals.deliveryFee} size="sm" />
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>{lang === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                    <DirhamAmount amount={selectedOrder.totals.total} size="lg" bold className="text-primary-600" />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.payment.method === 'COD' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{lang === 'ar' ? 'نقدي عند الاستلام' : 'Cash on Delivery'}</p>
                        <p className="text-xs text-gray-500">{lang === 'ar' ? 'يُدفع عند الاستلام' : 'Pay when receiving order'}</p>
                      </div>
                    </div>
                  ) : selectedOrder.payment.method === 'APPLE_PAY' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm"> Pay</p>
                        <p className="text-xs text-green-600">{lang === 'ar' ? '✓ مدفوع' : '✓ Paid'}</p>
                      </div>
                    </div>
                  ) : selectedOrder.payment.method === 'GOOGLE_PAY' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Google Pay</p>
                        <p className="text-xs text-green-600">{lang === 'ar' ? '✓ مدفوع' : '✓ Paid'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {selectedOrder.payment.cardBrand || (lang === 'ar' ? 'بطاقة' : 'Card')} 
                          {selectedOrder.payment.cardLast4 && ` •••• ${selectedOrder.payment.cardLast4}`}
                        </p>
                        <p className="text-xs text-green-600">{lang === 'ar' ? '✓ مدفوع' : '✓ Paid'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {nextStatus[selectedOrder.currentStatus] && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, nextStatus[selectedOrder.currentStatus]!)}
                    disabled={updateStatusMutation.isPending}
                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    {updateStatusMutation.isPending
                      ? (lang === 'ar' ? 'جاري التحديث...' : 'Updating...')
                      : lang === 'ar'
                      ? `تحديث إلى "${statusLabels[nextStatus[selectedOrder.currentStatus]!].ar}"`
                      : `Mark as "${statusLabels[nextStatus[selectedOrder.currentStatus]!].en}"`}
                  </button>
                  {selectedOrder.currentStatus === 'READY' && selectedOrder.fulfillment.type === 'DELIVERY' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'OUT_FOR_DELIVERY')}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {lang === 'ar' ? 'في التوصيل' : 'Out for Delivery'}
                    </button>
                  )}
                </div>
              )}

              {selectedOrder.currentStatus === 'PENDING' && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'CANCELLED')}
                  disabled={updateStatusMutation.isPending}
                  className="w-full mt-3 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {lang === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
