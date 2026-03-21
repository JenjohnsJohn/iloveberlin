'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { formatDate } from '@/lib/format-date';

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', label: 'Pending' },
  paid: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400', label: 'Paid' },
  processing: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400', label: 'Processing' },
  shipped: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', label: 'Shipped' },
  delivered: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Delivered' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', label: 'Cancelled' },
  refunded: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Refunded' },
};

function mapOrder(raw: Record<string, unknown>): Order {
  const items = raw.items;
  return {
    id: String(raw.id || ''),
    orderNumber: String(raw.order_number || raw.orderNumber || raw.id || ''),
    date: formatDate(String(raw.created_at || raw.createdAt || raw.date || '')),
    status: (raw.status as OrderStatus) || 'pending',
    total: Number(raw.total || 0),
    itemCount: Array.isArray(items) ? items.length : Number(raw.itemCount || raw.item_count || 0),
  };
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get('/store/orders');
        const list = Array.isArray(data) ? data : data.data ?? data.orders ?? [];
        setOrders(list.map((o: Record<string, unknown>) => mapOrder(o)));
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-red-300 mb-6">
          <svg className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Something Went Wrong</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <button onClick={() => window.location.reload()} className="inline-flex items-center px-6 py-3 btn-gradient rounded-xl font-semibold transition-all hover:scale-[1.02]">
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center animate-fade-in">
        <div className="text-gray-300 mb-8">
          <svg className="w-28 h-28 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">No Orders Yet</h1>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">You have not placed any orders yet. Start shopping to see your orders here.</p>
        <Link href="/store" className="inline-flex items-center gap-2 px-8 py-3.5 btn-gradient rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
          Browse Store
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <span className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Card-based order list */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/store/orders/${order.id}`}
            className="block bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left: Order info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    Order #{order.orderNumber}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {order.date}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Right: Status + Total + Arrow */}
              <div className="flex items-center gap-5 sm:gap-6">
                <StatusBadge status={order.status} />
                <p className="text-lg font-bold text-gray-900 min-w-[80px] text-right">
                  {'\u20AC'}{order.total.toFixed(2)}
                </p>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors group-hover:translate-x-0.5 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/store" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors group">
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
