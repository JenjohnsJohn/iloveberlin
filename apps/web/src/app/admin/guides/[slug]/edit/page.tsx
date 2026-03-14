'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

interface Topic {
  id: string;
  name: string;
}

export default function EditGuidePage() {
  const router = useRouter();
  const params = useParams();
  const guideSlug = params.slug as string;

  const [guideId, setGuideId] = useState('');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [topicId, setTopicId] = useState('');
  const [status, setStatus] = useState('draft');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [featuredImageId, setFeaturedImageId] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guideRes, topicsRes] = await Promise.all([
          apiClient.get(`/guides/admin/${guideSlug}`),
          apiClient.get('/guides/topics'),
        ]);

        const g = guideRes.data;
        setGuideId(String(g.id || ''));
        setTitle(g.title || '');
        setExcerpt(g.excerpt || '');
        setBody(g.body || '');
        setTopicId(g.topic_id || g.topic?.id || '');
        setStatus(g.status || 'draft');
        setSeoTitle(g.seo_title || '');
        setSeoDescription(g.seo_description || '');
        if (g.featured_image_id) setFeaturedImageId(String(g.featured_image_id));
        const featImg = g.featured_image;
        if (featImg?.url) setFeaturedImageUrl(String(featImg.url));

        const topicItems = Array.isArray(topicsRes.data)
          ? topicsRes.data
          : topicsRes.data.data ?? [];
        setTopics(
          topicItems.map((t: Record<string, unknown>) => ({
            id: String(t.id ?? ''),
            name: String(t.name ?? ''),
          })),
        );
      } catch (err) {
        console.error('Failed to load guide:', err);
        setError('Failed to load guide.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [guideSlug]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!guideId) {
      setError('Guide ID not found. Cannot save.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        title,
        body,
        status,
      };

      if (excerpt.trim()) payload.excerpt = excerpt;
      else payload.excerpt = undefined;
      payload.topic_id = topicId || undefined;
      if (featuredImageId) payload.featured_image_id = featuredImageId;
      if (seoTitle.trim()) payload.seo_title = seoTitle;
      else payload.seo_title = undefined;
      if (seoDescription.trim()) payload.seo_description = seoDescription;
      else payload.seo_description = undefined;

      await apiClient.patch(`/guides/${guideId}`, payload);
      router.push('/admin/guides');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? String(
              (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message ?? 'Failed to save guide.',
            )
          : 'Failed to save guide.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const { data: presign } = await apiClient.post('/media/presign', {
        filename: file.name,
        mimetype: file.type,
        size: file.size,
        context: 'guide',
      });
      await fetch(presign.upload_url || presign.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      const { data: confirmed } = await apiClient.post('/media/confirm', {
        media_id: presign.media_id || presign.mediaId || presign.id,
      });
      setFeaturedImageId(String(confirmed.id || presign.media_id || presign.mediaId || presign.id));
      setFeaturedImageUrl(String(confirmed.url || presign.url || ''));
    } catch {
      setError('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-500">Loading guide...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Edit Guide</h2>
        <button
          onClick={() => router.push('/admin/guides')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter guide title..."
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the guide..."
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              rows={3}
            />
          </div>

          {/* Body */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Body *
            </label>
            <RichTextEditor value={body} onChange={setBody} />
          </div>

          {/* SEO */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">SEO</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Custom SEO title (max 70 chars)"
                  maxLength={70}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Description
                </label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Custom meta description (max 500 chars)"
                  maxLength={500}
                  rows={3}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status & Save */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm mb-3"
            >
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-3.5 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Topic */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Topic</h3>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="">Select a topic</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Featured Image</h3>
            {featuredImageUrl && (
              <div className="mb-3 relative">
                <img src={featuredImageUrl} alt="Featured" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                <button
                  type="button"
                  onClick={() => { setFeaturedImageId(''); setFeaturedImageUrl(null); }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  x
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {isUploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
