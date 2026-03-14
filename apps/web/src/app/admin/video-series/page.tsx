'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface VideoSeries {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  sort_order: number;
  video_count?: number;
}

export default function VideoSeriesPage() {
  const [seriesList, setSeriesList] = useState<VideoSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState<VideoSeries | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sort_order: '0',
    thumbnail_url: '',
  });

  const fetchSeries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/videos/series');
      // Handle both { data: [...] } wrapper and plain array
      const list = Array.isArray(data) ? data : (data.data ?? data.series ?? []);
      setSeriesList(list);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load video series';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const filteredSeries = seriesList.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingSeries(null);
    setFormData({ name: '', description: '', sort_order: '0', thumbnail_url: '' });
    setShowModal(true);
  };

  const openEditModal = (series: VideoSeries) => {
    setEditingSeries(series);
    setFormData({
      name: series.name,
      description: series.description || '',
      sort_order: String(series.sort_order),
      thumbnail_url: series.thumbnail_url || '',
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
        sort_order: Number(formData.sort_order),
        thumbnail_url: formData.thumbnail_url || undefined,
      };

      if (editingSeries) {
        await apiClient.patch(`/videos/series/${editingSeries.id}`, payload);
      } else {
        await apiClient.post('/videos/series', payload);
      }

      setShowModal(false);
      await fetchSeries();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save video series';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await apiClient.delete(`/videos/series/${id}`);
      setDeleteConfirm(null);
      await fetchSeries();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete video series';
      setError(message);
    }
  };

  const reorderSeries = async (reordered: VideoSeries[]) => {
    setSeriesList(reordered);
    try {
      setError(null);
      await Promise.all(
        reordered.map((s, i) =>
          apiClient.patch(`/videos/series/${s.id}`, { sort_order: i })
        )
      );
      await fetchSeries();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to reorder video series';
      setError(message);
      // Revert on failure
      await fetchSeries();
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...seriesList];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    const reordered = updated.map((s, i) => ({ ...s, sort_order: i }));
    reorderSeries(reordered);
  };

  const moveDown = (index: number) => {
    if (index === seriesList.length - 1) return;
    const updated = [...seriesList];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    const reordered = updated.map((s, i) => ({ ...s, sort_order: i }));
    reorderSeries(reordered);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Video Series Management</h2>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search series..."
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm w-64"
          />
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            + Add Series
          </button>
        </div>
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
          <span className="text-sm text-gray-500">Loading video series...</span>
        </div>
      ) : (
        /* Video Series Table */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thumbnail</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Videos</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sort Order</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSeries.map((series, index) => (
                <tr key={series.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {series.thumbnail_url ? (
                      <img
                        src={series.thumbnail_url}
                        alt={series.name}
                        className="w-12 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{series.name}</td>
                  <td className="px-3 py-2 text-sm text-gray-500 max-w-xs truncate">
                    {series.description || '-'}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500">
                    {series.video_count != null ? series.video_count : '-'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Move up"
                      >
                        &#9650;
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === seriesList.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Move down"
                      >
                        &#9660;
                      </button>
                      <span className="text-sm text-gray-500 ml-1">{series.sort_order}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(series)}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </button>
                      {deleteConfirm === series.id ? (
                        <span className="flex items-center space-x-1">
                          {series.video_count != null && series.video_count > 0 && (
                            <span className="text-xs text-amber-600 mr-1">
                              Has {series.video_count} video{series.video_count !== 1 ? 's' : ''}!
                            </span>
                          )}
                          <button
                            onClick={() => handleDelete(series.id)}
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
                          onClick={() => setDeleteConfirm(series.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSeries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    {searchQuery ? 'No series matching your search.' : 'No video series found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-4 z-10">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {editingSeries ? 'Edit Series' : 'Create Series'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Series name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  rows={3}
                  placeholder="Series description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData((f) => ({ ...f, sort_order: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData((f) => ({ ...f, thumbnail_url: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="https://example.com/thumbnail.jpg"
                />
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
                {saving ? 'Saving...' : editingSeries ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
