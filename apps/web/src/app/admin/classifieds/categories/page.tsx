'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import apiClient from '@/lib/api-client';
import type { CategoryFieldDefinition, FieldType } from '@/types/category-fields';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  field_schema: CategoryFieldDefinition[];
}

const FIELD_TYPES: FieldType[] = ['text', 'number', 'select', 'date', 'boolean', 'textarea', 'url'];
const GROUPS = ['basic', 'details', 'optional'];

function emptyField(): CategoryFieldDefinition {
  return {
    key: '',
    label: '',
    type: 'text',
    required: false,
    group: 'basic',
    sort_order: 0,
  };
}

export default function AdminCategorySchemaPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [schema, setSchema] = useState<CategoryFieldDefinition[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/classifieds/categories')
      .then(({ data }) => {
        const cats = Array.isArray(data) ? data : data.data ?? [];
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectCategory = (cat: Category) => {
    setSelectedId(cat.id);
    setSchema(cat.field_schema || []);
    setMessage(null);
  };

  const addField = () => {
    setSchema((prev) => [...prev, { ...emptyField(), sort_order: prev.length }]);
  };

  const updateField = (index: number, updates: Partial<CategoryFieldDefinition>) => {
    setSchema((prev) => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const removeField = (index: number) => {
    setSchema((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await apiClient.put(`/classifieds/admin/categories/${selectedId}/schema`, {
        schema,
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, field_schema: data.field_schema } : c)),
      );
      setMessage('Schema saved successfully.');
    } catch {
      setMessage('Failed to save schema.');
    } finally {
      setSaving(false);
    }
  };

  const selected = categories.find((c) => c.id === selectedId);

  return (
    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/admin" className="hover:text-primary-600">Admin</Link>
          <span>/</span>
          <Link href="/admin/classifieds" className="hover:text-primary-600">Classifieds</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Category Schemas</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Category Field Schemas</h1>

        {loading ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Category list */}
            <div className="lg:col-span-1">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Categories</h2>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      selectedId === cat.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{cat.name}</div>
                    <div className="text-xs text-gray-500">
                      {(cat.field_schema || []).length} fields
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Schema editor */}
            <div className="lg:col-span-3">
              {selected ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selected.name} — Field Schema
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={addField}
                        className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        + Add Field
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Schema'}
                      </button>
                    </div>
                  </div>

                  {message && (
                    <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${
                      message.includes('success')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {message}
                    </div>
                  )}

                  {schema.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
                      <p className="text-gray-500 mb-3">No fields defined for this category.</p>
                      <button
                        onClick={addField}
                        className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Add First Field
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {schema.map((field, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-lg p-4 bg-white"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Key</label>
                              <input
                                type="text"
                                value={field.key}
                                onChange={(e) => updateField(idx, { key: e.target.value })}
                                placeholder="field_key"
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Label</label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(idx, { label: e.target.value })}
                                placeholder="Display Label"
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Type</label>
                              <select
                                value={field.type}
                                onChange={(e) => updateField(idx, { type: e.target.value as FieldType })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                              >
                                {FIELD_TYPES.map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Group</label>
                              <select
                                value={field.group}
                                onChange={(e) => updateField(idx, { group: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                              >
                                {GROUPS.map((g) => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(idx, { required: e.target.checked })}
                                className="w-3.5 h-3.5"
                              />
                              Required
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.filterable || false}
                                onChange={(e) => updateField(idx, { filterable: e.target.checked })}
                                className="w-3.5 h-3.5"
                              />
                              Filterable
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.show_in_listing || false}
                                onChange={(e) => updateField(idx, { show_in_listing: e.target.checked })}
                                className="w-3.5 h-3.5"
                              />
                              Show in listing
                            </label>
                            <div className="flex items-center gap-1.5">
                              <label className="text-gray-500">Order:</label>
                              <input
                                type="number"
                                value={field.sort_order}
                                onChange={(e) => updateField(idx, { sort_order: Number(e.target.value) })}
                                className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
                              />
                            </div>
                            {field.type === 'select' && (
                              <div className="flex-1 min-w-[200px]">
                                <label className="text-gray-500 mr-1">Options:</label>
                                <input
                                  type="text"
                                  value={(field.options || []).join(', ')}
                                  onChange={(e) =>
                                    updateField(idx, {
                                      options: e.target.value
                                        .split(',')
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                    })
                                  }
                                  placeholder="Option1, Option2, Option3"
                                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm mt-1"
                                />
                              </div>
                            )}
                            <button
                              onClick={() => removeField(idx)}
                              className="ml-auto text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  Select a category to edit its field schema.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
