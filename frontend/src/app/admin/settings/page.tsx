'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

interface VenueSettings {
  delivery_enabled: boolean;
  vatPercent: number;
  deliveryFee: number;
  member_discount_percent: number;
  payment_methods: string[];
}

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.getVenueSettings().then(res => res.data),
  });

  const { register, handleSubmit, reset } = useForm<VenueSettings>();

  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const updateSettings = useMutation({
    mutationFn: adminApi.updateVenueSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      alert('Settings updated successfully');
    },
  });

  const onSubmit = (data: VenueSettings) => {
    updateSettings.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Venue Settings</h1>
            <button onClick={() => router.push('/admin/orders')} className="btn-secondary">
              Back to Orders
            </button>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Delivery Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" {...register('delivery_enabled')} className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">Enable Delivery</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Fee (AED)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('deliveryFee', { valueAsNumber: true })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Pricing Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Tax</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VAT Percentage (%)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('vatPercent', { valueAsNumber: true })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Discount Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('member_discount_percent', { valueAsNumber: true })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  value="COD"
                  {...register('payment_methods')}
                  className="w-5 h-5 text-primary-600"
                />
                <span className="text-gray-700">Cash on Delivery</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  value="CARD"
                  {...register('payment_methods')}
                  className="w-5 h-5 text-primary-600"
                />
                <span className="text-gray-700">Card Payment (Stripe)</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <button type="submit" className="btn-primary" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
