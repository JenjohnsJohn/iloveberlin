'use client';

import { useState } from 'react';
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

  const addItem = useCartStore((s) => s.addItem);

  const variantTypes = product.variants.length > 0
    ? [...new Set(product.variants.map((v) => v.type))]
    : [];

  const currentVariant = product.variants.find((v) => v.id === selectedVariant);
  const displayPrice = currentVariant ? currentVariant.price : product.basePrice;

  const thumbnailCount = product.images.length > 0 ? product.images.length : 4;
  const thumbnails = Array.from({ length: thumbnailCount }, (_, i) => i);

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
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/store" className="hover:text-primary-600 transition-colors">
          Store
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Image Gallery */}
        <div>
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center text-gray-300">
            {product.images[selectedImageIndex]?.url ? (
              <Image
                src={product.images[selectedImageIndex].url!}
                alt={product.images[selectedImageIndex]?.alt || product.name}
                fill
                className="object-cover"
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
                className={`aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-300 border-2 transition-colors ${
                  selectedImageIndex === i
                    ? 'border-primary-600'
                    : 'border-transparent hover:border-gray-300'
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
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              {'\u20AC'}{displayPrice.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-gray-400 line-through">
                {'\u20AC'}{product.compareAtPrice.toFixed(2)}
              </span>
            )}
            {product.compareAtPrice && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                Sale
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
                </label>
                {type === 'Color' ? (
                  <div className="flex gap-2" role="radiogroup" aria-label={`Select ${type}`}>
                    {typeVariants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v.id)}
                        role="radio"
                        aria-checked={selectedVariant === v.id}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          selectedVariant === v.id
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <label htmlFor={`variant-${type}`} className="sr-only">Select {type}</label>
                    <select
                      id={`variant-${type}`}
                      value={selectedVariant || ''}
                      onChange={(e) => setSelectedVariant(e.target.value || null)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select {type}</option>
                      {typeVariants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                          {v.price !== product.basePrice
                            ? ` (+\u20AC${(v.price - product.basePrice).toFixed(2)})`
                            : ''}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            );
          })}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity
            </label>
            <div className="inline-flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-l-lg"
              >
                -
              </button>
              <span className="px-6 py-3 text-gray-900 font-medium border-x border-gray-200 min-w-[60px] text-center" aria-live="polite">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-r-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.variants.length > 0 && !selectedVariant}
            className={`w-full py-4 rounded-lg text-lg font-semibold transition-colors mb-4 ${
              addedToCart
                ? 'bg-green-600 text-white'
                : product.variants.length > 0 && !selectedVariant
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {addedToCart
              ? 'Added to Cart!'
              : product.variants.length > 0 && !selectedVariant
                ? `Select ${variantTypes[0]} to Continue`
                : 'Add to Cart'}
          </button>

          <Link
            href="/store/cart"
            className="block w-full text-center py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            View Cart
          </Link>

          {/* SKU */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">SKU:</span> {product.sku}
            </p>
          </div>

          {/* Description */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.slug}
                href={`/store/${rp.slug}`}
                className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
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
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    {rp.category}
                  </p>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {rp.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {'\u20AC'}{rp.basePrice.toFixed(2)}
                    </span>
                    {rp.compareAtPrice && (
                      <span className="text-sm text-gray-400 line-through">
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
