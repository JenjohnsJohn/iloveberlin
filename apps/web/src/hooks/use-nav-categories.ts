'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { NAV_SECTIONS } from '@/lib/nav-config';
import type { CategoryCardData } from '@/components/ui/category-grid';

const cache = new Map<string, CategoryCardData[]>();
const inflight = new Map<string, Promise<CategoryCardData[]>>();

async function fetchCategories(sectionKey: string): Promise<CategoryCardData[]> {
  const cached = cache.get(sectionKey);
  if (cached) return cached;

  const existing = inflight.get(sectionKey);
  if (existing) return existing;

  const section = NAV_SECTIONS.find((s) => s.key === sectionKey);
  if (!section) return [];

  const promise = apiClient
    .get(section.apiEndpoint)
    .then(({ data }) => {
      const categories: CategoryCardData[] = Array.isArray(data) ? data : data.data ?? [];
      cache.set(sectionKey, categories);
      return categories;
    })
    .catch(() => {
      return [] as CategoryCardData[];
    })
    .finally(() => {
      inflight.delete(sectionKey);
    });

  inflight.set(sectionKey, promise);
  return promise;
}

export function prefetchAdjacentSections(sectionKey: string) {
  const idx = NAV_SECTIONS.findIndex((s) => s.key === sectionKey);
  if (idx === -1) return;

  const neighbors = [idx - 1, idx + 1, idx - 2, idx + 2]
    .filter((i) => i >= 0 && i < NAV_SECTIONS.length)
    .slice(0, 2);

  for (const i of neighbors) {
    const key = NAV_SECTIONS[i].key;
    if (!cache.has(key) && !inflight.has(key)) {
      fetchCategories(key);
    }
  }
}

export function useNavCategories(sectionKey: string | null) {
  const [categories, setCategories] = useState<CategoryCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (key: string) => {
    const cached = cache.get(key);
    if (cached) {
      setCategories(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await fetchCategories(key);
    setCategories(result);
    setIsLoading(false);

    prefetchAdjacentSections(key);
  }, []);

  useEffect(() => {
    if (!sectionKey) {
      setCategories([]);
      setIsLoading(false);
      return;
    }
    load(sectionKey);
  }, [sectionKey, load]);

  return { categories, isLoading };
}
