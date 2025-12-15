'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DirhamAmount from '@/components/DirhamAmount';
import * as XLSX from 'xlsx';

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [comparisonMode, setComparisonMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const getDateParams = () => {
    if (dateFilter === 'custom') {
      return { startDate: customStartDate.toISOString(), endDate: customEndDate.toISOString() };
    }
    return { period: dateFilter };
  };

  // Fetch summary KPIs
  const { data: summary } = useQuery({
    queryKey: ['admin', 'analytics', 'summary', dateFilter, customStartDate, customEndDate],
    queryFn: async () => {
      const params = new URLSearchParams(getDateParams() as any);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/analytics/summary?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    },
  });

  // Fetch revenue trend
  const { data: revenueTrend } = useQuery({
    queryKey: ['admin', 'analytics', 'revenue-trend', dateFilter, customStartDate, customEndDate],
    queryFn: async () => {
      const params = new URLSearchParams(getDateParams() as any);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/analytics/revenue-trend?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    },
  });

  // Fetch top items
  const { data: topItems } = useQuery({
    queryKey: ['admin', 'analytics', 'top-items', dateFilter, customStartDate, customEndDate],
    queryFn: async () => {
      const params = new URLSearchParams({ ...getDateParams(), limit: '10' } as any);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/analytics/top-items?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    },
  });

  // Fetch low items
  const { data: lowItems } = useQuery({
    queryKey: ['admin', 'analytics', 'low-items', dateFilter, customStartDate, customEndDate],
    queryFn: async () => {
      const params = new URLSearchParams({ ...getDateParams(), limit: '10' } as any);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/analytics/low-items?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    },
  });

  // Fetch peak hours
  const { data: peakHours } = useQuery({
    queryKey: ['admin', 'analytics', 'peak-hours', dateFilter, customStartDate, customEndDate],
    queryFn: async () => {
      const params = new URLSearchParams(getDateParams() as any);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/analytics/peak-hours?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    },
  });

  // Fetch customer analytics
  const { data: customers } = useQuery({
    queryKey: ['admin', 'analytics', 'customers', dateFilter, customStartDate, customEndDate],
    queryFn: async () => {
      const params = new URLSearchParams({ ...getDateParams(), limit: '10' } as any);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/analytics/customers?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    },
  });

  // Fetch payment methods
  const { data: paymentMethods } = useQuery({
    queryKey: ['admin', 'analytics', 'payment-methods', dateFilter, customStartDate, customEndDate],
    queryFn: async () => {
      const params = new URLSearchParams(getDateParams() as any);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/analytics/payment-methods?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    },
  });

  // Export to Excel
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Metric', 'Current', 'Previous', 'Change %'],
      ['Revenue', summary?.revenue.current || 0, summary?.revenue.previous || 0, summary?.revenue.change?.toFixed(2) || 0],
      ['Orders', summary?.orders.current || 0, summary?.orders.previous || 0, summary?.orders.change?.toFixed(2) || 0],
      ['Customers', summary?.customers.current || 0, summary?.customers.previous || 0, summary?.customers.change?.toFixed(2) || 0],
      ['AOV', summary?.aov.current || 0, summary?.aov.previous || 0, summary?.aov.change?.toFixed(2) || 0],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Top Items sheet
    if (topItems?.topItems) {
      const topItemsData = [
        ['Item Name', 'Quantity Sold', 'Revenue'],
        ...topItems.topItems.map((item: any) => [item.name, item.totalQty, item.totalRevenue])
      ];
      const topItemsWs = XLSX.utils.aoa_to_sheet(topItemsData);
      XLSX.utils.book_append_sheet(wb, topItemsWs, 'Top Items');
    }

    // Top Customers sheet
    if (customers?.topCustomers) {
      const customersData = [
        ['Phone', 'Name', 'Orders', 'Total Spent'],
        ...customers.topCustomers.map((c: any) => [c._id, c.name || 'Guest', c.orderCount, c.totalSpent])
      ];
      const customersWs = XLSX.utils.aoa_to_sheet(customersData);
      XLSX.utils.book_append_sheet(wb, customersWs, 'Customers');
    }

    XLSX.writeFile(wb, `analytics-${dateFilter}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Format change percentage
  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const arrow = isPositive ? '↗' : '↘';
    return <span className={color}>{change > 0 ? '+' : ''}{change.toFixed(1)}% {arrow}</span>;
  };

  // Transform peak hours data for heatmap
  const peakHoursHeatmap = peakHours?.peakHours?.reduce((acc: any, item: any) => {
    const day = item._id.day;
    const hour = item._id.hour;
    if (!acc[day]) acc[day] = {};
    acc[day][hour] = item.count;
    return acc;
  }, {}) || {};

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <div className="flex gap-4">
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
      </header>

      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Date Filter & Export */}
        <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(['today', 'yesterday', 'week', 'month', 'year', 'custom'] as DateFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateFilter === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            {dateFilter === 'custom' && (
              <div className="flex gap-2 items-center">
                <DatePicker
                  selected={customStartDate}
                  onChange={(date) => setCustomStartDate(date || new Date())}
                  className="px-3 py-2 border rounded-lg"
                  dateFormat="MMM d, yyyy"
                />
                <span className="text-gray-500">to</span>
                <DatePicker
                  selected={customEndDate}
                  onChange={(date) => setCustomEndDate(date || new Date())}
                  className="px-3 py-2 border rounded-lg"
                  dateFormat="MMM d, yyyy"
                />
              </div>
            )}
            
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                comparisonMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Compare
            </button>

            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <DirhamAmount amount={summary?.revenue.current || 0} size="xl" bold className="text-gray-900 mb-1" />
            {comparisonMode && summary?.revenue.change !== undefined && (
              <div className="text-sm">{formatChange(summary.revenue.change)}</div>
            )}
          </div>

          {/* Orders Card */}
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-sm p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{summary?.orders.current || 0}</p>
            {comparisonMode && summary?.orders.change !== undefined && (
              <div className="text-sm">{formatChange(summary.orders.change)}</div>
            )}
          </div>

          {/* Customers Card */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-sm p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Unique Customers</h3>
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{summary?.customers.current || 0}</p>
            {comparisonMode && summary?.customers.change !== undefined && (
              <div className="text-sm">{formatChange(summary.customers.change)}</div>
            )}
          </div>

          {/* AOV Card */}
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-sm p-6 border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Avg Order Value</h3>
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <DirhamAmount amount={summary?.aov.current || 0} size="xl" bold className="text-gray-900 mb-1" />
            {comparisonMode && summary?.aov.change !== undefined && (
              <div className="text-sm">{formatChange(summary.aov.change)}</div>
            )}
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue (AED)" />
                <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods?.paymentMethods || []}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry._id}: ${entry.count}`}
                >
                  {(paymentMethods?.paymentMethods || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Top Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {topItems?.topItems?.map((item: any, index: number) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.totalQty}</p>
                    </div>
                  </div>
                  <DirhamAmount amount={item.totalRevenue} size="sm" bold className="text-green-700" />
                </div>
              ))}
            </div>
          </div>

          {/* Low Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Low Selling Items</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {lowItems?.lowItems?.map((item: any, index: number) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-orange-600 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.totalQty}</p>
                    </div>
                  </div>
                  <DirhamAmount amount={item.totalRevenue} size="sm" bold className="text-orange-700" />
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
            <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
              <div className="bg-purple-50 p-2 rounded text-center">
                <p className="text-gray-600">Total</p>
                <p className="font-bold text-purple-700">{customers?.stats?.total || 0}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded text-center">
                <p className="text-gray-600">Repeat</p>
                <p className="font-bold text-blue-700">{customers?.stats?.repeat || 0}</p>
              </div>
              <div className="bg-green-50 p-2 rounded text-center">
                <p className="text-gray-600">New</p>
                <p className="font-bold text-green-700">{customers?.stats?.new || 0}</p>
              </div>
            </div>
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {customers?.topCustomers?.map((customer: any, index: number) => (
                <div key={customer._id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{customer._id}</p>
                      <p className="text-sm text-gray-600">{customer.orderCount} orders</p>
                    </div>
                  </div>
                  <DirhamAmount amount={customer.totalSpent} size="sm" bold className="text-purple-700" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peak Hours Heatmap */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Peak Hours Heatmap</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-sm font-medium text-gray-700 border">Hour</th>
                  {dayNames.map((day, index) => (
                    <th key={index} className="p-2 text-sm font-medium text-gray-700 border">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 24 }, (_, hour) => (
                  <tr key={hour}>
                    <td className="p-2 text-sm text-gray-700 border font-medium">{hour}:00</td>
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                      const count = peakHoursHeatmap[day]?.[hour] || 0;
                      const intensity = count > 0 ? Math.min(count * 20, 100) : 0;
                      const bgColor = intensity > 0 
                        ? `rgba(59, 130, 246, ${intensity / 100})`
                        : 'transparent';
                      return (
                        <td
                          key={day}
                          className="p-2 text-sm text-center border"
                          style={{ backgroundColor: bgColor }}
                        >
                          {count > 0 && <span className="font-medium">{count}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
