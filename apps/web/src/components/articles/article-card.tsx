import Link from 'next/link';
import Image from 'next/image';
import { buildArticleUrl } from '@/lib/news-seo-utils';
import { formatDate } from '@/lib/format-date';

export interface ArticleCardData {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  category: string;
  categorySlug: string;
  author: {
    name: string;
    avatarUrl: string | null;
  };
  publishedAt: string;
  readTime: number;
}

interface ArticleCardProps {
  article: ArticleCardData;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={buildArticleUrl(article.slug, article.categorySlug)}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-primary-glow hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <svg
              className="w-12 h-12 text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        )}
        {/* Category Badge */}
        {article.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
            {article.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
          {article.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {article.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {/* Author Avatar */}
            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold overflow-hidden flex-shrink-0">
              {article.author.avatarUrl ? (
                <Image
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              ) : (
                (article.author.name?.[0] ?? '?').toUpperCase()
              )}
            </div>
            <span className="font-medium text-gray-700">{article.author.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{formatDate(article.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.readTime} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
