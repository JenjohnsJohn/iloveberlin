'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore, CartProduct, CartVariant } from '@/store/cart-store';

export interface ProductDetailData {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  basePrice: number;
  compareAtPrice: number | null;
  images: { id: string; url: string | null; alt: string }[];
  category: string;
  categorySlug: string;
  sku: string;
  variants: { id: string; name: string; type: string; price: number }[];
  isFeatured: boolean;
}

export interface RelatedProductData {
  slug: string;
  name: string;
  basePrice: number;
  compareAtPrice: number | null;
  category: string;
  imageUrl: string | null;
}

interface ProductDetailContentProps {
  product: ProductDetailData;
  relatedProducts: RelatedProductData[];
}

export function ProductDetailContent({ product, relatedProducts }: ProductDetailContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState<'description' | 'details' | null>('description');

  const addItem = useCartStore((s) => s.addItem);

  const variantTypes = product.variants.length > 0
    ? [...new Set(product.variants.map((v) => v.type))]
    : [];

  const currentVariant = product.variants.find((v) => v.id === selectedVariant);
  const displayPrice = currentVariant ? currentVariant.price : product.basePrice;

  const thumbnailCount = product.images.length > 0 ? product.images.length : 4;
  const thumbnails = Array.from({ length: thumbnailCount }, (_, i) => i);

  // Calculate savings percentage
  const savingsPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - displayPrice) / product.compareAtPrice) * 100)
    : null;

  // Trigger fade-in animation on image change
  useEffect(() => {
    setImageKey((k) => k + 1);
  }, [selectedImageIndex]);

  const handleAddToCart = () => {
    const cartProduct: CartProduct = {
      id: product.slug,
      name: product.name,
      slug: product.slug,
      base_price: product.basePrice,
      compare_at_price: product.compareAtPrice,
      image_url: product.images[0]?.url || null,
    };

    let cartVariant: CartVariant | undefined;
    if (currentVariant) {
      cartVariant = {
        id: currentVariant.id,
        name: `${currentVariant.type}: ${currentVariant.name}`,
        price: currentVariant.price,
      };
    }

    addItem(cartProduct, quantity, cartVariant);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-primary-600 transition-colors font-medium">
          Home
        </Link>
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/store" className="hover:text-primary-600 transition-colors font-medium">
          Store
        </Link>
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-semibold truncate">{product.name}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Image Gallery */}
        <div>
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center text-gray-300 cursor-zoom-in">
            {product.images[selectedImageIndex]?.url ? (
              <Image
                key={imageKey}
                src={product.images[selectedImageIndex].url!}
                alt={product.images[selectedImageIndex]?.alt || product.name}
                fill
                className="object-cover animate-fade-in"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <svg
                className="w-24 h-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={0.5}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"
                />
              </svg>
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {thumbnails.map((i) => (
              <button
                key={i}
                onClick={() => setSelectedImageIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={`aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-300 border-2 transition-all duration-200 ${
                  selectedImageIndex === i
                    ? 'border-primary-600 shadow-primary-glow scale-105'
                    : 'border-transparent hover:border-gray-300 hover:scale-105 hover:shadow-md'
                }`}
              >
                {product.images[i]?.url ? (
                  <Image
                    src={product.images[i].url!}
                    alt={product.images[i]?.alt || `${product.name} thumbnail ${i + 1}`}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={0.5}
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            {product.category}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="text-3xl font-bold gradient-text">
              {'\u20AC'}{displayPrice.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-red-400 line-through font-medium">
                {'\u20AC'}{product.compareAtPrice.toFixed(2)}
              </span>
            )}
            {savingsPercent && savingsPercent > 0 && (
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Save {savingsPercent}%
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6">{product.shortDescription}</p>

          {/* Variant Selectors */}
          {variantTypes.map((type) => {
            const typeVariants = product.variants.filter((v) => v.type === type);
            return (
              <div key={type} className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {type}
                  {selectedVariant && currentVariant?.type === type && (
                    <span className="ml-2 font-normal text-gray-500">
                      — {currentVariant.name}
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Select ${type}`}>
                  {typeVariants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id)}
                      role="radio"
                      aria-checked={selectedVariant === v.id}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                        selectedVariant === v.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50/50'
                      }`}
                    >
                      {v.name}
                      {v.price !== product.basePrice && (
                        <span className="ml-1 text-xs opacity-70">
                          +{'\u20AC'}{(v.price - product.basePrice).toFixed(2)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-bold text-lg"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 h-11 flex items-center justify-center text-gray-900 font-semibold border-x-2 border-gray-200 text-center" aria-live="polite">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-11 h-11 flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-bold text-lg"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                In Stock
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.variants.length > 0 && !selectedVariant}
            className={`w-full py-4 rounded-xl text-lg font-semibold transition-all duration-300 mb-4 flex items-center justify-center gap-2.5 ${
              addedToCart
                ? 'bg-green-500 text-white scale-105 shadow-lg'
                : product.variants.length > 0 && !selectedVariant
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'btn-gradient rounded-xl py-4 text-lg'
            }`}
          >
            {addedToCart ? (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Added to Cart!
              </>
            ) : product.variants.length > 0 && !selectedVariant ? (
              `Select ${variantTypes[0]} to Continue`
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-5.98.414M15.75 14.25a3 3 0 00-5.98.414m-2.52-7.414h13.5a1.5 1.5 0 011.454 1.886l-1.846 7.384A1.5 1.5 0 0118.904 18H8.846a1.5 1.5 0 01-1.454-1.126L5.25 8.25" />
                </svg>
                Add to Cart
              </>
            )}
          </button>

          <Link
            href="/store/cart"
            className="block w-full text-center py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            View Cart
          </Link>

          {/* SKU & Description Accordion */}
          <div className="mt-8 border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
            {/* Description Panel */}
            <div>
              <button
                onClick={() => setDetailsOpen(detailsOpen === 'description' ? null : 'description')}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Description</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${detailsOpen === 'description' ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {detailsOpen === 'description' && (
                <div className="px-5 pb-5 animate-fade-in">
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>

            {/* Product Details Panel */}
            <div>
              <button
                onClick={() => setDetailsOpen(detailsOpen === 'details' ? null : 'details')}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Product Details</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${detailsOpen === 'details' ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {detailsOpen === 'details' && (
                <div className="px-5 pb-5 animate-fade-in">
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">SKU</dt>
                      <dd className="text-gray-900 font-medium">{product.sku}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Category</dt>
                      <dd className="text-gray-900 font-medium">{product.category}</dd>
                    </div>
                    {product.variants.length > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Variants</dt>
                        <dd className="text-gray-900 font-medium">{product.variants.length} options</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              You May Also Like
            </h2>
            <Link
              href="/store"
              className="group text-sm font-semibold text-primary-600 hover:text-primary-700 transition-all flex items-center gap-1 px-3 py-1.5 -mr-3 rounded-lg hover:bg-primary-50 hover:underline underline-offset-4 decoration-primary-300"
            >
              View all
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.slug}
                href={`/store/${rp.slug}`}
                className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-primary-glow hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-square bg-gray-100 flex items-center justify-center text-gray-300 overflow-hidden">
                  {rp.imageUrl ? (
                    <Image src={rp.imageUrl} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  ) : (
                    <svg
                      className="w-16 h-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={0.5}
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"
                      />
                    </svg>
                  )}
                  {rp.compareAtPrice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      Sale
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    {rp.category}
                  </p>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {rp.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold gradient-text">
                      {'\u20AC'}{rp.basePrice.toFixed(2)}
                    </span>
                    {rp.compareAtPrice && (
                      <span className="text-sm text-red-400 line-through">
                        {'\u20AC'}{rp.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
