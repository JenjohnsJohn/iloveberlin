'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { buildRestaurantUrl } from '@/lib/dining-seo-utils';

type Tab = 'restaurants' | 'cuisines' | 'offers';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  district: string | null;
  priceRange: string;
  rating: number | null;
  status: string;
  cuisines: string[];
  primaryCuisineSlug: string | null;
  createdAt: string;
}

interface Cuisine {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  restaurantCount: number;
}

interface Offer {
  id: string;
  title: string;
  restaurantName: string;
  restaurantId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface RestaurantForm {
  name: string;
  address: string;
  description: string;
  price_range: string;
  phone: string;
  website: string;
  email: string;
  district: string;
  rating: string;
  cuisine_ids: string[];
  featured_image_id: string;
}

interface CuisineForm {
  name: string;
  description: string;
}

interface OfferForm {
  title: string;
  description: string;
  restaurant_id: string;
  start_date: string;
  end_date: string;
}

interface CuisineOption {
  id: string;
  name: string;
}

const EMPTY_RESTAURANT_FORM: RestaurantForm = { name: '', address: '', description: '', price_range: 'moderate', phone: '', website: '', email: '', district: '', rating: '', cuisine_ids: [], featured_image_id: '' };
const EMPTY_CUISINE_FORM: CuisineForm = { name: '', description: '' };
const EMPTY_OFFER_FORM: OfferForm = { title: '', description: '', restaurant_id: '', start_date: '', end_date: '' };

function priceLabel(range: string): string {
  switch (range) {
    case 'budget': return '$';
    case 'moderate': return '$$';
    case 'upscale': return '$$$';
    case 'fine_dining': return '$$$$';
    default: return '$$';
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-700';
    case 'draft': return 'bg-yellow-100 text-yellow-700';
    case 'archived': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function mapRestaurant(raw: Record<string, unknown>): Restaurant {
  const cuisineRel = raw.cuisines;
  let cuisineNames: string[] = [];
  if (Array.isArray(cuisineRel)) {
    cuisineNames = cuisineRel.map((c: unknown) =>
      typeof c === 'string' ? c : String((c as Record<string, unknown>).name || '')
    );
  }
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    slug: String(raw.slug || ''),
    district: (raw.district || null) as string | null,
    priceRange: String(raw.price_range || raw.priceRange || 'moderate'),
    rating: raw.rating != null ? Number(raw.rating) : null,
    status: String(raw.status || 'draft'),
    cuisines: cuisineNames,
    primaryCuisineSlug: Array.isArray(cuisineRel) && cuisineRel.length > 0
      ? String((cuisineRel[0] as Record<string, unknown>)?.slug || '')
      : null,
    createdAt: String(raw.created_at || raw.createdAt || ''),
  };
}

function mapCuisine(raw: Record<string, unknown>): Cuisine {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    slug: String(raw.slug || ''),
    sortOrder: Number(raw.sortOrder ?? raw.sort_order ?? 0),
    restaurantCount: Number(raw.restaurantCount ?? raw.restaurant_count ?? 0),
  };
}

function mapOffer(raw: Record<string, unknown>): Offer {
  const restaurant = raw.restaurant as Record<string, unknown> | null;
  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    restaurantName: String(raw.restaurantName || raw.restaurant_name || restaurant?.name || ''),
    restaurantId: String(raw.restaurant_id || restaurant?.id || ''),
    startDate: String(raw.startDate || raw.start_date || ''),
    endDate: String(raw.endDate || raw.end_date || ''),
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
  };
}

