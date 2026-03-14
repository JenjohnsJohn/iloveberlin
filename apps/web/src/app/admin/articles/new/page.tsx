'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NewArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          apiClient.get('/categories/tree', { params: { type: 'article' } }),
          apiClient.get('/tags'),
        ]);

        const catData = catRes.data;
        const catItems = Array.isArray(catData) ? catData : catData.data ?? catData.items ?? [];
        // Build flat list with parent grouping prefix
        const flatCats: { id: string; name: string }[] = [];
        for (const c of catItems) {
          const parentName = String(c.name ?? c.title ?? '');
          flatCats.push({ id: String(c.id ?? c._id), name: parentName });
          const children = Array.isArray(c.children) ? c.children : [];
          for (const child of children) {
            flatCats.push({
              id: String((child as Record<string, unknown>).id ?? ''),
              name: `${parentName} > ${String((child as Record<string, unknown>).name ?? '')}`,
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
        console.error('Failed to load categories/tags:', err);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (publishStatus: 'draft' | 'published') => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setStatus(publishStatus);

    try {
      await apiClient.post('/articles', {
        title,
        body: content,
        excerpt: excerpt.trim() || content.replace(/<[^>]*>/g, '').slice(0, 200) || undefined,
        category_id: categoryId || undefined,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        featured_image_id: featuredImageId || undefined,
        status: publishStatus,
        seo_title: metaTitle || undefined,
        seo_description: metaDescription || undefined,
      });

      router.push('/admin/articles');
    } catch (err: unknown) {
      console.error('Failed to save article:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to save article.')
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">New Article</h2>
        <button
          onClick={() => router.push('/admin/articles')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter article title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the article (auto-generated from content if left empty)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              rows={3}
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your article content here..."
            />
          </div>

          {/* SEO Fields */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO title (defaults to article title)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {metaTitle.length}/60 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief description for search engines"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  rows={3}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {metaDescription.length}/160 characters
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Publish</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleSave('draft')}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleSave('published')}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Category</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tags</h3>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Featured Image</h3>
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="featured-image-upload"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <label htmlFor="featured-image-upload" className="cursor-pointer">
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
