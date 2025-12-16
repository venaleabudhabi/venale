'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency, formatTime } from '@/lib/utils';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name?: string;
    phone: string;
  };
  fulfillment: {
    type: 'PICKUP' | 'DELIVERY';
    address?: string;
    scheduledFor?: string;
  };
  totals: {
    total: number;
  };
  currentStatus: string;
  createdAt: string;
}

export default function DriverOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('driver_token');
    if (!token) {
      router.push('/driver/login');
    } else {
      setIsAuthenticated(true);
    }

    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [router]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    
    setDeferredPrompt(null);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['driver', 'orders'],
    queryFn: async () => {
      const token = localStorage.getItem('driver_token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/driver/orders/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 10000, // Poll every 10s
  });

  const orders = data?.orders || [];
  const activeOrders = orders.filter((o: Order) => o.currentStatus !== 'COMPLETED' && o.currentStatus !== 'CANCELLED');
  const completedOrders = orders.filter((o: Order) => o.currentStatus === 'COMPLETED' || o.currentStatus === 'CANCELLED');
  const displayOrders = showCompleted ? completedOrders : activeOrders;

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const token = localStorage.getItem('driver_token');
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/driver/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'orders'] });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('driver_token');
    router.push('/driver/login');
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Install Banner */}
      {showInstallBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-sm">Install REVIVE Staff App</p>
                <p className="text-xs opacity-90">Add to home screen for quick access</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
            <div className="flex gap-2 items-center">
              <a
                href="/driver/install"
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                title="Install app"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="hidden lg:inline">Install App</span>
              </a>
              <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
                Logout
              </button>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowCompleted(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showCompleted
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({activeOrders.length})
            </button>
            <button
              onClick={() => setShowCompleted(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showCompleted
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({completedOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {displayOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              {showCompleted ? 'No completed deliveries' : 'No active deliveries assigned'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order: Order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600 mt-1">{formatTime(order.createdAt)}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {order.currentStatus}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-gray-700">{order.customer.name || 'Customer'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <a href={`tel:${order.customer.phone}`} className="text-primary-600 hover:underline">
                      {order.customer.phone}
                    </a>
                  </div>

                  {order.fulfillment.address && (
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-gray-700 flex-1">{order.fulfillment.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-gray-900 font-semibold">{formatCurrency(order.totals.total)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {!showCompleted && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {order.currentStatus === 'READY' && (
                      <button
                        onClick={() => updateStatus.mutate({ orderId: order._id, status: 'OUT_FOR_DELIVERY' })}
                        className="btn-primary flex-1"
                        disabled={updateStatus.isPending}
                      >
                        Start Delivery
                      </button>
                    )}
                    {order.currentStatus === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => updateStatus.mutate({ orderId: order._id, status: 'COMPLETED' })}
                        className="btn-primary flex-1"
                        disabled={updateStatus.isPending}
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
