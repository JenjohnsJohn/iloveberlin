'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface Tag {
  id: string;
  name: string;
  slug: string;
  usage_count: number; // not in backend entity, may be undefined
}

function mapTag(raw: Record<string, unknown>): Tag {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    slug: String(raw.slug || ''),
    usage_count: Number(raw.usage_count ?? raw.usageCount ?? 0),
  };
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/tags');
      // Handle both { data: [...] } wrapper and plain array
      const list = Array.isArray(data) ? data : (data.data ?? data.tags ?? []);
      setTags(list.map((t: Record<string, unknown>) => mapTag(t)));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load tags';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setSaving(true);
      setError(null);
      await apiClient.post('/tags', { name: newTagName.trim() });
      setNewTagName('');
      await fetchTags();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create tag';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  const saveEdit = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      setSaving(true);
      setError(null);
      await apiClient.patch(`/tags/${id}`, { name: editingName.trim() });
      setEditingId(null);
      await fetchTags();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update tag';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await apiClient.delete(`/tags/${id}`);
      setDeleteConfirm(null);
      await fetchTags();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete tag';
      setError(message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tags</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create Tag */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
            placeholder="Enter new tag name..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
          <button
            onClick={handleCreateTag}
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Tag'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tags..."
          className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
        />
      </div>

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
          <span className="text-sm text-gray-500">Loading tags...</span>
        </div>
      ) : (
        <>
          {/* Tags Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage Count</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {editingId === tag.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(tag.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(tag.id)}
                            disabled={saving}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{tag.slug}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {tag.usage_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {editingId !== tag.id && (
                          <button
                            onClick={() => startEdit(tag)}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            Edit
                          </button>
                        )}
                        {deleteConfirm === tag.id ? (
                          <span className="flex items-center space-x-1">
                            <button
                              onClick={() => handleDelete(tag.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(tag.id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTags.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                      No tags found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tag count */}
          <p className="mt-4 text-sm text-gray-500">
            {tags.length} tag{tags.length !== 1 ? 's' : ''} total
          </p>
        </>
      )}
    </div>
  );
}
