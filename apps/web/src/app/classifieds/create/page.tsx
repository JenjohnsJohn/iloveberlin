'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import apiClient from '@/lib/api-client';
import type { CategoryFieldDefinition } from '@/types/category-fields';
import { DynamicFieldForm } from '@/components/classifieds/dynamic-field-form';
import { DynamicFieldDisplay } from '@/components/classifieds/dynamic-field-display';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  description: string;
  field_schema: CategoryFieldDefinition[];
}


const DISTRICTS = [
  'Mitte',
  'Kreuzberg',
  'Friedrichshain',
  'Prenzlauer Berg',
  'Neukoelln',
  'Charlottenburg',
  'Schoeneberg',
  'Tempelhof',
  'Wedding',
  'Moabit',
];

const CONDITIONS = [
  { label: 'New', value: 'new' },
  { label: 'Like New', value: 'like_new' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
  { label: 'Poor', value: 'poor' },
];

const PRICE_TYPES = [
  { label: 'Fixed Price', value: 'fixed' },
  { label: 'Negotiable', value: 'negotiable' },
  { label: 'Free', value: 'free' },
  { label: 'Price on Request', value: 'on_request' },
];

interface UploadedImage {
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
}

interface FormData {
  categoryId: string;
  categorySlug: string;
  title: string;
  description: string;
  price: string;
  priceType: string;
  condition: string;
  location: string;
  district: string;
  categoryFields: Record<string, unknown>;
}

const TOTAL_STEPS = 5;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">
          Step {currentStep} of {TOTAL_STEPS}
        </span>
        <span className="text-sm text-gray-400">
          {currentStep === 1 && 'Select Category'}
          {currentStep === 2 && 'Listing Details'}
          {currentStep === 3 && 'Upload Images'}
          {currentStep === 4 && 'Preview'}
          {currentStep === 5 && 'Confirmation'}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  );
}

function formatPrice(price: string, priceType: string): string {
  if (priceType === 'free') return 'Free';
  if (priceType === 'on_request') return 'Price on request';
  if (!price) return 'Not specified';
  return `\u20AC${Number(price).toLocaleString('de-DE')}`;
}

