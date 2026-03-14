'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface Cuisine {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  parent_id: string | null;
  restaurant_count?: number;
}

export default function CuisinesPage() {
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCuisine, setEditingCuisine] = useState<Cuisine | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
  });

  const fetchCuisines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/dining/cuisines');
      const list = Array.isArray(data) ? data : (data.data ?? data.cuisines ?? []);
      setCuisines(list);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load cuisines';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCuisines();
  }, [fetchCuisines]);

  // --- Hierarchical helpers ---

  const getParents = () =>
    cuisines.filter((c) => c.parent_id === null).sort((a, b) => a.sort_order - b.sort_order);

  const getChildrenOf = (parentId: string) =>
    cuisines.filter((c) => c.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order);

  // Smart search: parent shows when child matches, all children show when parent matches
  const buildDisplayList = (): Array<{ cuisine: Cuisine; isChild: boolean; childCount: number }> => {
    const parents = getParents();
    const result: Array<{ cuisine: Cuisine; isChild: boolean; childCount: number }> = [];

    if (!searchQuery.trim()) {
      for (const parent of parents) {
        const children = getChildrenOf(parent.id);
        result.push({ cuisine: parent, isChild: false, childCount: children.length });
        for (const child of children) {
          result.push({ cuisine: child, isChild: true, childCount: 0 });
        }
      }
      // Orphaned children (parent_id set but parent not in list)
      const parentIds = new Set(parents.map((p) => p.id));
      cuisines
        .filter((c) => c.parent_id && !parentIds.has(c.parent_id))
        .sort((a, b) => a.sort_order - b.sort_order)
        .forEach((orphan) => result.push({ cuisine: orphan, isChild: true, childCount: 0 }));
      return result;
    }

    // Search mode: show parents that match OR have matching children
    const q = searchQuery.toLowerCase().trim();
    for (const parent of parents) {
      const allChildren = getChildrenOf(parent.id);
      const parentMatches = parent.name.toLowerCase().includes(q);
      const matchingChildren = allChildren.filter((c) => c.name.toLowerCase().includes(q));

      if (parentMatches || matchingChildren.length > 0) {
        result.push({ cuisine: parent, isChild: false, childCount: allChildren.length });
        const childrenToShow = parentMatches ? allChildren : matchingChildren;
        for (const child of childrenToShow) {
          result.push({ cuisine: child, isChild: true, childCount: 0 });
        }
      }
    }

    // Orphans in search mode
    const parentIds = new Set(parents.map((p) => p.id));
    cuisines
      .filter((c) => c.parent_id && !parentIds.has(c.parent_id) && c.name.toLowerCase().includes(q))
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach((orphan) => result.push({ cuisine: orphan, isChild: true, childCount: 0 }));

    return result;
  };

  const displayList = buildDisplayList();

  // --- Sibling-aware reordering ---

  const getSiblings = (cuisine: Cuisine): Cuisine[] => {
    return cuisines
      .filter((c) => c.parent_id === cuisine.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  const isFirstAmongSiblings = (cuisine: Cuisine): boolean => {
    const siblings = getSiblings(cuisine);
    return siblings.length === 0 || siblings[0].id === cuisine.id;
  };

  const isLastAmongSiblings = (cuisine: Cuisine): boolean => {
    const siblings = getSiblings(cuisine);
    return siblings.length === 0 || siblings[siblings.length - 1].id === cuisine.id;
  };

  const moveSibling = async (cuisine: Cuisine, direction: 'up' | 'down') => {
    const siblings = getSiblings(cuisine);
    const index = siblings.findIndex((c) => c.id === cuisine.id);
    if (index < 0) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index >= siblings.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const swapCuisine = siblings[swapIndex];
    const currentOrder = cuisine.sort_order;
    const swapOrder = swapCuisine.sort_order;

    // Optimistic update
    setCuisines((prev) =>
      prev.map((c) => {
        if (c.id === cuisine.id) return { ...c, sort_order: swapOrder };
        if (c.id === swapCuisine.id) return { ...c, sort_order: currentOrder };
        return c;
      })
    );

    try {
      setError(null);
      await apiClient.patch(`/dining/cuisines/${cuisine.id}`, { sort_order: swapOrder });
      await apiClient.patch(`/dining/cuisines/${swapCuisine.id}`, { sort_order: currentOrder });
      await fetchCuisines();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to reorder cuisines';
      setError(message);
      await fetchCuisines();
    }
  };

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () => setCollapsed(new Set(getParents().map((p) => p.id)));

  // --- CRUD ---

  const openCreateModal = () => {
    setEditingCuisine(null);
    setFormData({ name: '', parent_id: '' });
    setShowModal(true);
  };

  const openEditModal = (cuisine: Cuisine) => {
    setEditingCuisine(cuisine);
    setFormData({
      name: cuisine.name,
      parent_id: cuisine.parent_id || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      setError(null);

      if (editingCuisine) {
        // Omit sort_order on edit to preserve existing value
        const payload = {
          name: formData.name,
          parent_id: formData.parent_id || null,
        };
        await apiClient.patch(`/dining/cuisines/${editingCuisine.id}`, payload);
      } else {
        // Compute sort_order for new cuisine based on siblings
        const parentId = formData.parent_id || null;
        const siblings = cuisines.filter((c) => c.parent_id === parentId);
        const sortOrder = siblings.length > 0
          ? Math.max(...siblings.map((s) => s.sort_order)) + 1
          : 0;
        const payload = {
          name: formData.name,
          parent_id: parentId,
          sort_order: sortOrder,
        };
        await apiClient.post('/dining/cuisines', payload);
      }

      setShowModal(false);
      await fetchCuisines();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save cuisine';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await apiClient.delete(`/dining/cuisines/${id}`);
      setDeleteConfirm(null);
      await fetchCuisines();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete cuisine';
      setError(message);
    }
  };

  // Get top-level cuisines for the parent dropdown
  const topLevelCuisines = cuisines.filter((c) => c.parent_id === null);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cuisines</h2>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {displayList.length} {displayList.length === 1 ? 'cuisine' : 'cuisines'}
              {searchQuery && ' found'}
            </p>
          )}
        </div>
        <button
          onClick={openCreateModal}
          className="px-3.5 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + New Cuisine
        </button>
      </div>

      {/* Toolbar: Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cuisines..."
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {getParents().length > 0 && !searchQuery && (
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button onClick={expandAll} className="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-300" title="Expand all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
            </button>
            <button onClick={collapseAll} className="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors" title="Collapse all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
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
          <span className="text-sm text-gray-500">Loading cuisines...</span>
        </div>
      ) : displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {searchQuery ? 'No cuisines found' : 'No cuisines yet'}
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search.`
              : 'Create your first cuisine to get started.'}
          </p>
          {!searchQuery && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Create Cuisine
            </button>
          )}
        </div>
      ) : (
        /* Cuisines tree */
        <div className="space-y-2">
          {getParents()
            .filter((parent) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase().trim();
              if (parent.name.toLowerCase().includes(q)) return true;
              return getChildrenOf(parent.id).some((c) => c.name.toLowerCase().includes(q));
            })
            .map((parent) => {
              const children = (() => {
                const all = getChildrenOf(parent.id);
                if (!searchQuery.trim()) return all;
                const q = searchQuery.toLowerCase().trim();
                if (parent.name.toLowerCase().includes(q)) return all;
                return all.filter((c) => c.name.toLowerCase().includes(q));
              })();
              const hasChildren = children.length > 0;
              const isExpanded = !collapsed.has(parent.id);

              return (
                <div key={parent.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* Parent row */}
                  <div
                    className={`group flex items-center gap-2 px-3.5 py-2.5 transition-colors hover:bg-gray-50 ${hasChildren ? 'cursor-pointer' : ''}`}
                    onClick={() => hasChildren && toggleCollapse(parent.id)}
                  >
                    <div className="flex-shrink-0 w-5 flex items-center justify-center">
                      {hasChildren ? (
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => moveSibling(parent, 'up')} disabled={isFirstAmongSiblings(parent)} className="text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed" title="Move up">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>
                      </button>
                      <button onClick={() => moveSibling(parent, 'down')} disabled={isLastAmongSiblings(parent)} className="text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed" title="Move down">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">{parent.name}</span>
                        {hasChildren && (
                          <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-semibold rounded-full bg-primary-50 text-primary-600 border border-primary-100">{children.length}</span>
                        )}
                        {(parent.restaurant_count ?? 0) > 0 && (
                          <span className="text-xs text-gray-400">{parent.restaurant_count} restaurants</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{parent.slug}</p>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEditModal(parent)} className="p-1 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Edit">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                      </button>
                      {deleteConfirm === parent.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(parent.id)} className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors">Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(parent.id)} className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Children */}
                  {hasChildren && isExpanded && (
                    <div className="border-t border-gray-100">
                      <div className="ml-5 border-l-2 border-primary-100 bg-gray-50/40">
                        {children.map((child) => (
                          <div key={child.id} className="group flex items-center gap-2 px-3 py-2 border-b border-gray-100/80 last:border-b-0 hover:bg-white/60 transition-colors">
                            <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0 ml-1" />

                            <div className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => moveSibling(child, 'up')} disabled={isFirstAmongSiblings(child)} className="text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed" title="Move up">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>
                              </button>
                              <button onClick={() => moveSibling(child, 'down')} disabled={isLastAmongSiblings(child)} className="text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed" title="Move down">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                              </button>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 truncate">{child.name}</span>
                                {(child.restaurant_count ?? 0) > 0 && (
                                  <span className="text-xs text-gray-400">{child.restaurant_count} restaurants</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{child.slug}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button onClick={() => openEditModal(child)} className="p-1 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Edit">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                              </button>
                              {deleteConfirm === child.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDelete(child.id)} className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors">Delete</button>
                                  <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">No</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(child.id)} className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasChildren && !isExpanded && (
                    <button onClick={() => toggleCollapse(parent.id)} className="w-full px-4 py-1.5 text-xs text-gray-400 bg-gray-50/50 hover:bg-gray-50 transition-colors border-t border-gray-100 text-center">
                      {children.length} subcuisine{children.length === 1 ? '' : 's'} hidden
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-4 z-10">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {editingCuisine ? 'Edit Cuisine' : 'Create Cuisine'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Cuisine name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Cuisine</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData((f) => ({ ...f, parent_id: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="">None (Top Level)</option>
                  {topLevelCuisines
                    .filter((c) => c.id !== editingCuisine?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-3.5 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3.5 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingCuisine ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
