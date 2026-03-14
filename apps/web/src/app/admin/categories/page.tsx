'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
}

const categoryTypes = ['article', 'dining', 'guide', 'event', 'video', 'classified', 'competition', 'store'];

const typeLabels: Record<string, string> = {
  article: 'Article',
  dining: 'Dining',
  guide: 'Guide',
  event: 'Event',
  video: 'Video',
  classified: 'Classified',
  competition: 'Competition',
  store: 'Store',
};

const typeColors: Record<string, string> = {
  article: 'bg-blue-50 text-blue-700 border-blue-200',
  dining: 'bg-orange-50 text-orange-700 border-orange-200',
  guide: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  event: 'bg-purple-50 text-purple-700 border-purple-200',
  video: 'bg-pink-50 text-pink-700 border-pink-200',
  classified: 'bg-amber-50 text-amber-700 border-amber-200',
  competition: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  store: 'bg-teal-50 text-teal-700 border-teal-200',
};

export default function CategoriesPage() {
  return (
    <Suspense>
      <CategoriesPageInner />
    </Suspense>
  );
}

function CategoriesPageInner() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  const isTypeFiltered = !!typeFromUrl;
  const [typeFilter, setTypeFilter] = useState(typeFromUrl || '');

  useEffect(() => {
    setTypeFilter(typeFromUrl || '');
    setSearchQuery('');
  }, [typeFromUrl]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: typeFromUrl || 'article',
    parent_id: '',
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/categories', {
        params: { includeInactive: true },
      });
      const list = Array.isArray(data) ? data : (data.data ?? data.categories ?? []);
      setCategories(list);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load categories';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- Hierarchical helpers ---

  const getTypeFiltered = () =>
    typeFilter ? categories.filter((c) => c.type === typeFilter) : categories;

  const getChildrenOf = (items: Category[], parentId: string) =>
    items.filter((c) => c.parent_id === parentId).sort((a, b) => a.display_order - b.display_order);

  const getRoots = (items: Category[]) =>
    items.filter((c) => !c.parent_id).sort((a, b) => a.display_order - b.display_order);

  const buildTree = () => {
    const items = getTypeFiltered();
    const roots = getRoots(items);
    const q = searchQuery.toLowerCase().trim();

    if (!q) return roots;

    // In search mode, show roots that match or have matching children
    return roots.filter((root) => {
      if (root.name.toLowerCase().includes(q)) return true;
      return getChildrenOf(items, root.id).some((c) => c.name.toLowerCase().includes(q));
    });
  };

  const visibleRoots = buildTree();
  const allFiltered = getTypeFiltered();
  const activeCount = allFiltered.filter((c) => c.is_active).length;
  const inactiveCount = allFiltered.length - activeCount;
  const rootCount = getRoots(allFiltered).length;

  // --- Sibling-aware reordering ---

  const getSiblings = (category: Category): Category[] => {
    const pool = getTypeFiltered();
    return pool
      .filter((c) => c.parent_id === category.parent_id)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const isFirstAmongSiblings = (category: Category): boolean => {
    const siblings = getSiblings(category);
    return siblings.length === 0 || siblings[0].id === category.id;
  };

  const isLastAmongSiblings = (category: Category): boolean => {
    const siblings = getSiblings(category);
    return siblings.length === 0 || siblings[siblings.length - 1].id === category.id;
  };

  const moveSibling = async (category: Category, direction: 'up' | 'down') => {
    const siblings = getSiblings(category);
    const index = siblings.findIndex((c) => c.id === category.id);
    if (index < 0) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index >= siblings.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const swapCategory = siblings[swapIndex];
    const currentOrder = category.display_order;
    const swapOrder = swapCategory.display_order;

    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === category.id) return { ...c, display_order: swapOrder };
        if (c.id === swapCategory.id) return { ...c, display_order: currentOrder };
        return c;
      })
    );

    try {
      setError(null);
      await apiClient.patch(`/categories/${category.id}`, { display_order: swapOrder });
      await apiClient.patch(`/categories/${swapCategory.id}`, { display_order: currentOrder });
      await fetchCategories();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to reorder categories';
      setError(message);
      await fetchCategories();
    }
  };

  // --- Collapse/Expand ---
  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () => setCollapsed(new Set(getRoots(getTypeFiltered()).map((r) => r.id)));

  // --- CRUD ---

  const typeLabel = typeFilter
    ? typeLabels[typeFilter] || typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)
    : '';

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      type: typeFilter || typeFromUrl || 'article',
      parent_id: '',
    });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      type: category.type,
      parent_id: category.parent_id || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      setError(null);
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        parent_id: formData.parent_id || null,
      };

      if (editingCategory) {
        await apiClient.patch(`/categories/${editingCategory.id}`, payload);
      } else {
        await apiClient.post('/categories', payload);
      }

      setShowModal(false);
      await fetchCategories();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save category';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await apiClient.delete(`/categories/${id}`);
      setDeleteConfirm(null);
      await fetchCategories();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete category';
      setError(message);
    }
  };

  const toggleActive = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;
    try {
      setError(null);
      await apiClient.patch(`/categories/${id}`, { is_active: !category.is_active });
      await fetchCategories();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update category status';
      setError(message);
    }
  };

  // --- Render helpers ---

  const pageTitle = isTypeFiltered ? `${typeLabel} Categories` : 'Categories';

  const availableParents = categories.filter(
    (c) => !c.parent_id && c.type === formData.type && c.id !== editingCategory?.id
  );

  const getVisibleChildren = (parentId: string) => {
    const items = getTypeFiltered();
    const children = getChildrenOf(items, parentId);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return children;
    // If parent matches search, show all children; otherwise only matching children
    const parent = categories.find((c) => c.id === parentId);
    if (parent?.name.toLowerCase().includes(q)) return children;
    return children.filter((c) => c.name.toLowerCase().includes(q));
  };

  // --- Category row component ---

  const CategoryRow = ({
    cat,
    isChild,
    childCount,
    isExpanded,
    onToggleExpand,
  }: {
    cat: Category;
    isChild: boolean;
    childCount?: number;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
  }) => {
    const isDeleting = deleteConfirm === cat.id;
    const hasChildren = (childCount ?? 0) > 0;

    return (
      <div
        className={`group flex items-center gap-2 transition-colors ${
          isChild
            ? 'px-3 py-2 hover:bg-white/60'
            : `px-3.5 py-2.5 hover:bg-gray-50 ${hasChildren ? 'cursor-pointer' : ''}`
        } ${!cat.is_active ? 'opacity-60' : ''}`}
        onClick={!isChild && onToggleExpand ? onToggleExpand : undefined}
      >
        {/* Chevron for parents / dot for children */}
        {!isChild ? (
          <div className="flex-shrink-0 w-5 flex items-center justify-center">
            {hasChildren ? (
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            )}
          </div>
        ) : (
          <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0 ml-1" />
        )}

        {/* Reorder */}
        <div
          className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => moveSibling(cat, 'up')}
            disabled={isFirstAmongSiblings(cat)}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed"
            title="Move up"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={() => moveSibling(cat, 'down')}
            disabled={isLastAmongSiblings(cat)}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed"
            title="Move down"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* Name & slug */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm truncate ${
                isChild ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'
              }`}
            >
              {cat.name}
            </span>
            {!isChild && hasChildren && (
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-semibold rounded-full bg-primary-50 text-primary-600 border border-primary-100">
                {childCount}
              </span>
            )}
            {!isTypeFiltered && (
              <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded border ${typeColors[cat.type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {typeLabels[cat.type] || cat.type}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">{cat.slug}</p>
        </div>

        {/* Status toggle & actions */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleActive(cat.id)}
            className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              cat.is_active ? 'bg-green-500' : 'bg-gray-300'
            }`}
            title={cat.is_active ? 'Active - click to deactivate' : 'Inactive - click to activate'}
          >
            <span
              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                cat.is_active ? 'translate-x-3.5' : 'translate-x-0'
              }`}
            />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => openEditModal(cat)}
              className="p-1 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
            {isDeleting ? (
              <div className="flex items-center gap-1 animate-in slide-in-from-right-2">
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(cat.id)}
                className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{pageTitle}</h2>
          <p className="text-sm text-gray-500 mt-0.5">Organize and manage your content categories</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New {isTypeFiltered ? typeLabel + ' ' : ''}Category
        </button>
      </div>

      {/* Stats bar */}
      {!loading && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
            <p className="text-lg font-bold text-gray-900">{allFiltered.length}</p>
            <p className="text-xs text-gray-500">Total categories</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
            <p className="text-lg font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
            <p className="text-lg font-bold text-gray-400">{inactiveCount}</p>
            <p className="text-xs text-gray-500">Inactive</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
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
            placeholder={`Search ${isTypeFiltered ? typeLabel.toLowerCase() + ' ' : ''}categories...`}
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
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
        {!isTypeFiltered && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
          >
            <option value="">All Types</option>
            {categoryTypes.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type] || type}
              </option>
            ))}
          </select>
        )}
        {rootCount > 0 && !searchQuery && (
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={expandAll}
              className="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-300"
              title="Expand all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </button>
            <button
              onClick={collapseAll}
              className="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
              title="Collapse all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
          <svg
            className="animate-spin h-8 w-8 text-primary-600 mb-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500">Loading categories...</p>
        </div>
      ) : visibleRoots.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {searchQuery
              ? 'No categories found'
              : `No ${isTypeFiltered ? typeLabel.toLowerCase() + ' ' : ''}categories yet`}
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search.`
              : 'Create your first category to get started.'}
          </p>
          {!searchQuery && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Category
            </button>
          )}
        </div>
      ) : (
        /* Category tree */
        <div className="space-y-2">
          {visibleRoots.map((root) => {
            const children = getVisibleChildren(root.id);
            const isExpanded = !collapsed.has(root.id);
            const hasChildren = children.length > 0;

            return (
              <div
                key={root.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                {/* Parent row */}
                <CategoryRow
                  cat={root}
                  isChild={false}
                  childCount={children.length}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleCollapse(root.id)}
                />

                {/* Children */}
                {hasChildren && isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="ml-5 border-l-2 border-primary-100 bg-gray-50/40">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="border-b border-gray-100/80 last:border-b-0"
                        >
                          <CategoryRow cat={child} isChild={true} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapsed children count */}
                {hasChildren && !isExpanded && (
                  <button
                    onClick={() => toggleCollapse(root.id)}
                    className="w-full px-4 py-1.5 text-xs text-gray-400 bg-gray-50/50 hover:bg-gray-50 transition-colors border-t border-gray-100 text-center"
                  >
                    {children.length} subcategor{children.length === 1 ? 'y' : 'ies'} hidden
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            {/* Modal header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                {editingCategory
                  ? 'Edit Category'
                  : `New ${isTypeFiltered ? typeLabel + ' ' : ''}Category`}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="e.g. Travel Tips"
                  autoFocus
                />
                {formData.name && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    Slug: <span className="font-mono text-gray-500">{formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  rows={2}
                  placeholder="Brief description of this category"
                />
              </div>

              {!isTypeFiltered && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value, parent_id: '' }))}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    {categoryTypes.map((type) => (
                      <option key={type} value={type}>
                        {typeLabels[type] || type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData((f) => ({ ...f, parent_id: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="">None (Top Level)</option>
                  {availableParents.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-3.5 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name.trim()}
                className="px-3.5 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
