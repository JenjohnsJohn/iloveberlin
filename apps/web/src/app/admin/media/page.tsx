'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface MediaItem {
  id: string;
  filename: string;
  alt_text: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: string;
  uploaded_at: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [editingAltText, setEditingAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/media', { params: { page, limit: 24 } });
      const data = res.data;
      if (Array.isArray(data)) {
        setMedia(normalizeMediaItems(data));
        setTotalPages(1);
      } else if (data && typeof data === 'object') {
        setMedia(normalizeMediaItems(data.data ?? data.items ?? []));
        const total = data.total ?? data.totalCount ?? 0;
        const limit = data.limit ?? 24;
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      }
    } catch (err) {
      console.error('Failed to load media:', err);
      setError('Failed to load media library.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const filteredMedia = media.filter((item) =>
    item.filename.toLowerCase().includes(search.toLowerCase()) ||
    item.alt_text.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Step 1: Get presigned URL
        const presignRes = await apiClient.post('/media/presign', {
          filename: file.name,
          content_type: file.type,
        });

        const uploadUrl = presignRes.data.upload_url ?? presignRes.data.uploadUrl;
        const storageKey = presignRes.data.storage_key ?? presignRes.data.key;

        // Step 2: Upload to presigned URL
        if (uploadUrl) {
          await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });
        }

        // Step 3: Confirm upload
        await apiClient.post('/media/confirm', {
          storage_key: storageKey ?? presignRes.data.id,
          original_filename: file.name,
          mime_type: file.type,
          file_size_bytes: file.size,
        });
      }
      // Refresh media list
      await fetchMedia();
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload file(s). Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/media/${id}`);
      setDeleteConfirm(null);
      await fetchMedia();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete media item.');
    }
  };

  const startEditAlt = (item: MediaItem) => {
    setEditingAlt(item.id);
    setEditingAltText(item.alt_text);
  };

  const saveAlt = async (id: string) => {
    setSaving(true);
    try {
      await apiClient.patch(`/media/${id}`, { alt_text: editingAltText });
      setMedia((prev) =>
        prev.map((m) => (m.id === id ? { ...m, alt_text: editingAltText } : m))
      );
      setEditingAlt(null);
    } catch (err) {
      console.error('Failed to update alt text:', err);
      setError('Failed to update alt text.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Media Library</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="text-sm text-red-700 hover:text-red-900 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-8 mb-4 text-center hover:border-primary-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleUpload}
          className="hidden"
          id="media-upload"
          disabled={uploading}
        />
        <label htmlFor="media-upload" className={`cursor-pointer ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
          <div className="text-gray-400 mb-2">
            {uploading ? (
              <svg className="w-12 h-12 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          <p className="text-sm font-medium text-gray-700">
            {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF, MP4, PDF up to 10MB
          </p>
        </label>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filename or alt text..."
          className="w-full max-w-sm px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Media Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                  {item.type === 'image' && item.url ? (
                    <img
                      src={item.url}
                      alt={item.alt_text || item.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-gray-200', 'to-gray-300');
                      }}
                    />
                  ) : item.type === 'video' ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{item.size} &middot; {item.uploaded_at}</p>

                  {/* Alt text */}
                  <div className="mt-2">
                    {editingAlt === item.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={editingAltText}
                          onChange={(e) => setEditingAltText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveAlt(item.id);
                            if (e.key === 'Escape') setEditingAlt(null);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-primary-500"
                          placeholder="Alt text"
                          autoFocus
                        />
                        <button
                          onClick={() => saveAlt(item.id)}
                          disabled={saving}
                          className="text-xs text-green-600 hover:text-green-700 disabled:opacity-50"
                        >
                          {saving ? '...' : 'Save'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditAlt(item)}
                        className="text-xs text-gray-400 hover:text-primary-600 truncate block w-full text-left"
                        title={item.alt_text || 'Click to add alt text'}
                      >
                        {item.alt_text || 'Add alt text...'}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-2 flex items-center justify-end">
                    {deleteConfirm === item.id ? (
                      <span className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMedia.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">
              No media files found.
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {media.length} file{media.length !== 1 ? 's' : ''} in library
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-2.5 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2.5 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function normalizeMediaItems(items: unknown[]): MediaItem[] {
  return items.map((raw: unknown) => {
    const item = raw as Record<string, unknown>;
    const filename = String(item.original_filename ?? item.filename ?? item.file_name ?? item.name ?? '');
    const contentType = String(item.contentType ?? item.content_type ?? item.mime_type ?? item.type ?? '');
    let type: 'image' | 'video' | 'document' = 'document';
    if (contentType.startsWith('image') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename)) {
      type = 'image';
    } else if (contentType.startsWith('video') || /\.(mp4|webm|mov)$/i.test(filename)) {
      type = 'video';
    }

    const sizeRaw = item.file_size_bytes ?? item.size ?? item.file_size ?? 0;
    const size = typeof sizeRaw === 'number' ? formatFileSize(sizeRaw) : String(sizeRaw);

    const dateRaw = item.uploaded_at ?? item.uploadedAt ?? item.created_at ?? item.createdAt ?? '';
    const uploaded_at = typeof dateRaw === 'string' && dateRaw.includes('T')
      ? dateRaw.split('T')[0]
      : String(dateRaw);

    return {
      id: String(item.id ?? item._id ?? ''),
      filename,
      alt_text: String(item.alt_text ?? item.altText ?? item.alt ?? ''),
      url: String(item.url ?? item.file_url ?? item.fileUrl ?? ''),
      type,
      size,
      uploaded_at,
    };
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
