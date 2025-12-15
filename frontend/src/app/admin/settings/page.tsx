'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface OperatingHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

interface VenueSettings {
  delivery_enabled: boolean;
  vatPercent: number;
  deliveryFee: number;
  member_discount_percent: number;
  payment_methods: string[];
  isOpen: boolean;
  operatingHours: OperatingHours;
}

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/settings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });

  useEffect(() => {
    if (settings?.operatingHours) {
      setOperatingHours(settings.operatingHours);
    }
  }, [settings]);

  // Toggle shop mutation
  const toggleShopMutation = useMutation({
    mutationFn: async (isOpen: boolean) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/settings/toggle-shop`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isOpen })
      });
      if (!res.ok) throw new Error('Failed to toggle shop');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    }
  });

  // Update operating hours mutation
  const updateHoursMutation = useMutation({
    mutationFn: async (hours: OperatingHours) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/settings/operating-hours`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ operatingHours: hours })
      });
      if (!res.ok) throw new Error('Failed to update operating hours');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      alert('Operating hours updated successfully!');
    }
  });

  const handleToggleShop = () => {
    const newStatus = !settings?.isOpen;
    if (confirm(`Are you sure you want to ${newStatus ? 'OPEN' : 'CLOSE'} the shop?`)) {
      toggleShopMutation.mutate(newStatus);
    }
  };

  const handleDayToggle = (day: DayOfWeek) => {
    if (!operatingHours) return;
    setOperatingHours({
      ...operatingHours,
      [day]: {
        ...operatingHours[day],
        closed: !operatingHours[day].closed
      }
    });
  };

  const handleTimeChange = (day: DayOfWeek, field: 'open' | 'close', value: string) => {
    if (!operatingHours) return;
    setOperatingHours({
      ...operatingHours,
      [day]: {
        ...operatingHours[day],
        [field]: value
      }
    });
  };

  const handleSaveHours = () => {
    if (operatingHours) {
      updateHoursMutation.mutate(operatingHours);
    }
  };

  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
            <h1 className="text-2xl font-bold text-gray-900">Shop Settings</h1>
            <div className="flex gap-4">
              <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/admin/orders" className="text-sm text-gray-600 hover:text-gray-900">
                Orders
              </Link>
              <Link href="/admin/menu" className="text-sm text-gray-600 hover:text-gray-900">
                Menu
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('adminUser');
                  router.push('/admin/login');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Shop Status Toggle */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop Status</h2>
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Shop is currently {settings?.isOpen ? 'OPEN' : 'CLOSED'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {settings?.isOpen 
                  ? 'Customers can place orders' 
                  : 'Customers can view menu but cannot place orders'}
              </p>
            </div>
            <button
              onClick={handleToggleShop}
              disabled={toggleShopMutation.isPending}
              className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${
                settings?.isOpen ? 'bg-green-600' : 'bg-gray-400'
              } ${toggleShopMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform ${
                  settings?.isOpen ? 'translate-x-12' : 'translate-x-1'
                }`}
              />
              <span className="sr-only">Toggle shop status</span>
            </button>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h2>
          <p className="text-sm text-gray-600 mb-6">Set your shop's operating hours for each day of the week</p>
          
          <div className="space-y-4">
            {operatingHours && days.map((day) => (
              <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-28">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!operatingHours[day].closed}
                      onChange={() => handleDayToggle(day)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="font-medium capitalize">{day}</span>
                  </label>
                </div>
                
                {!operatingHours[day].closed ? (
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Open:</label>
                      <input
                        type="time"
                        value={operatingHours[day].open}
                        onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                        aria-label={`Opening time for ${day}`}
                        className="px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Close:</label>
                      <input
                        type="time"
                        value={operatingHours[day].close}
                        onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                        aria-label={`Closing time for ${day}`}
                        className="px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <span className="text-sm text-red-600 font-medium">Closed</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveHours}
              disabled={updateHoursMutation.isPending}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateHoursMutation.isPending ? 'Saving...' : 'Save Operating Hours'}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Shop Status Toggle:</strong> Instantly open or close your shop regardless of operating hours</li>
            <li>• <strong>Operating Hours:</strong> Set specific opening and closing times for each day</li>
            <li>• <strong>Closed Days:</strong> Uncheck days when your shop is completely closed</li>
            <li>• <strong>Customer Experience:</strong> When closed, customers can browse the menu but cannot checkout</li>
          </ul>
        </div>

        {/* Other Venue Settings - Original Form */}
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