export default function CreateListingPage() {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [formData, setFormData] = useState<FormData>({
    categoryId: '',
    categorySlug: '',
    title: '',
    description: '',
    price: '',
    priceType: 'fixed',
    condition: '',
    location: '',
    district: '',
    categoryFields: {},
  });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiClient.get('/classifieds/categories').then(({ data }) => {
      const cats = Array.isArray(data) ? data : data.data ?? [];
      if (cats.length > 0) {
        setCategories(cats.map((c: Record<string, unknown>) => ({
          id: String(c.id || ''),
          name: String(c.name || ''),
          slug: String(c.slug || ''),
          description: String(c.description || ''),
          field_schema: (c.field_schema as CategoryFieldDefinition[]) || [],
        })));
      }
    }).catch(() => {});
  }, []);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectCategory = (cat: CategoryOption) => {
    setFormData((prev) => ({ ...prev, categoryId: cat.id, categorySlug: cat.slug, categoryFields: {} }));
  };

  const handleImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 8 - images.length;
    if (remaining <= 0) {
      setError('Maximum 8 images allowed.');
      return;
    }

    const newFiles = Array.from(files).slice(0, remaining);
    const validFiles = newFiles.filter((f) => {
      if (f.size > 5 * 1024 * 1024) return false;
      if (!f.type.startsWith('image/')) return false;
      return true;
    });

    if (validFiles.length === 0) {
      setError('Please select valid image files (max 5MB each).');
      return;
    }

    setIsUploading(true);
    setError(null);

    const newImages: UploadedImage[] = [];
    for (const file of validFiles) {
      try {
        const { data: presign } = await apiClient.post('/media/presign', {
          filename: file.name, mimetype: file.type, size: file.size, context: 'classified',
        });
        await fetch(presign.upload_url || presign.uploadUrl, {
          method: 'PUT', body: file, headers: { 'Content-Type': file.type },
        });
        const { data: confirmed } = await apiClient.post('/media/confirm', {
          media_id: presign.media_id || presign.mediaId || presign.id,
        });
        const url = String(confirmed.url || presign.url || '');
        newImages.push({
          file,
          previewUrl: URL.createObjectURL(file),
          uploadedUrl: url,
        });
      } catch {
        setError(`Failed to upload ${file.name}.`);
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        category_id: formData.categoryId,
        title: formData.title,
        description: formData.description,
        district: formData.district,
      };

      if (formData.priceType) payload.price_type = formData.priceType;
      if (formData.price && formData.priceType !== 'free' && formData.priceType !== 'on_request') {
        payload.price = parseFloat(formData.price);
      }
      if (formData.condition) payload.condition = formData.condition;
      if (formData.location) payload.location = formData.location;
      if (Object.keys(formData.categoryFields).length > 0) {
        payload.category_fields = formData.categoryFields;
      }

      const { data: created } = await apiClient.post('/classifieds', payload);
      const classifiedId = created.id;

      // Attach uploaded images
      for (const img of images) {
        if (img.uploadedUrl) {
          try {
            await apiClient.post(`/classifieds/${classifiedId}/images`, {
              url: img.uploadedUrl,
            });
          } catch {
            // Non-critical: image attachment failed
          }
        }
      }

      // Submit for moderation
      try {
        await apiClient.post(`/classifieds/${classifiedId}/submit`);
      } catch {
        // Listing created but submit failed — user can do it from my-listings
      }

      setStep(5);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to create listing.')
          : 'Failed to create listing.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!formData.categorySlug;
      case 2: {
        if (!formData.title || !formData.description || !formData.district) return false;
        // Check required dynamic fields
        const schema = selectedCategory?.field_schema || [];
        for (const field of schema) {
          if (field.required) {
            const val = formData.categoryFields[field.key];
            if (val === undefined || val === null || val === '') return false;
          }
        }
        return true;
      }
      case 3:
        return true;
      case 4:
        return !isSubmitting;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 4) {
      handleSubmit();
    } else {
      setStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
    }
  };

  const selectedCategory = categories.find((c) => c.slug === formData.categorySlug);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/classifieds" className="hover:text-primary-600">Classifieds</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Create Listing</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Listing</h1>
        <p className="text-gray-600 mb-6">Fill in the details to post your listing on Berlin Classifieds.</p>

        <StepIndicator currentStep={step} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: Select Category */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What are you listing?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => selectCategory(cat)}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    formData.categorySlug === cat.slug
                      ? 'border-primary-600 bg-primary-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{cat.name}</h3>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Listing Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter a descriptive title..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your item or service in detail..."
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
                <select
                  value={formData.priceType}
                  onChange={(e) => updateField('priceType', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {PRICE_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="0.00"
                  disabled={formData.priceType === 'free' || formData.priceType === 'on_request'}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => updateField('condition', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select condition...</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g., Kreuzberg, Berlin"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                <select
                  value={formData.district}
                  onChange={(e) => updateField('district', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select district...</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamic category-specific fields */}
            {selectedCategory && selectedCategory.field_schema.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedCategory.name} Details
                </h3>
                <DynamicFieldForm
                  fieldSchema={selectedCategory.field_schema}
                  values={formData.categoryFields}
                  onChange={(key, value) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryFields: { ...prev.categoryFields, [key]: value },
                    }))
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Images */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Images</h2>
            <p className="text-sm text-gray-500 mb-6">
              Add photos to make your listing more attractive. High-quality images increase your chances of a sale.
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageSelect(e.target.files)}
              className="hidden"
            />

            {/* Drag-drop area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleImageSelect(e.dataTransfer.files); }}
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-primary-400 transition-colors cursor-pointer mb-6"
            >
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <p className="text-gray-600 font-medium mb-1">
                {isUploading ? 'Uploading...' : 'Drag and drop images here'}
              </p>
              <p className="text-sm text-gray-400 mb-3">or click to browse files</p>
              <p className="text-xs text-gray-400">Upload up to 8 images (JPEG, PNG, max 5MB each)</p>
            </div>

            {/* Uploaded images */}
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden">
                  <img src={img.previewUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    x
                  </button>
                </div>
              ))}
              {/* Empty placeholders */}
              {Array.from({ length: Math.max(0, 8 - images.length) }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-gray-300"
                >
                  <div className="text-center">
                    <svg className="w-6 h-6 text-gray-300 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-xs text-gray-400">{images.length + idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
            {isUploading && <p className="text-sm text-gray-500 mt-3">Uploading images...</p>}
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Listing</h2>
            <p className="text-sm text-gray-500 mb-6">
              Check that everything looks correct before submitting.
            </p>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Preview image area */}
              <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {images.length > 0 ? (
                  <img src={images[0].previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                    <p className="text-sm text-gray-400">No images uploaded</p>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <span className="inline-block px-2.5 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full mb-2">
                    {selectedCategory?.name || formData.categorySlug}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900">{formData.title || 'Untitled Listing'}</h3>
                </div>

                <div className="text-2xl font-bold text-primary-700">
                  {formatPrice(formData.price, formData.priceType)}
                </div>

                {formData.condition && (
                  <div>
                    <span className="text-sm text-gray-500">Condition: </span>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {CONDITIONS.find((c) => c.value === formData.condition)?.label || formData.condition}
                    </span>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Images ({images.length})</h4>
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, idx) => (
                        <img key={idx} src={img.previewUrl} alt={`Image ${idx + 1}`} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {formData.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <p className="text-gray-900 font-medium">{formData.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">District:</span>
                    <p className="text-gray-900 font-medium">{formData.district || 'Not specified'}</p>
                  </div>
                </div>

                {/* Dynamic fields preview */}
                {selectedCategory && selectedCategory.field_schema.length > 0 && Object.keys(formData.categoryFields).length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <DynamicFieldDisplay
                      fieldSchema={selectedCategory.field_schema}
                      values={formData.categoryFields}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Submitted!</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Your listing has been submitted for review. Our moderation team will review it and
              it should be live within 24 hours. You can track its status in your listings.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/classifieds/my-listings"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                View My Listings
              </Link>
              <Link
                href="/classifieds"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back to Classifieds
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              disabled={step === 1}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || isUploading}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 4 ? (isSubmitting ? 'Submitting...' : 'Submit Listing') : 'Next'}
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
