'use client';

import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';
import { useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useEffect } from 'react';
import DirhamAmount from '@/components/DirhamAmount';

export default function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const { lang } = useLanguageStore();
  const { t, dir } = useTranslation(lang);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['order', params.orderId],
    queryFn: () => orderApi.getOrder(params.orderId).then((res) => res.data),
    refetchInterval: 5000, // Poll every 5 seconds for faster updates
  });

  const statusSteps = [
    { key: 'PENDING', label: t('status.PENDING') },
    { key: 'CONFIRMED', label: t('status.CONFIRMED') },
    { key: 'PREPARING', label: t('status.PREPARING') },
    { key: 'READY', label: t('status.READY') },
    { key: 'COMPLETED', label: t('status.COMPLETED') },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === data?.currentStatus);

  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Live Update Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-xs text-gray-600">
            {isFetching ? (lang === 'ar' ? 'جاري التحديث...' : 'Updating...') : (lang === 'ar' ? 'مباشر' : 'Live')}
          </span>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('orderPlaced')}</h1>
          <p className="text-gray-600">
            {t('orderNumber')}: <span className="font-mono font-bold">{data?.orderNumber}</span>
          </p>
        </div>

        {/* Status Timeline */}
        <div className="card mb-6">
          <h2 className="font-bold text-lg mb-6">{t('orderStatus')}</h2>
          <div className="space-y-4">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index <= currentStepIndex ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`w-0.5 h-12 ${index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <p className={`font-medium ${index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="card">
          <h2 className="font-bold text-lg mb-4">Order Details</h2>
          <div className="space-y-3">
            {data?.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span>
                  {item.qty}x {item.name_en}
                </span>
                <DirhamAmount amount={item.price * item.qty} size="sm" />
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>{t('total')}</span>
              <DirhamAmount amount={data?.totals.total || 0} size="md" bold className="text-primary-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
