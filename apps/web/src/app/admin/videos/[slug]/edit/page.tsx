'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

interface Series {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface TagOption {
  id: string;
  name: string;
}

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoSlug = params.slug as string;

  const [videoId, setVideoId] = useState('');
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [videoProvider, setVideoProvider] = useState('youtube');
  const [seriesId, setSeriesId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [status, setStatus] = useState('draft');
  const [thumbnailId, setThumbnailId] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videoRes, seriesRes, catRes, tagsRes] = await Promise.all([
          apiClient.get(`/videos/admin/${videoSlug}`),
          apiClient.get('/videos/series'),
          apiClient.get('/categories', { params: { type: 'video' } }),
          apiClient.get('/tags'),
        ]);

        const v = videoRes.data;
        setVideoId(String(v.id || ''));
        setTitle(v.title || '');
        setVideoUrl(v.video_url || v.videoUrl || '');
        setDescription(v.description || '');
        setVideoProvider(v.video_provider || v.videoProvider || 'youtube');
        setSeriesId(v.series_id || v.series?.id || '');
        setCategoryId(v.category_id || v.category?.id || '');
        setDurationSeconds(v.duration_seconds != null ? String(v.duration_seconds) : '');
        setStatus(v.status || 'draft');
        if (v.thumbnail_id || v.thumbnail?.id) setThumbnailId(String(v.thumbnail_id || v.thumbnail?.id));
        if (v.thumbnail?.url) setThumbnailUrl(String(v.thumbnail.url));
        if (Array.isArray(v.tags)) {
          setSelectedTagIds(v.tags.map((t: Record<string, unknown>) => String(t.id || '')));
        }

        const sData = seriesRes.data;
        const sItems = Array.isArray(sData) ? sData : sData.data ?? [];
        setSeriesList(sItems.map((s: Record<string, unknown>) => ({ id: String(s.id ?? ''), name: String(s.name ?? '') })));

        const cData = catRes.data;
        const cItems = Array.isArray(cData) ? cData : cData.data ?? [];
        setCategories(cItems.map((c: Record<string, unknown>) => ({ id: String(c.id ?? ''), name: String(c.name ?? '') })));

        const tData = tagsRes.data;
        const tItems = Array.isArray(tData) ? tData : tData.data ?? [];
        setAvailableTags(tItems.map((t: Record<string, unknown>) => ({ id: String(t.id ?? ''), name: String(t.name ?? '') })));
      } catch (err) {
        console.error('Failed to load video:', err);
        setError('Failed to load video.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [videoSlug]);

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!videoId) { setError('Video ID not found. Cannot save.'); return; }

    setIsSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        title,
        video_url: videoUrl,
        status,
      };

      if (description.trim()) payload.description = description;
      else payload.description = undefined;
      payload.video_provider = videoProvider;
      payload.series_id = seriesId || undefined;
      payload.category_id = categoryId || undefined;
      if (durationSeconds) payload.duration_seconds = parseInt(durationSeconds, 10);
      else payload.duration_seconds = undefined;
      if (thumbnailId) payload.thumbnail_id = thumbnailId;
      payload.tag_ids = selectedTagIds;

      await apiClient.patch(`/videos/${videoId}`, payload);
      router.push('/admin/videos');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to save video.')
          : 'Failed to save video.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const { data: presign } = await apiClient.post('/media/presign', {
        filename: file.name, mimetype: file.type, size: file.size, context: 'video',
      });
      await fetch(presign.upload_url || presign.uploadUrl, {
        method: 'PUT', body: file, headers: { 'Content-Type': file.type },
      });
      const { data: confirmed } = await apiClient.post('/media/confirm', {
        media_id: presign.media_id || presign.mediaId || presign.id,
      });
      setThumbnailId(String(confirmed.id || presign.media_id || presign.mediaId || presign.id));
      setThumbnailUrl(String(confirmed.url || presign.url || ''));
    } catch {
      setError('Failed to upload thumbnail.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredTags = availableTags.filter(
    (t) => !selectedTagIds.includes(t.id) && t.name.toLowerCase().includes(tagSearch.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-500">Loading video...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Edit Video</h2>
        <button onClick={() => router.push('/admin/videos')} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter video title..." className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg" />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Video URL *</label>
            <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm" />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select value={videoProvider} onChange={(e) => setVideoProvider(e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                <input type="number" value={durationSeconds} onChange={(e) => setDurationSeconds(e.target.value)} placeholder="e.g. 300" min="0" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm mb-3">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <button onClick={handleSave} disabled={isSaving} className="w-full px-3.5 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Series</h3>
            <select value={seriesId} onChange={(e) => setSeriesId(e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              <option value="">No series</option>
              {seriesList.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              <option value="">Select a category</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>

          {/* Thumbnail */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Thumbnail</h3>
            {thumbnailUrl && (
              <div className="mb-3 relative">
                <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                <button type="button" onClick={() => { setThumbnailId(''); setThumbnailUrl(null); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">x</button>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={isUploading} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
            {isUploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedTagIds.map((id) => {
                  const tag = availableTags.find((t) => t.id === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                      {tag?.name || id}
                      <button type="button" onClick={() => setSelectedTagIds((prev) => prev.filter((tid) => tid !== id))} className="text-primary-500 hover:text-primary-700">x</button>
                    </span>
                  );
                })}
              </div>
            )}
            <input type="text" value={tagSearch} onChange={(e) => setTagSearch(e.target.value)} placeholder="Search tags..." className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-2" />
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredTags.slice(0, 20).map((t) => (
                <button key={t.id} type="button" onClick={() => { setSelectedTagIds((prev) => [...prev, t.id]); setTagSearch(''); }} className="block w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded">
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
