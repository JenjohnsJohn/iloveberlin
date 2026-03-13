'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

export default function EditCompetitionPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [competitionId, setCompetitionId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prizeDescription, setPrizeDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [maxEntries, setMaxEntries] = useState('');
  const [status, setStatus] = useState('draft');
  const [featuredImageId, setFeaturedImageId] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get(`/competitions/admin/${slug}`);

        const c = res.data;
        setCompetitionId(String(c.id || ''));
        setTitle(c.title || '');
        setDescription(c.description || '');
        setPrizeDescription(c.prize_description || c.prizeDescription || '');
        setStatus(c.status || 'draft');
        setTermsConditions(c.terms_conditions || c.termsConditions || '');
        setMaxEntries(c.max_entries != null ? String(c.max_entries) : c.maxEntries != null ? String(c.maxEntries) : '');

        const rawStart = c.start_date || c.startDate || '';
        const rawEnd = c.end_date || c.endDate || '';
        if (rawStart) setStartDate(rawStart.slice(0, 16));
        if (rawEnd) setEndDate(rawEnd.slice(0, 16));

        if (c.featured_image_id) setFeaturedImageId(String(c.featured_image_id));
        const featImg = c.featured_image;
        if (featImg?.url) setFeaturedImageUrl(String(featImg.url));
      } catch (err) {
        console.error('Failed to load competition:', err);
        setError('Failed to load competition.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!competitionId) { setError('Competition ID not found. Cannot save.'); return; }

    setIsSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        title,
        description,
        status,
      };

      if (prizeDescription.trim()) payload.prize_description = prizeDescription;
      else payload.prize_description = undefined;
      if (startDate) payload.start_date = new Date(startDate).toISOString();
      else payload.start_date = undefined;
      if (endDate) payload.end_date = new Date(endDate).toISOString();
      else payload.end_date = undefined;
      if (termsConditions.trim()) payload.terms_conditions = termsConditions;
      else payload.terms_conditions = undefined;
      if (maxEntries) payload.max_entries = parseInt(maxEntries, 10);
      else payload.max_entries = undefined;
      if (featuredImageId) payload.featured_image_id = featuredImageId;

      await apiClient.patch(`/competitions/${competitionId}`, payload);
      router.push('/admin/competitions');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? String(
              (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message ?? 'Failed to save competition.',
            )
          : 'Failed to save competition.';
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
        filename: file.name, mimetype: file.type, size: file.size, context: 'competition',
      });
      await fetch(presign.upload_url || presign.uploadUrl, {
        method: 'PUT', body: file, headers: { 'Content-Type': file.type },
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
        <span className="ml-3 text-gray-500">Loading competition...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Competition</h2>
        <button
          onClick={() => router.push('/admin/competitions')}
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
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter competition title..."
              maxLength={255}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>

          {/* Prize Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prize Description
            </label>
            <textarea
              value={prizeDescription}
              onChange={(e) => setPrizeDescription(e.target.value)}
              placeholder="Describe the prize(s)..."
              maxLength={5000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              rows={4}
            />
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms &amp; Conditions
            </label>
            <textarea
              value={termsConditions}
              onChange={(e) => setTermsConditions(e.target.value)}
              placeholder="Competition terms and conditions..."
              maxLength={10000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              rows={8}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Save */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Status</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm mb-3"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>

            {/* Start Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            {/* End Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            {/* Max Entries */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Entries
              </label>
              <input
                type="number"
                value={maxEntries}
                onChange={(e) => setMaxEntries(e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Featured Image</h3>
            {featuredImageUrl && (
              <div className="mb-3 relative">
                <img src={featuredImageUrl} alt="Featured" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                <button type="button" onClick={() => { setFeaturedImageId(''); setFeaturedImageUrl(null); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">x</button>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
            {isUploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
