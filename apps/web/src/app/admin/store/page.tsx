'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

type ActiveTab = 'products' | 'orders' | 'discounts';
type ProductStatus = 'active' | 'draft' | 'archived';
type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: ProductStatus;
  slug: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: string[];
  shippingAddress: string;
}

interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  uses: number;
  maxUses: number;
  active: boolean;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductForm {
  name: string;
  description: string;
  short_description: string;
  base_price: string;
  compare_at_price: string;
  sku: string;
  stock_quantity: string;
  status: ProductStatus;
  is_featured: boolean;
  category_id: string;
  imageUrl: string;
  imageId: string;
}

interface DiscountForm {
  code: string;
  type: 'percentage' | 'fixed';
  value: string;
  max_uses: string;
  min_order_amount: string;
  description: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

const EMPTY_PRODUCT_FORM: ProductForm = { name: '', description: '', short_description: '', base_price: '', compare_at_price: '', sku: '', stock_quantity: '0', status: 'draft', is_featured: false, category_id: '', imageUrl: '', imageId: '' };
const EMPTY_DISCOUNT_FORM: DiscountForm = { code: '', type: 'percentage', value: '', max_uses: '', min_order_amount: '', description: '', starts_at: '', expires_at: '', is_active: true };

const PRODUCT_STATUS_STYLES: Record<ProductStatus, string> = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-700',
  archived: 'bg-red-100 text-red-700',
};

const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
};

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-700',
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function mapProduct(raw: Record<string, unknown>): Product {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    price: Number(raw.base_price ?? raw.price ?? 0),
    stock: Number(raw.stock_quantity ?? raw.stock ?? 0),
    status: (raw.status as ProductStatus) || 'draft',
    slug: String(raw.slug || ''),
  };
}

function mapOrder(raw: Record<string, unknown>): Order {
  const user = raw.user as Record<string, unknown> | null;
  const items = raw.items as Record<string, unknown>[] | null;
  return {
    id: String(raw.id || ''),
    orderNumber: String(raw.order_number || raw.orderNumber || raw.id || ''),
    customer: String(
      raw.shipping_name || raw.customer ||
      (user ? (user.name || user.username || user.email || 'Unknown') : '') ||
      'Unknown'
    ),
    date: formatDate(String(raw.created_at || raw.createdAt || raw.date || '')),
    status: (raw.status as OrderStatus) || 'pending',
    total: Number(raw.total || 0),
    items: Array.isArray(items) ? items.map((i) => String(i.product_name || i.name || 'Item')) : [],
    shippingAddress: String(raw.shipping_address || raw.shippingAddress || ''),
  };
}

function mapDiscount(raw: Record<string, unknown>): Discount {
  return {
    id: String(raw.id || ''),
    code: String(raw.code || ''),
    type: (raw.type as 'percentage' | 'fixed') || 'percentage',
    value: Number(raw.value || 0),
    uses: Number(raw.used_count ?? raw.uses ?? 0),
    maxUses: Number(raw.max_uses ?? raw.maxUses ?? 0),
    active: Boolean(raw.is_active ?? raw.active ?? true),
  };
}

