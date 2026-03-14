'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import apiClient from '@/lib/api-client';

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleSlug = params.slug as string;

  const [articleId, setArticleId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('draft');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articleRes, catRes, tagRes] = await Promise.all([
          apiClient.get(`/articles/admin/${articleSlug}`),
          apiClient.get('/categories/tree', { params: { type: 'article' } }),
          apiClient.get('/tags'),
        ]);

        const a = articleRes.data;
        setArticleId(String(a.id || ''));
        setTitle(a.title || '');
        setContent(a.body || '');
        setExcerpt(a.excerpt || '');
        setCategoryId(a.category_id || a.category?.id || '');
        setStatus(a.status || 'draft');
        setSeoTitle(a.seo_title || '');
        setSeoDescription(a.seo_description || '');

        // Load existing tags
        if (a.tags && Array.isArray(a.tags)) {
          setSelectedTagIds(a.tags.map((t: Record<string, unknown>) => String(t.id)));
        }

        // Load featured image
        if (a.featured_image || a.featuredImage) {
          const img = a.featured_image || a.featuredImage;
          setFeaturedImageId(String(img.id || ''));
          setFeaturedImageUrl(img.url || img.thumbnail_url || null);
        }

        const catData = catRes.data;
        const catItems = Array.isArray(catData) ? catData : catData.data ?? [];
        const flatCats: { id: string; name: string }[] = [];
        for (const c of catItems) {
          const parentName = String((c as Record<string, unknown>).name ?? '');
          flatCats.push({ id: String((c as Record<string, unknown>).id ?? ''), name: parentName });
          const children = Array.isArray((c as Record<string, unknown>).children) ? (c as Record<string, unknown>).children as Record<string, unknown>[] : [];
          for (const child of children) {
            flatCats.push({
              id: String(child.id ?? ''),
              name: `${parentName} > ${String(child.name ?? '')}`,
            });
          }
        }
        setCategories(flatCats);

        const tagData = tagRes.data;
        const tagItems = Array.isArray(tagData) ? tagData : tagData.data ?? tagData.items ?? [];
        setAvailableTags(
          tagItems.map((t: Record<string, unknown>) => ({
            id: String(t.id ?? ''),
            name: String(t.name ?? ''),
          }))
        );
      } catch (err) {
        console.error('Failed to load article:', err);
        setError('Failed to load article.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [articleSlug]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!articleId) {
      setError('Article ID not found. Cannot save.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await apiClient.patch(`/articles/${articleId}`, {
        title,
        body: content,
        excerpt: excerpt || undefined,
        category_id: categoryId || undefined,
        tag_ids: selectedTagIds,
        featured_image_id: featuredImageId || undefined,
        status,
        seo_title: seoTitle || undefined,
        seo_description: seoDescription || undefined,
      });
      router.push('/admin/articles');
    } catch (err: unknown) {
      console.error('Failed to save article:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? String(
              (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message ?? 'Failed to save article.'
            )
          : 'Failed to save article.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: presign } = await apiClient.post('/media/presign', {
        filename: file.name,
        content_type: file.type,
      });

      await fetch(presign.upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      const { data: media } = await apiClient.post('/media/confirm', {
        media_id: presign.media_id,
      });

      setFeaturedImageId(media.id || presign.media_id);
      setFeaturedImageUrl(media.url || presign.url || null);
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const filteredTags = tagSearch
    ? availableTags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()))
    : availableTags;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg
          className="animate-spin h-6 w-6 text-primary-600 mr-2"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-gray-500">Loading article...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Edit Article</h2>
        <button
          onClick={() => router.push('/admin/articles')}
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter article title..."
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the article..."
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              rows={3}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Content
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your article content here..."
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="SEO title (defaults to article title)"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {seoTitle.length}/60 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Description
                </label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Brief description for search engines"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  rows={3}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {seoDescription.length}/160 characters
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Publish */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Publish</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="in_review">In Review</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full px-3.5 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedTagIds.map((tagId) => {
                  const tag = availableTags.find((t) => t.id === tagId);
                  return (
                    <button
                      key={tagId}
                      type="button"
                      onClick={() => toggleTag(tagId)}
                      className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full hover:bg-primary-200 transition-colors"
                    >
                      {tag?.name || tagId} &times;
                    </button>
                  );
                })}
              </div>
            )}
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Search tags..."
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
            {availableTags.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                      selectedTagIds.includes(tag.id) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {selectedTagIds.includes(tag.id) ? '\u2713 ' : ''}{tag.name}
                  </button>
                ))}
                {filteredTags.length === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-400">No tags found</p>
                )}
              </div>
            )}
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Featured Image</h3>
            {featuredImageUrl ? (
              <div className="relative">
                <img
                  src={featuredImageUrl}
                  alt="Featured"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => { setFeaturedImageId(null); setFeaturedImageUrl(null); }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                >
                  &times;
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="edit-featured-image-upload"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <label htmlFor="edit-featured-image-upload" className="cursor-pointer">
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin h-6 w-6 text-primary-600 mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className="text-xs text-gray-500">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-gray-500">Click to upload</p>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
