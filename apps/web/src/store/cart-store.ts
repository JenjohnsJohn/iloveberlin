import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/lib/api-client';

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  image_url: string | null;
}

export interface CartVariant {
  id: string;
  name: string;
  price: number;
}

export interface CartItemData {
  id: string;
  product: CartProduct;
  variant: CartVariant | null;
  quantity: number;
}

interface DiscountInfo {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
}

interface CartState {
  items: CartItemData[];
  discount: DiscountInfo | null;

  addItem: (product: CartProduct, quantity: number, variant?: CartVariant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clear: () => void;
  applyDiscount: (discount: DiscountInfo) => void;
  removeDiscount: () => void;

  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;

  syncCartWithBackend: (token?: string) => Promise<void>;
  checkoutWithBackend: (shippingInfo: ShippingInfo, token: string) => Promise<{ id: string; orderNumber: string }>;
}

let nextItemId = 1;

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('iloveberlin-auth');
    if (stored) {
      const { state } = JSON.parse(stored);
      return state?.accessToken || null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: null,

      addItem: (product, quantity, variant) => {
        const localId = `cart-item-${nextItemId++}`;

        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.variant?.id === (variant?.id ?? null),
          );

          if (existingIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + quantity,
            };
            return { items: updatedItems };
          }

          const newItem: CartItemData = {
            id: localId,
            product,
            variant: variant || null,
            quantity,
          };

          return { items: [...state.items, newItem] };
        });

        // Sync to backend if authenticated and update local ID with real backend ID
        const token = getAuthToken();
        if (token) {
          apiClient.post('/store/cart/items', {
            product_id: product.id,
            variant_id: variant?.id,
            quantity,
          }).then(({ data }) => {
            const backendId = data?.id || data?.item?.id;
            if (backendId) {
              set((state) => ({
                items: state.items.map((item) =>
                  item.id === localId ? { ...item, id: String(backendId) } : item,
                ),
              }));
            }
          }).catch(() => {
            // Silently fail - local state is already updated
          });
        }
      },

      removeItem: (itemId) => {
        // Sync to backend if authenticated
        const token = getAuthToken();
        if (token) {
          apiClient.delete(`/store/cart/items/${itemId}`).catch(() => {
            // Silently fail - local state is already updated
          });
        }

        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) return;

        // Sync to backend if authenticated
        const token = getAuthToken();
        if (token) {
          apiClient.put(`/store/cart/items/${itemId}`, { quantity }).catch(() => {
            // Silently fail - local state is already updated
          });
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item,
          ),
        }));
      },

      clear: () => {
        set({ items: [], discount: null });
      },

      applyDiscount: (discount) => {
        set({ discount });
      },

      removeDiscount: () => {
        set({ discount: null });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const price = item.variant ? item.variant.price : item.product.base_price;
          return sum + price * item.quantity;
        }, 0);
      },

      getDiscountAmount: () => {
        const { discount } = get();
        if (!discount) return 0;

        const subtotal = get().getSubtotal();
        if (discount.type === 'percentage') {
          return subtotal * (discount.value / 100);
        }
        return Math.min(discount.value, subtotal);
      },

      getTotal: () => {
        return get().getSubtotal() - get().getDiscountAmount();
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      syncCartWithBackend: async (token?: string) => {
        const authToken = token || getAuthToken();
        if (!authToken) return;

        try {
          const { data } = await apiClient.get('/store/cart');
          const rawItems = data?.items || data?.cart_items || [];
          if (Array.isArray(rawItems) && rawItems.length > 0) {
            const mapped: CartItemData[] = rawItems.map((item: Record<string, unknown>) => {
              const prod = item.product as Record<string, unknown> | undefined;
              const vari = item.variant as Record<string, unknown> | undefined;
              return {
                id: String(item.id || ''),
                product: {
                  id: String(prod?.id || item.product_id || ''),
                  name: String(prod?.name || ''),
                  slug: String(prod?.slug || ''),
                  base_price: Number(prod?.base_price || 0),
                  compare_at_price: prod?.compare_at_price ? Number(prod.compare_at_price) : null,
                  image_url: prod?.images && Array.isArray(prod.images) && (prod.images as Record<string, unknown>[]).length > 0
                    ? String((prod.images as Record<string, unknown>[])[0].url || '')
                    : (prod?.image_url ? String(prod.image_url) : null),
                },
                variant: vari ? {
                  id: String(vari.id || ''),
                  name: String(vari.name || ''),
                  price: Number(vari.price || 0),
                } : null,
                quantity: Number(item.quantity || 1),
              };
            });
            set({ items: mapped });
          }
        } catch {
          // If backend fetch fails, keep local state as fallback
        }
      },

      checkoutWithBackend: async (shippingInfo: ShippingInfo, token: string) => {
        const { discount } = get();
        const { data } = await apiClient.post('/store/checkout', {
          shipping_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          shipping_email: shippingInfo.email,
          shipping_address: shippingInfo.address,
          shipping_city: shippingInfo.city,
          shipping_postal_code: shippingInfo.postalCode,
          shipping_country: shippingInfo.country,
          discount_code: discount?.code || undefined,
        });

        // Clear local cart on successful checkout
        set({ items: [], discount: null });

        return { id: data.id, orderNumber: data.order_number || data.orderNumber || data.id };
      },
    }),
    {
      name: 'iloveberlin-cart',
      partialize: (state) => ({
        items: state.items,
        discount: state.discount,
      }),
    },
  ),
);