export default function StoreAdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 20;

  // Inline form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT_FORM);
  const [savingProduct, setSavingProduct] = useState(false);

  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [discountForm, setDiscountForm] = useState<DiscountForm>(EMPTY_DISCOUNT_FORM);
  const [savingDiscount, setSavingDiscount] = useState(false);

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProductStatus, setFilterProductStatus] = useState<string>('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setError(null);
      const params: Record<string, string | number> = { page, limit };
      if (filterProductStatus) params.status = filterProductStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const { data } = await apiClient.get('/store/admin/products', {
        params,
      });
      const raw = Array.isArray(data) ? data : data.data ?? [];
      setProducts(raw.map((p: Record<string, unknown>) => mapProduct(p)));
      setTotalProducts(data.total ?? raw.length);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load products';
      setError(message);
    } finally {
      setLoadingProducts(false);
    }
  }, [page, filterProductStatus, searchQuery]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      setError(null);
      const { data } = await apiClient.get('/store/admin/orders');
      const raw = Array.isArray(data) ? data : data.data ?? data.orders ?? [];
      setOrders(raw.map((o: Record<string, unknown>) => mapOrder(o)));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoadingDiscounts(true);
      setError(null);
      const { data } = await apiClient.get('/store/discounts');
      const raw = Array.isArray(data) ? data : data.data ?? [];
      setDiscounts(raw.map((d: Record<string, unknown>) => mapDiscount(d)));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load discounts';
      setError(message);
    } finally {
      setLoadingDiscounts(false);
    }
  }, []);

  useEffect(() => {
    apiClient.get('/store/categories').then(({ data }) => {
      const cats = Array.isArray(data) ? data : data.data ?? [];
      setCategories(cats.map((c: Record<string, unknown>) => ({ id: String(c.id || ''), name: String(c.name || '') })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'discounts') {
      fetchDiscounts();
    }
  }, [activeTab, fetchProducts, fetchOrders, fetchDiscounts]);

  // Product handlers
  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!productForm.base_price || isNaN(parseFloat(productForm.base_price))) {
      setError('Valid price is required.');
      return;
    }
    setSavingProduct(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        name: productForm.name,
        base_price: parseFloat(productForm.base_price),
        status: productForm.status,
        is_featured: productForm.is_featured,
      };
      if (productForm.description.trim()) payload.description = productForm.description;
      if (productForm.short_description.trim()) payload.short_description = productForm.short_description;
      if (productForm.compare_at_price) payload.compare_at_price = parseFloat(productForm.compare_at_price);
      if (productForm.sku.trim()) payload.sku = productForm.sku;
      if (productForm.stock_quantity) payload.stock_quantity = parseInt(productForm.stock_quantity, 10);
      if (productForm.category_id) payload.category_id = productForm.category_id;
      else payload.category_id = undefined;
      if (productForm.imageUrl) {
        payload.images = [{ url: productForm.imageUrl, is_primary: true }];
      }
      if (editingProductId) {
        await apiClient.put(`/store/products/${editingProductId}`, payload);
      } else {
        if (!payload.description) payload.description = productForm.name;
        await apiClient.post('/store/products', payload);
      }
      setShowProductForm(false);
      setEditingProductId(null);
      setProductForm(EMPTY_PRODUCT_FORM);
      await fetchProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save product';
      setError(message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEditProduct = async (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: '',
      short_description: '',
      base_price: String(product.price),
      compare_at_price: '',
      sku: '',
      stock_quantity: String(product.stock),
      status: product.status,
      is_featured: false,
      category_id: '',
      imageUrl: '',
      imageId: '',
    });
    setShowProductForm(true);
    // Load full product data from admin endpoint
    try {
      const { data: full } = await apiClient.get(`/store/admin/products/${product.slug}`);
      setProductForm({
        name: full.name || product.name,
        description: full.description || '',
        short_description: full.short_description || '',
        base_price: String(full.base_price ?? product.price),
        compare_at_price: full.compare_at_price ? String(full.compare_at_price) : '',
        sku: full.sku || '',
        stock_quantity: String(full.stock_quantity ?? product.stock),
        status: full.status || product.status,
        is_featured: Boolean(full.is_featured),
        category_id: full.category_id || full.category?.id || '',
        imageUrl: full.images?.[0]?.url || '',
        imageId: full.images?.[0]?.id || '',
      });
    } catch {
      // Use sparse data as fallback
    }
  };

  const handleProductStatusChange = async (id: string, newStatus: string) => {
    try {
      setError(null);
      await apiClient.put(`/store/products/${id}`, { status: newStatus });
      await fetchProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update product status';
      setError(message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      setError(null);
      await apiClient.delete(`/store/products/${id}`);
      await fetchProducts();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete product';
      setError(message);
    }
  };

  // Order handlers
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setError(null);
      await apiClient.patch(`/store/admin/orders/${orderId}`, { status: newStatus });
      await fetchOrders();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update order status';
      setError(message);
    }
  };

  // Discount handlers
  const handleSaveDiscount = async () => {
    if (!discountForm.code.trim()) {
      setError('Discount code is required.');
      return;
    }
    if (!discountForm.value || isNaN(parseFloat(discountForm.value))) {
      setError('Valid discount value is required.');
      return;
    }
    setSavingDiscount(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        code: discountForm.code,
        type: discountForm.type,
        value: parseFloat(discountForm.value),
        max_uses: discountForm.max_uses ? parseInt(discountForm.max_uses, 10) : undefined,
        description: discountForm.description || undefined,
        is_active: discountForm.is_active,
      };
      if (discountForm.min_order_amount) payload.min_order_amount = parseFloat(discountForm.min_order_amount);
      if (discountForm.starts_at) payload.starts_at = new Date(discountForm.starts_at).toISOString();
      if (discountForm.expires_at) payload.expires_at = new Date(discountForm.expires_at).toISOString();
      if (editingDiscountId) {
        await apiClient.patch(`/store/discounts/${editingDiscountId}`, payload);
      } else {
        await apiClient.post('/store/discounts', payload);
      }
      setShowDiscountForm(false);
      setEditingDiscountId(null);
      setDiscountForm(EMPTY_DISCOUNT_FORM);
      await fetchDiscounts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save discount';
      setError(message);
    } finally {
      setSavingDiscount(false);
    }
  };

  const handleEditDiscount = async (disc: Discount) => {
    setEditingDiscountId(disc.id);
    setDiscountForm({
      code: disc.code,
      type: disc.type,
      value: String(disc.value),
      max_uses: String(disc.maxUses),
      min_order_amount: '',
      description: '',
      starts_at: '',
      expires_at: '',
      is_active: disc.active,
    });
    setShowDiscountForm(true);
    try {
      const { data: full } = await apiClient.get(`/store/discounts/${disc.id}`);
      setDiscountForm({
        code: full.code || disc.code,
        type: full.type || disc.type,
        value: String(full.value ?? disc.value),
        max_uses: String(full.max_uses ?? disc.maxUses),
        min_order_amount: full.min_order_amount ? String(full.min_order_amount) : '',
        description: full.description || '',
        starts_at: full.starts_at ? full.starts_at.slice(0, 16) : '',
        expires_at: full.expires_at ? full.expires_at.slice(0, 16) : '',
        is_active: full.is_active ?? disc.active,
      });
    } catch {
      // Use sparse data as fallback
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) return;
    try {
      setError(null);
      await apiClient.delete(`/store/discounts/${id}`);
      await fetchDiscounts();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete discount';
      setError(message);
    }
  };

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Orders' },
    { key: 'discounts', label: 'Discount Codes' },
  ];

  const isLoading =
    (activeTab === 'products' && loadingProducts) ||
    (activeTab === 'orders' && loadingOrders) ||
    (activeTab === 'discounts' && loadingDiscounts);

  const totalProductPages = Math.ceil(totalProducts / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Store Management</h2>
        <div className="flex gap-2">
          {activeTab === 'products' && (
            <button
              onClick={() => { setShowProductForm(true); setEditingProductId(null); setProductForm(EMPTY_PRODUCT_FORM); }}
              className="px-3.5 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              + New Product
            </button>
          )}
          {activeTab === 'discounts' && (
            <button
              onClick={() => { setShowDiscountForm(true); setEditingDiscountId(null); setDiscountForm(EMPTY_DISCOUNT_FORM); }}
              className="px-3.5 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              + New Discount
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <>
          {/* Products Tab */}
          {activeTab === 'products' && (
            <>
              {/* Inline Product Form */}
              {showProductForm && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    {editingProductId ? 'Edit Product' : 'Add Product'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2 lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                      <input
                        type="text"
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="BLN-001"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        placeholder="Product description"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                      <input
                        type="text"
                        value={productForm.short_description}
                        onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Brief summary for product cards"
                        maxLength={200}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={productForm.category_id}
                        onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">No category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                      {productForm.imageUrl && (
                        <div className="mb-2 relative inline-block">
                          <img src={productForm.imageUrl} alt="Product" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
                          <button type="button" onClick={() => setProductForm({ ...productForm, imageUrl: '', imageId: '' })} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">x</button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploadingImage(true);
                          setError(null);
                          try {
                            const { data: presign } = await apiClient.post('/media/presign', {
                              filename: file.name, mimetype: file.type, size: file.size, context: 'store',
                            });
                            await fetch(presign.upload_url || presign.uploadUrl, {
                              method: 'PUT', body: file, headers: { 'Content-Type': file.type },
                            });
                            const { data: confirmed } = await apiClient.post('/media/confirm', {
                              media_id: presign.media_id || presign.mediaId || presign.id,
                            });
                            setProductForm((prev) => ({
                              ...prev,
                              imageId: String(confirmed.id || presign.media_id || presign.mediaId || presign.id),
                              imageUrl: String(confirmed.url || presign.url || ''),
                            }));
                          } catch {
                            setError('Failed to upload image.');
                          } finally {
                            setIsUploadingImage(false);
                          }
                        }}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                      {isUploadingImage && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price ({'\u20AC'}) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={productForm.base_price}
                        onChange={(e) => setProductForm({ ...productForm, base_price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Compare at Price ({'\u20AC'})</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={productForm.compare_at_price}
                        onChange={(e) => setProductForm({ ...productForm, compare_at_price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Original price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={productForm.stock_quantity}
                        onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={productForm.status}
                        onChange={(e) => setProductForm({ ...productForm, status: e.target.value as ProductStatus })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.is_featured}
                          onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        Featured product
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSaveProduct}
                      disabled={savingProduct}
                      className="px-3.5 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {savingProduct ? 'Saving...' : editingProductId ? 'Update' : 'Create'}
                    </button>
                    <button
                      onClick={() => { setShowProductForm(false); setEditingProductId(null); }}
                      className="px-3.5 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <select
                  value={filterProductStatus}
                  onChange={(e) => { setFilterProductStatus(e.target.value); setPage(1); }}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {(searchQuery || filterProductStatus) && (
                  <button
                    onClick={() => { setSearchQuery(''); setFilterProductStatus(''); setPage(1); }}
                    className="px-2.5 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Product</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Price</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Stock</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Status</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2">
                            <span className="font-medium text-gray-900">{product.name}</span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {'\u20AC'}{product.price.toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            <span className={product.stock === 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={product.status}
                              onChange={(e) => handleProductStatusChange(product.id, e.target.value)}
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${PRODUCT_STATUS_STYLES[product.status]}`}
                            >
                              {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                              >
                                Edit
                              </button>
                              <Link
                                href={`/store/${product.slug}`}
                                className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                target="_blank"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {products.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No products found.</p>
                  </div>
                )}

                {/* Pagination */}
                {totalProductPages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-200">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1.5 text-sm rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {totalProductPages}
                    </span>
                    <button
                      disabled={page >= totalProductPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1.5 text-sm rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Order #</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Customer</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Date</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Status</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Total</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <>
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2">
                            <span className="font-medium text-gray-900">{order.orderNumber}</span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">{order.customer}</td>
                          <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{order.date}</td>
                          <td className="px-3 py-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${ORDER_STATUS_STYLES[order.status]}`}
                            >
                              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {'\u20AC'}{order.total.toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                className="px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                              >
                                {expandedOrderId === order.id ? 'Hide' : 'View'}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedOrderId === order.id && (
                          <tr key={`${order.id}-detail`} className="bg-gray-50">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="font-medium text-gray-700 mb-1">Customer</p>
                                  <p className="text-gray-600">{order.customer}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700 mb-1">Shipping Address</p>
                                  <p className="text-gray-600">{order.shippingAddress || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700 mb-1">Items</p>
                                  {order.items.length > 0 ? (
                                    <ul className="text-gray-600 list-disc list-inside">
                                      {order.items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-gray-600">No item details available</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {orders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No orders found.</p>
                </div>
              )}
            </div>
          )}

          {/* Discounts Tab */}
          {activeTab === 'discounts' && (
            <>
              {/* Inline Discount Form */}
              {showDiscountForm && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    {editingDiscountId ? 'Edit Discount' : 'Add Discount'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                      <input
                        type="text"
                        value={discountForm.code}
                        onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="DISCOUNT20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                      <select
                        value={discountForm.type}
                        onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value as 'percentage' | 'fixed' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed ({'\u20AC'})</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={discountForm.value}
                        onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder={discountForm.type === 'percentage' ? '20' : '10.00'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                      <input
                        type="number"
                        min="1"
                        value={discountForm.max_uses}
                        onChange={(e) => setDiscountForm({ ...discountForm, max_uses: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Unlimited"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={discountForm.description}
                        onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount ({'\u20AC'})</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={discountForm.min_order_amount}
                        onChange={(e) => setDiscountForm({ ...discountForm, min_order_amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="No minimum"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Starts At</label>
                      <input
                        type="datetime-local"
                        value={discountForm.starts_at}
                        onChange={(e) => setDiscountForm({ ...discountForm, starts_at: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                      <input
                        type="datetime-local"
                        value={discountForm.expires_at}
                        onChange={(e) => setDiscountForm({ ...discountForm, expires_at: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={discountForm.is_active}
                          onChange={(e) => setDiscountForm({ ...discountForm, is_active: e.target.checked })}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        Active
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSaveDiscount}
                      disabled={savingDiscount}
                      className="px-3.5 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {savingDiscount ? 'Saving...' : editingDiscountId ? 'Update' : 'Create'}
                    </button>
                    <button
                      onClick={() => { setShowDiscountForm(false); setEditingDiscountId(null); }}
                      className="px-3.5 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Code</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Type</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Value</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Uses</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Active</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discounts.map((disc) => (
                        <tr key={disc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2">
                            <span className="font-mono font-medium text-gray-900">{disc.code}</span>
                          </td>
                          <td className="px-3 py-2 text-gray-600 capitalize">{disc.type}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {disc.type === 'percentage' ? `${disc.value}%` : `\u20AC${disc.value.toFixed(2)}`}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {disc.uses} / {disc.maxUses}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              disc.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {disc.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditDiscount(disc)}
                                className="px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteDiscount(disc.id)}
                                className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {discounts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No discount codes found.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      <div className="mt-6">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
