'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useCartStore } from '@/store/cart-store';
import apiClient from '@/lib/api-client';

function CartContent() {
  const items = useCartStore((s) => s.items);
  const discount = useCartStore((s) => s.discount);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const applyDiscount = useCartStore((s) => s.applyDiscount);
  const removeDiscount = useCartStore((s) => s.removeDiscount);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getDiscountAmount = useCartStore((s) => s.getDiscountAmount);
  const getTotal = useCartStore((s) => s.getTotal);

  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();

  const handleApplyDiscount = async () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) {
      setDiscountError('Please enter a discount code');
      return;
    }

    setDiscountLoading(true);
    setDiscountError('');

    try {
      const { data } = await apiClient.post('/store/discounts/validate', { code });
      if (data.valid && data.discount) {
        applyDiscount({
          code: data.discount.code,
          type: data.discount.type,
          value: data.discount.value,
        });
        setDiscountError('');
      } else {
        setDiscountError('Invalid discount code');
      }
    } catch {
      setDiscountError('Invalid discount code');
    } finally {
      setDiscountLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6 max-w-sm">Browse our store to find something you&apos;ll love</p>
        <Link
          href="/store"
          className="btn-gradient px-6 py-2.5 rounded-lg text-sm font-semibold"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {items.map((item, index) => {
              const price = item.variant ? item.variant.price : item.product.base_price;
              const lineTotal = price * item.quantity;
              const imageUrl = item.product.image_url;
              return (
                <div
                  key={item.id}
                  className={`p-5 flex gap-5 ${index < items.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.product.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg
                          className="w-10 h-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={0.5}
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/store/${item.product.slug}`}
                          className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-gray-500 mt-0.5">{item.variant.name}</p>
                        )}
                        <p className="text-sm text-gray-400 mt-0.5">
                          {'\u20AC'}{price.toFixed(2)} each
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 whitespace-nowrap text-lg">
                        {'\u20AC'}{lineTotal.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="inline-flex items-center border border-gray-200 rounded-full bg-gray-50">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all rounded-full disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          aria-label="Decrease quantity"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 12h-15" />
                          </svg>
                        </button>
                        <span className="px-3 py-1.5 text-gray-900 font-semibold min-w-[36px] text-center text-sm select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all rounded-full"
                          aria-label="Increase quantity"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all group"
                        aria-label="Remove item"
                        title="Remove from cart"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors mt-6 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

            {/* Discount Code - Collapsible */}
            <div className="mb-6">
              {discount ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h.008v.008H6V6z" />
                    </svg>
                    <div>
                      <span className="text-sm font-semibold text-green-800">{discount.code}</span>
                      <span className="text-xs text-green-600 ml-2">
                        ({discount.type === 'percentage' ? `${discount.value}%` : `\u20AC${discount.value}`} off)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={removeDiscount}
                    className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setDiscountOpen(!discountOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors w-full"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h.008v.008H6V6z" />
                    </svg>
                    Have a discount code?
                    <svg className={`w-4 h-4 ml-auto transition-transform ${discountOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  {discountOpen && (
                    <div className="flex gap-2 mt-3 animate-fade-in">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={discountLoading}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {discountLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {discountError && (
                <p className="text-xs text-red-600 mt-2">{discountError}</p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{'\u20AC'}{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{'\u20AC'}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-4">
                <span>Total</span>
                <span>{'\u20AC'}{total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/store/checkout"
              className="block w-full mt-6 py-4 btn-gradient text-center rounded-xl font-semibold text-lg transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md"
            >
              Proceed to Checkout
            </Link>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
