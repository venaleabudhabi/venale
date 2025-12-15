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

  // Fetch customer insights
  const { data: customerInsights } = useQuery({
    queryKey: ['admin', 'analytics', 'customer-insights', dateFilter, customStartDate, customEndDate],
    queryFn: async () => {
      const params = new URLSearchParams(getDateParams() as any);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/analytics/customer-insights?${params}`, {
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

    // Customer Insights sheet
    if (customerInsights?.rfmAnalysis) {
      const insightsData = [
        ['Phone', 'Name', 'Segment', 'Recency (days)', 'Frequency', 'Monetary', 'Avg Order'],
        ...customerInsights.rfmAnalysis.map((c: any) => [
          c._id, c.name || 'Guest', c.segment, c.recency.toFixed(0), c.frequency, c.monetary.toFixed(2), c.avgOrderValue.toFixed(2)
        ])
      ];
      const insightsWs = XLSX.utils.aoa_to_sheet(insightsData);
      XLSX.utils.book_append_sheet(wb, insightsWs, 'Customer Insights');
    }

    // High & Low Orders sheet
    if (customerInsights?.highValueOrders && customerInsights?.lowValueOrders) {
      const ordersData = [
        ['Type', 'Order #', 'Customer', 'Phone', 'Amount', 'Date'],
        ...customerInsights.highValueOrders.map((o: any) => [
          'High', o.orderNumber, o.customer.name, o.customer.phone, o.totals.total, new Date(o.createdAt).toLocaleDateString()
        ]),
        [],
        ...customerInsights.lowValueOrders.map((o: any) => [
          'Low', o.orderNumber, o.customer.name, o.customer.phone, o.totals.total, new Date(o.createdAt).toLocaleDateString()
        ])
      ];
      const ordersWs = XLSX.utils.aoa_to_sheet(ordersData);
      XLSX.utils.book_append_sheet(wb, ordersWs, 'High-Low Orders');
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
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
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
                      const intensity = count > 0 ? Math.min(Math.floor(count * 20), 100) : 0;
                      const intensityClass = intensity > 0 ? `heatmap-intensity-${intensity}` : '';
                      return (
                        <td
                          key={day}
                          className={`p-2 text-sm text-center border ${intensityClass}`}
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

        {/* Advanced Customer Insights Section */}
        {customerInsights && (
          <>
            {/* Customer Segmentation */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Customer Segmentation (RFM Analysis)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {customerInsights.segmentStats && Object.entries(customerInsights.segmentStats).map(([segment, stats]: [string, any]) => (
                  <div key={segment} className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-lg border-2 border-indigo-100 text-center">
                    <div className="text-xs text-gray-600 mb-1">{segment}</div>
                    <div className="text-2xl font-bold text-indigo-700">{stats.count}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      <DirhamAmount amount={stats.totalRevenue} size="xs" className="text-gray-600" />
                    </div>
                    <div className="text-xs text-gray-500">Avg: {stats.avgFrequency.toFixed(1)} orders</div>
                  </div>
                ))}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left border">Customer</th>
                      <th className="p-3 text-left border">Segment</th>
                      <th className="p-3 text-right border">Recency (days)</th>
                      <th className="p-3 text-right border">Frequency</th>
                      <th className="p-3 text-right border">Monetary</th>
                      <th className="p-3 text-right border">Avg Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerInsights.rfmAnalysis?.slice(0, 15).map((customer: any) => (
                      <tr key={customer._id} className="hover:bg-gray-50">
                        <td className="p-3 border">
                          <div className="font-medium">{customer.name || 'Guest'}</div>
                          <div className="text-xs text-gray-500">{customer._id}</div>
                        </td>
                        <td className="p-3 border">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            customer.segment === 'VIP' ? 'bg-purple-100 text-purple-700' :
                            customer.segment === 'Loyal' ? 'bg-blue-100 text-blue-700' :
                            customer.segment === 'Regular' ? 'bg-green-100 text-green-700' :
                            customer.segment === 'New' ? 'bg-yellow-100 text-yellow-700' :
                            customer.segment === 'At Risk' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {customer.segment}
                          </span>
                        </td>
                        <td className="p-3 border text-right">{customer.recency.toFixed(0)}</td>
                        <td className="p-3 border text-right">{customer.frequency}</td>
                        <td className="p-3 border text-right">
                          <DirhamAmount amount={customer.monetary} size="sm" />
                        </td>
                        <td className="p-3 border text-right">
                          <DirhamAmount amount={customer.avgOrderValue} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Amount Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* High Value Orders */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">High Value Orders (Top 10)</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {customerInsights.highValueOrders?.map((order: any, index: number) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-emerald-600 text-white rounded-full font-bold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.customer.name || 'Guest'}</p>
                          <p className="text-xs text-gray-500">{order.customer.phone}</p>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <DirhamAmount amount={order.totals.total} size="md" bold className="text-emerald-700" />
                        <p className="text-xs text-gray-500 mt-1">{order.items.length} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Value Orders */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Low Value Orders (Bottom 10)</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {customerInsights.lowValueOrders?.map((order: any, index: number) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-amber-600 text-white rounded-full font-bold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.customer.name || 'Guest'}</p>
                          <p className="text-xs text-gray-500">{order.customer.phone}</p>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <DirhamAmount amount={order.totals.total} size="md" bold className="text-amber-700" />
                        <p className="text-xs text-gray-500 mt-1">{order.items.length} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Order Amount Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Order Amount Statistics</h3>
                {customerInsights.orderAmountDistribution && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Average Order</p>
                      <DirhamAmount amount={customerInsights.orderAmountDistribution.avgOrder || 0} size="lg" bold className="text-blue-700" />
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-sm text-gray-600 mb-1">Highest Order</p>
                      <DirhamAmount amount={customerInsights.orderAmountDistribution.maxOrder || 0} size="lg" bold className="text-green-700" />
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <p className="text-sm text-gray-600 mb-1">Lowest Order</p>
                      <DirhamAmount amount={customerInsights.orderAmountDistribution.minOrder || 0} size="lg" bold className="text-orange-700" />
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-purple-700">{customerInsights.orderAmountDistribution.totalOrders || 0}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Frequency Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Order Frequency Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={customerInsights.orderFrequency || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" label={{ value: 'Orders per Customer', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Number of Customers', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="customerCount" fill="#8B5CF6" name="Customers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Customer Lifetime Value */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Lifetime Value (Top 10)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {customerInsights.lifetimeValue?.map((customer: any, index: number) => (
                  <div key={customer._id} className="bg-gradient-to-br from-pink-50 to-white p-4 rounded-lg border-2 border-pink-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-pink-600 text-white rounded-full font-bold text-xs">
                        {index + 1}
                      </span>
                      <p className="font-medium text-sm truncate">{customer.name || 'Guest'}</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{customer._id}</p>
                    <DirhamAmount amount={customer.totalSpent} size="md" bold className="text-pink-700 mb-1" />
                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                      <p>{customer.orderCount} orders</p>
                      <p>{customer.customerAge.toFixed(0)} days as customer</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Original Peak Hours Heatmap (kept for backward compatibility) */}
        <div className="bg-white rounded-xl shadow-sm p-6 hidden">
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
                      const intensity = count > 0 ? Math.min(Math.floor(count * 20), 100) : 0;
                      const intensityClass = intensity > 0 ? `heatmap-intensity-${intensity}` : '';
                      return (
                        <td
                          key={day}
                          className={`p-2 text-sm text-center border ${intensityClass}`}
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
