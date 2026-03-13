'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api-client';

interface BookmarkButtonProps {
  articleId: string;
  className?: string;
}

export function BookmarkButton({ articleId, className = '' }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { accessToken } = useAuthStore();
  const router = useRouter();

  // Check bookmark status on mount
  useEffect(() => {
    if (!accessToken || !articleId) return;
    apiClient.get(`/bookmarks/check/article/${articleId}`)
      .then(({ data }) => {
        setIsBookmarked(!!data.bookmarked || !!data.isBookmarked);
      })
      .catch(() => {
        // Ignore - non-critical
      });
  }, [accessToken, articleId]);

  const handleToggle = async () => {
    if (!accessToken) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    try {
      const { data } = await apiClient.post(`/bookmarks/article/${articleId}`);
      setIsBookmarked(!!data.bookmarked || !!data.isBookmarked || !isBookmarked);
    } catch {
      // Fallback toggle on error
      setIsBookmarked(!isBookmarked);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center justify-center p-2 rounded-full transition-colors ${
        isBookmarked
          ? 'text-accent-600 bg-accent-50 hover:bg-accent-100'
          : 'text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-gray-600'
      } ${className}`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this article'}
    >
      <svg
        className="w-5 h-5"
        fill={isBookmarked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={isBookmarked ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
