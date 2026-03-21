'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useCartStore } from '@/store/cart-store';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

const STEPS = [
  { number: 1, label: 'Shipping' },
  { number: 2, label: 'Review' },
  { number: 3, label: 'Confirm' },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep > step.number
                  ? 'bg-green-500 text-white'
                  : currentStep === step.number
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {currentStep > step.number ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block ${
                currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-0.5 mx-3 rounded-full transition-colors ${
                currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function CheckoutContent() {
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getDiscountAmount = useCartStore((s) => s.getDiscountAmount);
  const getTotal = useCartStore((s) => s.getTotal);
  const discount = useCartStore((s) => s.discount);
  const clear = useCartStore((s) => s.clear);

  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Germany',
  });
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const shipping = subtotal > 50 ? 0 : 4.99;
  const total = getTotal() + shipping;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    setIsSubmitting(true);

    try {
      const { data } = await apiClient.post('/store/checkout', {
        shipping_name: `${form.firstName} ${form.lastName}`,
        shipping_email: form.email,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_postal_code: form.postalCode,
        shipping_country: form.country,
        discount_code: discount?.code || undefined,
      });

      setOrderNumber(data.order_number || data.orderNumber || data.id);
      clear();
      setSubmitted(true);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setCheckoutError(
        axiosError.response?.data?.message || 'Checkout failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-24 text-center animate-fade-in">
        {/* Celebration circles */}
        <div className="relative inline-block mb-8">
          <div className="absolute -inset-4 bg-green-100 rounded-full animate-ping opacity-20"></div>
          <div className="absolute -inset-8 bg-green-50 rounded-full opacity-40"></div>
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg shadow-green-200">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Order Placed!</h1>
        <p className="text-lg text-gray-600 mb-2">
          Thank you for your order. We have sent a confirmation email to{' '}
          <span className="font-semibold text-gray-800">{form.email || 'your email address'}</span>.
        </p>
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-5 py-2 mt-2 mb-10">
          <span className="text-sm text-gray-500">Order number:</span>
          <span className="text-sm font-bold text-gray-900">{orderNumber}</span>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/store/orders"
            className="px-6 py-3 btn-gradient rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            View Orders
          </Link>
          <Link
            href="/store"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium hover:border-gray-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-gray-300 mb-6">
          <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">
          Add some items to your cart before checking out.
        </p>
        <Link
          href="/store"
          className="inline-flex items-center px-6 py-3 btn-gradient rounded-xl font-semibold transition-all hover:scale-[1.02]"
        >
          Browse Store
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>

      <StepIndicator currentStep={1} />

      {checkoutError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {checkoutError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Address Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-4.5 h-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-4.5 h-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4.5 h-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Street Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4.5 h-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-4.5 h-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Postal Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-4.5 h-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-4.5 h-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                    </div>
                    <select
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow appearance-none"
                    >
                      <option value="Germany">Germany</option>
                      <option value="Austria">Austria</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Bulgaria">Bulgaria</option>
                      <option value="Croatia">Croatia</option>
                      <option value="Cyprus">Cyprus</option>
                      <option value="Czech Republic">Czech Republic</option>
                      <option value="Denmark">Denmark</option>
                      <option value="Estonia">Estonia</option>
                      <option value="Finland">Finland</option>
                      <option value="France">France</option>
                      <option value="Greece">Greece</option>
                      <option value="Hungary">Hungary</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Italy">Italy</option>
                      <option value="Latvia">Latvia</option>
                      <option value="Lithuania">Lithuania</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Malta">Malta</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Poland">Poland</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Romania">Romania</option>
                      <option value="Slovakia">Slovakia</option>
                      <option value="Slovenia">Slovenia</option>
                      <option value="Spain">Spain</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Switzerland">Switzerland</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Payment processing will be integrated with Stripe
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-8 shadow-sm">
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  Order Summary
                </h2>
              </div>

              <div className="p-6">
                {/* Items */}
                <div className="space-y-3 mb-4">
                  {items.map((item) => {
                    const price = item.variant
                      ? item.variant.price
                      : item.product.base_price;
                    return (
                      <div key={item.id} className="flex items-start justify-between text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-gray-500">{item.variant.name}</p>
                          )}
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="ml-4 text-gray-900 font-medium whitespace-nowrap">
                          {'\u20AC'}{(price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{'\u20AC'}{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && discount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({discount.code})</span>
                      <span>-{'\u20AC'}{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : `\u20AC${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-4">
                    <span>Total</span>
                    <span>{'\u20AC'}{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="block w-full mt-6 py-4 btn-gradient text-center rounded-xl font-semibold text-lg transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Placing Order...
                    </span>
                  ) : 'Place Order'}
                </button>

                {/* Security badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg py-2.5 border border-gray-100">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="font-medium text-gray-500">Secure Checkout</span>
                </div>

                <Link
                  href="/store/cart"
                  className="flex items-center justify-center gap-1.5 w-full mt-3 text-center text-sm text-gray-500 hover:text-gray-700 transition-colors group"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
