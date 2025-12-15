'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DirhamAmount from '@/components/DirhamAmount';

type DateFilter = 'today' | 'week' | 'month' | 'all';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => adminApi.getOrders().then((res) => res.data),
  });

  // Filter orders by date
  const filterOrdersByDate = (orders: any[]) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (dateFilter) {
      case 'today':
        return orders.filter((o: any) => new Date(o.createdAt) >= startOfToday);
      case 'week':
        return orders.filter((o: any) => new Date(o.createdAt) >= startOfWeek);
      case 'month':
        return orders.filter((o: any) => new Date(o.createdAt) >= startOfMonth);
      case 'all':
      default:
        return orders;
    }
  };

  const allOrders = data?.orders || [];
  const orders = filterOrdersByDate(allOrders);
  const ordersByStatus = {
    ALL: orders, // Show all orders in first column
    PENDING: orders.filter((o: any) => o.currentStatus === 'PENDING') || [],
    CONFIRMED: orders.filter((o: any) => o.currentStatus === 'CONFIRMED') || [],
    PREPARING: orders.filter((o: any) => o.currentStatus === 'PREPARING') || [],
    READY: orders.filter((o: any) => o.currentStatus === 'READY') || [],
    COMPLETED: orders.filter((o: any) => o.currentStatus === 'COMPLETED') || [],
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Orders Management</h1>
          <div className="flex gap-4">
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
      </header>

      <div className="p-6">
        {/* Date Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {(['today', 'week', 'month', 'all'] as DateFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateFilter === filter
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filter === 'today' && 'Today'}
              {filter === 'week' && 'This Week'}
              {filter === 'month' && 'This Month'}
              {filter === 'all' && 'All Time'}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-white rounded-lg">
            <span className="text-sm text-gray-600">Total Orders:</span>
            <span className="font-bold text-gray-900">{orders.length}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {Object.entries(ordersByStatus).map(([status, orders]: [string, any]) => (
            <div key={status} className="bg-white rounded-lg shadow-sm">
              <div className={`px-4 py-3 border-b ${status === 'ALL' ? 'bg-gray-100' : ''}`}>
                <h2 className="font-semibold">{status === 'ALL' ? 'ALL ORDERS' : status}</h2>
                <p className="text-sm text-gray-500">{orders.length} orders</p>
              </div>
              <div className="p-4 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                {orders.map((order: any) => (
                  <div key={order._id} className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="font-mono text-sm font-bold mb-1">{order.orderNumber}</div>
                    {status === 'ALL' && (
                      <div className="mb-2">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          order.currentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.currentStatus === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          order.currentStatus === 'PREPARING' ? 'bg-purple-100 text-purple-800' :
                          order.currentStatus === 'READY' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.currentStatus}
                        </span>
                      </div>
                    )}
                    <div className="font-mono text-sm font-bold mb-1">{order.orderNumber}</div>
                    <div className="text-sm text-gray-600">{order.customer.phone}</div>
                    <div className="mt-2">
                      <DirhamAmount amount={order.totals.total} size="sm" bold className="text-primary-600" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
