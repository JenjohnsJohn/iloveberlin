'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

// ─── Constants ────────────────────────────────────────────────

const SECTIONS = ['hero', 'trending', 'events', 'weekend', 'dining', 'videos', 'competitions', 'classifieds'] as const;
type SectionName = (typeof SECTIONS)[number];

const SECTION_LABELS: Record<SectionName, string> = {
  hero: 'Hero',
  trending: 'Trending',
  events: 'Events',
  weekend: 'Weekend',
  dining: 'Dining',
  videos: 'Videos',
  competitions: 'Competitions',
  classifieds: 'Classifieds',
};

const CONTENT_ENDPOINTS: Record<string, string> = {
  article: '/articles',
  event: '/events',
  restaurant: '/dining/restaurants',
  video: '/videos',
  competition: '/competitions',
  classified: '/classifieds',
  guide: '/guides',
  product: '/store/products',
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  article: 'Article',
  event: 'Event',
  restaurant: 'Restaurant',
  video: 'Video',
  competition: 'Competition',
  classified: 'Classified',
  guide: 'Guide',
  product: 'Product',
};

// ─── Types ────────────────────────────────────────────────────

interface HomepageItem {
  id: string;
  content_type: string;
  content_id: string;
  title: string | null;
  sort_order: number;
}

interface SearchResult {
  id: string;
  title?: string;
  name?: string;
}

type SectionsData = Record<string, HomepageItem[]>;

// ─── Mappers ──────────────────────────────────────────────────

function mapItem(raw: Record<string, unknown>): HomepageItem {
  return {
    id: String(raw.id || ''),
    content_type: String(raw.content_type ?? raw.contentType ?? ''),
    content_id: String(raw.content_id ?? raw.contentId ?? ''),
    title: raw.title != null ? String(raw.title) : null,
    sort_order: Number(raw.sort_order ?? raw.sortOrder ?? 0),
  };
}

// ─── Component ────────────────────────────────────────────────

