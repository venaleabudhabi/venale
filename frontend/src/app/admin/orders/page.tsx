'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DirhamAmount from '@/components/DirhamAmount';

export default function AdminOrdersPage() {
  const router = useRouter();

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

  const orders = data?.orders || [];
  const ordersByStatus = {
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(ordersByStatus).map(([status, orders]: [string, any]) => (
            <div key={status} className="bg-white rounded-lg shadow-sm">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold">{status}</h2>
                <p className="text-sm text-gray-500">{orders.length} orders</p>
              </div>
              <div className="p-4 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                {orders.map((order: any) => (
                  <div key={order._id} className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
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
