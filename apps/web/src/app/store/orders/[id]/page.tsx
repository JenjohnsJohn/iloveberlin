'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { formatDate } from '@/lib/format-date';

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';

interface OrderItem {
  name: string;
  variant: string | null;
  quantity: number;
  price: number;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  shipping: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};


function mapOrderItem(raw: Record<string, unknown>): OrderItem {
  return {
    name: String(raw.product_name || raw.name || ''),
    variant: (raw.variant_name || raw.variant || null) as string | null,
    quantity: Number(raw.quantity || 0),
    price: Number(raw.price || 0),
  };
}

function mapOrderDetail(raw: Record<string, unknown>): OrderDetail {
  const rawItems = raw.items;
  const items = Array.isArray(rawItems) ? rawItems.map((i: Record<string, unknown>) => mapOrderItem(i)) : [];

  return {
    id: String(raw.id || ''),
    orderNumber: String(raw.order_number || raw.orderNumber || raw.id || ''),
    date: formatDate(String(raw.created_at || raw.createdAt || raw.date || '')),
    status: (raw.status as OrderStatus) || 'pending',
    items,
    shipping: {
      name: String(raw.shipping_name || (raw.shipping as Record<string, unknown>)?.name || ''),
      address: String(raw.shipping_address || (raw.shipping as Record<string, unknown>)?.address || ''),
      city: String(raw.shipping_city || (raw.shipping as Record<string, unknown>)?.city || ''),
      postalCode: String(raw.shipping_postal_code || (raw.shipping as Record<string, unknown>)?.postalCode || ''),
      country: String(raw.shipping_country || (raw.shipping as Record<string, unknown>)?.country || ''),
    },
    subtotal: Number(raw.subtotal || 0),
    discount: Number(raw.discount_amount || raw.discount || 0),
    shippingCost: Number(raw.shipping_amount || raw.shippingCost || 0),
    tax: Number(raw.tax_amount || raw.tax || 0),
    total: Number(raw.total || 0),
  };
}

function OrderDetailContent() {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data } = await apiClient.get(`/store/orders/${orderId}`);
        setOrder(mapOrderDetail(data));
      } catch (err: unknown) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 404) {
          setError('not_found');
        } else {
          setError(axiosError.response?.data?.message || 'Failed to load order details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, orderId, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error === 'not_found' || (!order && !error)) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-8">
          The order you are looking for does not exist.
        </p>
        <Link
          href="/store/orders"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-red-400 mb-6">
          <svg
            className="w-20 h-20 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Something Went Wrong</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/store/orders"
        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors mb-6"
      >
        &larr; Back to Orders
      </Link>

      {/* Order Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-gray-500 mt-1">Placed on {order.date}</p>
        </div>
        <span
          className={`inline-block self-start px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[order.status]}`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Variant
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700">
                      Qty
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {item.variant || '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {'\u20AC'}{item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {'\u20AC'}{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Shipping Information</h2>
            </div>
            <div className="px-6 py-4">
              <p className="font-medium text-gray-900">{order.shipping.name}</p>
              <p className="text-gray-600 mt-1">{order.shipping.address}</p>
              <p className="text-gray-600">
                {order.shipping.postalCode} {order.shipping.city}
              </p>
              <p className="text-gray-600">{order.shipping.country}</p>
            </div>
          </div>
        </div>

        {/* Order Totals Sidebar */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Totals
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{'\u20AC'}{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{'\u20AC'}{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>
                  {order.shippingCost === 0
                    ? 'Free'
                    : `\u20AC${order.shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (19% VAT)</span>
                <span>{'\u20AC'}{order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total</span>
                <span>{'\u20AC'}{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