export default function HomepageManagementPage() {
  const [sections, setSections] = useState<SectionsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SectionName>('hero');

  // Content picker modal state
  const [showPicker, setShowPicker] = useState(false);
  const [pickerContentType, setPickerContentType] = useState<string>('article');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerResults, setPickerResults] = useState<SearchResult[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<SearchResult | null>(null);

  // ─── Fetch sections data ──────────────────────────────────

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/homepage');
      const mapped: SectionsData = {};
      for (const section of SECTIONS) {
        const raw = data[section];
        mapped[section] = Array.isArray(raw)
          ? raw.map((item: Record<string, unknown>) => mapItem(item))
          : [];
      }
      setSections(mapped);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load homepage data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // ─── Current section items ────────────────────────────────

  const currentItems = sections[activeTab] ?? [];

  // ─── Reorder items ────────────────────────────────────────

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const items = [...currentItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    [items[index], items[targetIndex]] = [items[targetIndex], items[index]];

    // Reassign sort_order
    const reordered = items.map((item, i) => ({ ...item, sort_order: i }));
    setSections((prev) => ({ ...prev, [activeTab]: reordered }));
  };

  // ─── Remove item ──────────────────────────────────────────

  const removeItem = async (item: HomepageItem) => {
    try {
      setError(null);
      await apiClient.delete(`/admin/homepage/items/${item.id}`);
      const updated = currentItems
        .filter((i) => i.id !== item.id)
        .map((i, idx) => ({ ...i, sort_order: idx }));
      setSections((prev) => ({ ...prev, [activeTab]: updated }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove item';
      setError(message);
    }
  };

  // ─── Save section ─────────────────────────────────────────

  const saveSection = async () => {
    try {
      setSaving(true);
      setError(null);
      const items = currentItems.map((item) => ({
        content_type: item.content_type,
        content_id: item.content_id,
        sort_order: item.sort_order,
      }));
      await apiClient.patch(`/admin/homepage/sections/${activeTab}`, { items });
      await fetchSections();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save section';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Content picker search ────────────────────────────────

  const searchContent = async () => {
    if (!pickerSearch.trim()) return;
    const endpoint = CONTENT_ENDPOINTS[pickerContentType];
    if (!endpoint) return;

    try {
      setPickerLoading(true);
      const { data } = await apiClient.get(
        `${endpoint}?search=${encodeURIComponent(pickerSearch)}&limit=10`,
      );
      const list = Array.isArray(data) ? data : (data.data ?? []);
      setPickerResults(
        list.map((item: Record<string, unknown>) => ({
          id: String(item.id || ''),
          title: item.title != null ? String(item.title) : undefined,
          name: item.name != null ? String(item.name) : undefined,
        })),
      );
    } catch {
      setPickerResults([]);
    } finally {
      setPickerLoading(false);
    }
  };

  const addSelectedItem = () => {
    if (!pickerSelected) return;

    const displayTitle =
      pickerSelected.title || pickerSelected.name || `${pickerContentType} #${pickerSelected.id}`;
    const newItem: HomepageItem = {
      id: `temp-${Date.now()}`,
      content_type: pickerContentType,
      content_id: pickerSelected.id,
      title: displayTitle,
      sort_order: currentItems.length,
    };

    setSections((prev) => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] ?? []), newItem],
    }));

    // Reset picker
    setShowPicker(false);
    setPickerSearch('');
    setPickerResults([]);
    setPickerSelected(null);
  };

  const openPicker = () => {
    setPickerContentType('article');
    setPickerSearch('');
    setPickerResults([]);
    setPickerSelected(null);
    setShowPicker(true);
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Homepage Management</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-6 w-6 text-primary-600 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-500">Loading homepage data...</span>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
            {SECTIONS.map((section) => (
              <div key={section} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <p className="text-sm text-gray-500">{SECTION_LABELS[section]}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {(sections[section] ?? []).length}
                </p>
              </div>
            ))}
          </div>

          {/* Section Tabs */}
          <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
            {SECTIONS.map((section) => (
              <button
                key={section}
                onClick={() => setActiveTab(section)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === section
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {SECTION_LABELS[section]}
              </button>
            ))}
          </div>

          {/* Active Section Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                {SECTION_LABELS[activeTab]} Items
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={openPicker}
                  className="px-3.5 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  + Add Item
                </button>
                <button
                  onClick={saveSection}
                  disabled={saving}
                  className="px-3.5 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Section'}
                </button>
              </div>
            </div>

            {currentItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No items in this section.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Order
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Sort Order
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Move up"
                          >
                            &#9650;
                          </button>
                          <button
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === currentItems.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Move down"
                          >
                            &#9660;
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {CONTENT_TYPE_LABELS[item.content_type] || item.content_type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {item.title || `${item.content_type} #${item.content_id}`}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">{item.sort_order}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => removeItem(item)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Content Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowPicker(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-4 z-10">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Add Content Item</h3>

            {/* Content type dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
              <select
                value={pickerContentType}
                onChange={(e) => {
                  setPickerContentType(e.target.value);
                  setPickerResults([]);
                  setPickerSelected(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {Object.keys(CONTENT_ENDPOINTS).map((type) => (
                  <option key={type} value={type}>
                    {CONTENT_TYPE_LABELS[type] || type}
                  </option>
                ))}
              </select>
            </div>

            {/* Search input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchContent()}
                  placeholder={`Search ${CONTENT_TYPE_LABELS[pickerContentType] || pickerContentType}s...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  onClick={searchContent}
                  disabled={pickerLoading}
                  className="px-3.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {pickerLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Results list */}
            {pickerResults.length > 0 && (
              <div className="mb-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {pickerResults.map((result) => {
                  const isSelected = pickerSelected?.id === result.id;
                  return (
                    <button
                      key={result.id}
                      onClick={() => setPickerSelected(result)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {result.title || result.name || `#${result.id}`}
                    </button>
                  );
                })}
              </div>
            )}

            {pickerResults.length === 0 && pickerSearch && !pickerLoading && (
              <p className="mb-4 text-sm text-gray-500">No results found.</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={addSelectedItem}
                disabled={!pickerSelected}
                className="px-3.5 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Add to Section
              </button>
              <button
                onClick={() => setShowPicker(false)}
                className="px-3.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