export default function DiningAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('restaurants');

  // Restaurants state
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [restaurantsError, setRestaurantsError] = useState<string | null>(null);
  const [restaurantsPage, setRestaurantsPage] = useState(1);
  const [restaurantsTotalPages, setRestaurantsTotalPages] = useState(1);

  // Cuisines state
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [cuisinesLoading, setCuisinesLoading] = useState(true);
  const [cuisinesError, setCuisinesError] = useState<string | null>(null);

  // Offers state
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);

  // Inline form states
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineOptions, setCuisineOptions] = useState<CuisineOption[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);
  const [restaurantForm, setRestaurantForm] = useState<RestaurantForm>(EMPTY_RESTAURANT_FORM);
  const [savingRestaurant, setSavingRestaurant] = useState(false);

  const [showCuisineForm, setShowCuisineForm] = useState(false);
  const [editingCuisineId, setEditingCuisineId] = useState<string | null>(null);
  const [cuisineForm, setCuisineForm] = useState<CuisineForm>(EMPTY_CUISINE_FORM);
  const [savingCuisine, setSavingCuisine] = useState(false);

  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState<OfferForm>(EMPTY_OFFER_FORM);
  const [savingOffer, setSavingOffer] = useState(false);

  const limit = 20;

  const fetchRestaurants = useCallback(async () => {
    setRestaurantsLoading(true);
    setRestaurantsError(null);
    try {
      const params: Record<string, unknown> = { page: restaurantsPage, limit };
      if (searchQuery) params.search = searchQuery;
      const { data } = await apiClient.get('/dining/restaurants/admin/list', { params });
      if (Array.isArray(data)) {
        setRestaurants(data.map((r: Record<string, unknown>) => mapRestaurant(r)));
        setRestaurantsTotalPages(1);
      } else {
        const raw = data.data || data.restaurants || data.items || [];
        setRestaurants(raw.map((r: Record<string, unknown>) => mapRestaurant(r)));
        const total = data.total || data.totalCount || 0;
        setRestaurantsTotalPages(Math.max(1, Math.ceil(total / limit)));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load restaurants';
      setRestaurantsError(message);
    } finally {
      setRestaurantsLoading(false);
    }
  }, [restaurantsPage, searchQuery]);

  const fetchCuisines = useCallback(async () => {
    setCuisinesLoading(true);
    setCuisinesError(null);
    try {
      const { data } = await apiClient.get('/dining/cuisines');
      if (Array.isArray(data)) {
        setCuisines(data.map((c: Record<string, unknown>) => mapCuisine(c)));
      } else {
        const raw = data.data || data.cuisines || data.items || [];
        setCuisines(raw.map((c: Record<string, unknown>) => mapCuisine(c)));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load cuisines';
      setCuisinesError(message);
    } finally {
      setCuisinesLoading(false);
    }
  }, []);

  const fetchOffers = useCallback(async () => {
    setOffersLoading(true);
    setOffersError(null);
    try {
      const { data } = await apiClient.get('/dining/offers');
      if (Array.isArray(data)) {
        setOffers(data.map((o: Record<string, unknown>) => mapOffer(o)));
      } else {
        const raw = data.data || data.offers || data.items || [];
        setOffers(raw.map((o: Record<string, unknown>) => mapOffer(o)));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load offers';
      setOffersError(message);
    } finally {
      setOffersLoading(false);
    }
  }, []);

  // Fetch cuisine options for restaurant form multi-select
  useEffect(() => {
    apiClient.get('/dining/cuisines').then(({ data }) => {
      const items = Array.isArray(data) ? data : data.data ?? [];
      setCuisineOptions(items.map((c: Record<string, unknown>) => ({
        id: String(c.id || ''),
        name: String(c.name || ''),
      })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    fetchCuisines();
  }, [fetchCuisines]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Restaurant handlers
  const handleSaveRestaurant = async () => {
    if (!restaurantForm.name.trim()) {
      setRestaurantsError('Restaurant name is required.');
      return;
    }
    setSavingRestaurant(true);
    setRestaurantsError(null);
    try {
      const payload: Record<string, unknown> = {
        name: restaurantForm.name,
        description: restaurantForm.description,
        address: restaurantForm.address,
        price_range: restaurantForm.price_range,
      };
      if (restaurantForm.phone) payload.phone = restaurantForm.phone;
      if (restaurantForm.website) payload.website = restaurantForm.website;
      if (restaurantForm.email) payload.email = restaurantForm.email;
      if (restaurantForm.district) payload.district = restaurantForm.district;
      if (restaurantForm.rating) payload.rating = Number(restaurantForm.rating);
      if (restaurantForm.cuisine_ids.length > 0) payload.cuisine_ids = restaurantForm.cuisine_ids;
      if (restaurantForm.featured_image_id) payload.featured_image_id = restaurantForm.featured_image_id;

      if (editingRestaurantId) {
        await apiClient.patch(`/dining/restaurants/${editingRestaurantId}`, payload);
      } else {
        await apiClient.post('/dining/restaurants', payload);
      }
      setShowRestaurantForm(false);
      setEditingRestaurantId(null);
      setRestaurantForm(EMPTY_RESTAURANT_FORM);
      await fetchRestaurants();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save restaurant';
      setRestaurantsError(message);
    } finally {
      setSavingRestaurant(false);
    }
  };

  const handleEditRestaurant = async (r: Restaurant) => {
    setEditingRestaurantId(r.id);
    setRestaurantsError(null);
    try {
      const { data } = await apiClient.get(`/dining/restaurants/admin/${r.slug}`);
      const raw = data.data ?? data;
      const cuisineRel = raw.cuisines;
      const cuisineIds: string[] = Array.isArray(cuisineRel)
        ? cuisineRel.map((c: Record<string, unknown>) => String(c.id || ''))
        : [];
      const featImg = raw.featured_image as Record<string, unknown> | null;
      setRestaurantForm({
        name: String(raw.name || ''),
        address: String(raw.address || ''),
        description: String(raw.description || ''),
        price_range: String(raw.price_range || raw.priceRange || 'moderate'),
        phone: String(raw.phone || ''),
        website: String(raw.website || ''),
        email: String(raw.email || ''),
        district: String(raw.district || ''),
        rating: raw.rating != null ? String(raw.rating) : '',
        cuisine_ids: cuisineIds,
        featured_image_id: String(raw.featured_image_id || ''),
      });
      setFeaturedImageUrl(featImg?.url ? String(featImg.url) : null);
    } catch {
      setRestaurantForm({
        name: r.name,
        address: '',
        description: '',
        price_range: r.priceRange,
        phone: '',
        website: '',
        email: '',
        district: r.district || '',
        rating: r.rating != null ? String(r.rating) : '',
        cuisine_ids: [],
        featured_image_id: '',
      });
      setFeaturedImageUrl(null);
    }
    setShowRestaurantForm(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setRestaurantsError(null);
      await apiClient.patch(`/dining/restaurants/${id}`, { status: newStatus });
      await fetchRestaurants();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update restaurant status';
      setRestaurantsError(message);
    }
  };

  const handleDeleteRestaurant = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await apiClient.delete(`/dining/restaurants/${id}`);
      fetchRestaurants();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete restaurant';
      setRestaurantsError(message);
    }
  };

  // Cuisine handlers
  const handleSaveCuisine = async () => {
    if (!cuisineForm.name.trim()) {
      setCuisinesError('Cuisine name is required.');
      return;
    }
    setSavingCuisine(true);
    setCuisinesError(null);
    try {
      if (editingCuisineId) {
        await apiClient.patch(`/dining/cuisines/${editingCuisineId}`, cuisineForm);
      } else {
        await apiClient.post('/dining/cuisines', cuisineForm);
      }
      setShowCuisineForm(false);
      setEditingCuisineId(null);
      setCuisineForm(EMPTY_CUISINE_FORM);
      await fetchCuisines();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save cuisine';
      setCuisinesError(message);
    } finally {
      setSavingCuisine(false);
    }
  };

  const handleEditCuisine = (c: Cuisine) => {
    setEditingCuisineId(c.id);
    setCuisineForm({ name: c.name, description: '' });
    setShowCuisineForm(true);
  };

  const handleDeleteCuisine = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete cuisine "${name}"?`)) return;
    try {
      await apiClient.delete(`/dining/cuisines/${id}`);
      fetchCuisines();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete cuisine';
      setCuisinesError(message);
    }
  };

  // Offer handlers
  const handleSaveOffer = async () => {
    if (!offerForm.title.trim()) {
      setOffersError('Offer title is required.');
      return;
    }
    setSavingOffer(true);
    setOffersError(null);
    try {
      if (editingOfferId) {
        const offerPayload: Record<string, unknown> = {
          title: offerForm.title,
          description: offerForm.description,
        };
        if (offerForm.start_date) offerPayload.start_date = offerForm.start_date;
        if (offerForm.end_date) offerPayload.end_date = offerForm.end_date;
        if (offerForm.restaurant_id) offerPayload.restaurant_id = offerForm.restaurant_id;
        await apiClient.patch(`/dining/offers/${editingOfferId}`, offerPayload);
      } else {
        await apiClient.post('/dining/offers', offerForm);
      }
      setShowOfferForm(false);
      setEditingOfferId(null);
      setOfferForm(EMPTY_OFFER_FORM);
      await fetchOffers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save offer';
      setOffersError(message);
    } finally {
      setSavingOffer(false);
    }
  };

  const handleEditOffer = (o: Offer) => {
    setEditingOfferId(o.id);
    setOfferForm({
      title: o.title,
      description: '',
      restaurant_id: o.restaurantId,
      start_date: o.startDate,
      end_date: o.endDate,
    });
    setShowOfferForm(true);
  };

  const handleDeleteOffer = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete offer "${title}"?`)) return;
    try {
      await apiClient.delete(`/dining/offers/${id}`);
      fetchOffers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete offer';
      setOffersError(message);
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setRestaurantsError(null);
    try {
      const { data: presign } = await apiClient.post('/media/presign', {
        filename: file.name,
        mimetype: file.type,
        size: file.size,
        context: 'restaurant',
      });
      await fetch(presign.upload_url || presign.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      const { data: confirmed } = await apiClient.post('/media/confirm', {
        media_id: presign.media_id || presign.mediaId || presign.id,
      });
      const mediaId = String(confirmed.id || presign.media_id || presign.mediaId || presign.id);
      const mediaUrl = String(confirmed.url || presign.url || '');
      setRestaurantForm((prev) => ({ ...prev, featured_image_id: mediaId }));
      setFeaturedImageUrl(mediaUrl);
    } catch {
      setRestaurantsError('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <span className="ml-3 text-gray-500">Loading...</span>
    </div>
  );

  const renderError = (message: string) => (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      {message}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Dining Management</h2>
        <div className="flex gap-2">
          <Link
            href="/dining"
            className="px-3.5 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Public Page
          </Link>
          {activeTab === 'restaurants' && (
            <button
              onClick={() => { setShowRestaurantForm(true); setEditingRestaurantId(null); setRestaurantForm(EMPTY_RESTAURANT_FORM); setFeaturedImageUrl(null); }}
              className="px-3.5 py-1.5 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Add Restaurant
            </button>
          )}
          {activeTab === 'cuisines' && (
            <button
              onClick={() => { setShowCuisineForm(true); setEditingCuisineId(null); setCuisineForm(EMPTY_CUISINE_FORM); }}
              className="px-3.5 py-1.5 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Add Cuisine
            </button>
          )}
          {activeTab === 'offers' && (
            <button
              onClick={() => { setShowOfferForm(true); setEditingOfferId(null); setOfferForm(EMPTY_OFFER_FORM); }}
              className="px-3.5 py-1.5 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Add Offer
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {(['restaurants', 'cuisines', 'offers'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Restaurants Tab */}
      {activeTab === 'restaurants' && (
        <>
          {restaurantsError && renderError(restaurantsError)}

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setRestaurantsPage(1); }}
              placeholder="Search restaurants..."
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm w-64"
            />
          </div>

          {/* Inline Restaurant Form */}
          {showRestaurantForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {editingRestaurantId ? 'Edit Restaurant' : 'Add Restaurant'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={restaurantForm.name}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Restaurant name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={restaurantForm.address}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input
                    type="text"
                    value={restaurantForm.district}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g. Mitte, Kreuzberg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <select
                    value={restaurantForm.price_range}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, price_range: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="budget">$ Budget</option>
                    <option value="moderate">$$ Moderate</option>
                    <option value="upscale">$$$ Upscale</option>
                    <option value="fine_dining">$$$$ Fine Dining</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={restaurantForm.phone}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+49 30 ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="text"
                    value={restaurantForm.website}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={restaurantForm.email}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="info@restaurant.de"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={restaurantForm.rating}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, rating: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="4.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={restaurantForm.description}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Restaurant description"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuisines</label>
                  <div className="flex flex-wrap gap-2">
                    {cuisineOptions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setRestaurantForm((prev) => ({
                            ...prev,
                            cuisine_ids: prev.cuisine_ids.includes(c.id)
                              ? prev.cuisine_ids.filter((id) => id !== c.id)
                              : [...prev.cuisine_ids, c.id],
                          }));
                        }}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          restaurantForm.cuisine_ids.includes(c.id)
                            ? 'bg-orange-100 text-orange-700 border-orange-300'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                    {cuisineOptions.length === 0 && (
                      <span className="text-xs text-gray-400">No cuisines available. Add cuisines in the Cuisines tab first.</span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                  {featuredImageUrl && (
                    <div className="mb-2 relative inline-block">
                      <img src={featuredImageUrl} alt="Featured" className="h-24 w-auto rounded-lg border border-gray-200 object-cover" />
                      <button
                        type="button"
                        onClick={() => { setFeaturedImageUrl(null); setRestaurantForm((prev) => ({ ...prev, featured_image_id: '' })); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        x
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                    disabled={isUploading}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {isUploading && <span className="text-xs text-gray-500 ml-2">Uploading...</span>}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveRestaurant}
                  disabled={savingRestaurant}
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {savingRestaurant ? 'Saving...' : editingRestaurantId ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => { setShowRestaurantForm(false); setEditingRestaurantId(null); }}
                  className="px-3.5 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {restaurantsLoading ? renderLoading() : (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuisines</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {restaurants.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{r.name}</div>
                          <div className="text-xs text-gray-500">{r.slug}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{r.district || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-1">
                            {(r.cuisines || []).map((c) => (
                              <span key={c} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full">{c}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">{priceLabel(r.priceRange)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{r.rating ? Number(r.rating).toFixed(1) : '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={r.status}
                            onChange={(e) => handleStatusChange(r.id, e.target.value)}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer capitalize ${statusColor(r.status)}`}
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <button
                            className="text-primary-600 hover:text-primary-700 font-medium mr-3"
                            onClick={() => handleEditRestaurant(r)}
                          >Edit</button>
                          <Link
                            href={buildRestaurantUrl(r.slug, r.primaryCuisineSlug)}
                            className="text-gray-600 hover:text-gray-700 font-medium mr-3"
                            target="_blank"
                          >View</Link>
                          <button
                            className="text-red-600 hover:text-red-700 font-medium"
                            onClick={() => handleDeleteRestaurant(r.id, r.name)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {restaurants.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                          No restaurants found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {restaurantsTotalPages > 1 && (
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm text-gray-500">Page {restaurantsPage} of {restaurantsTotalPages}</p>
                  <div className="flex gap-2">
                    <button
                      disabled={restaurantsPage <= 1}
                      onClick={() => setRestaurantsPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      disabled={restaurantsPage >= restaurantsTotalPages}
                      onClick={() => setRestaurantsPage((p) => p + 1)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Cuisines Tab */}
      {activeTab === 'cuisines' && (
        <div>
          {cuisinesError && renderError(cuisinesError)}

          {/* Inline Cuisine Form */}
          {showCuisineForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {editingCuisineId ? 'Edit Cuisine' : 'Add Cuisine'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={cuisineForm.name}
                    onChange={(e) => setCuisineForm({ ...cuisineForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Cuisine name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={cuisineForm.description}
                    onChange={(e) => setCuisineForm({ ...cuisineForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Brief description"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveCuisine}
                  disabled={savingCuisine}
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {savingCuisine ? 'Saving...' : editingCuisineId ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => { setShowCuisineForm(false); setEditingCuisineId(null); }}
                  className="px-3.5 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {cuisinesLoading ? renderLoading() : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurants</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cuisines.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{c.slug}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{c.sortOrder}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{c.restaurantCount}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <button
                          className="text-primary-600 hover:text-primary-700 font-medium mr-3"
                          onClick={() => handleEditCuisine(c)}
                        >Edit</button>
                        <button
                          className="text-red-600 hover:text-red-700 font-medium"
                          onClick={() => handleDeleteCuisine(c.id, c.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cuisines.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        No cuisines found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <div>
          {offersError && renderError(offersError)}

          {/* Inline Offer Form */}
          {showOfferForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {editingOfferId ? 'Edit Offer' : 'Add Offer'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={offerForm.title}
                    onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Offer title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={offerForm.description}
                    onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant *</label>
                  <select
                    value={offerForm.restaurant_id}
                    onChange={(e) => setOfferForm({ ...offerForm, restaurant_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select restaurant...</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={offerForm.start_date}
                      onChange={(e) => setOfferForm({ ...offerForm, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      value={offerForm.end_date}
                      onChange={(e) => setOfferForm({ ...offerForm, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveOffer}
                  disabled={savingOffer}
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {savingOffer ? 'Saving...' : editingOfferId ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => { setShowOfferForm(false); setEditingOfferId(null); }}
                  className="px-3.5 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {offersLoading ? renderLoading() : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {offers.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{o.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{o.restaurantName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {o.startDate} to {o.endDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          o.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {o.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <button
                          className="text-primary-600 hover:text-primary-700 font-medium mr-3"
                          onClick={() => handleEditOffer(o)}
                        >Edit</button>
                        <button
                          className="text-red-600 hover:text-red-700 font-medium"
                          onClick={() => handleDeleteOffer(o.id, o.title)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {offers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        No offers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
