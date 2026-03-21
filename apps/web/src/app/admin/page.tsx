'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { formatDateShort } from '@/lib/format-date';

// ─── Types ───────────────────────────────────────────────────

interface DashboardStat {
  key: string;
  label: string;
  value: string;
  change: string;
  href: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  valueColor: string;
  icon: (cls: string) => ReactNode;
}

interface GrowthDataPoint {
  date: string;
  count: number;
}

interface PopularContentItem {
  id: string;
  title: string;
  type: string;
  views: number;
  date: string;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  entityType: string;
  entity: string;
  timestamp: string;
}

// ─── Stat Card Icon Config ───────────────────────────────────
// Maps stat keys from the API to their icon/color/link configuration.
// This ensures icons survive regardless of what the API returns.

const STAT_ICON_CONFIG: Record<
  string,
  {
    label: string;
    href: string;
    iconBg: string;
    iconColor: string;
    borderColor: string;
    valueColor: string;
    icon: (cls: string) => ReactNode;
  }
> = {
  totalUsers: {
    label: 'Total Users',
    href: '/admin/users',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
    borderColor: 'border-l-violet-400',
    valueColor: 'text-violet-700',
    icon: (cls: string) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  totalArticles: {
    label: 'Total Articles',
    href: '/admin/articles',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    borderColor: 'border-l-blue-400',
    valueColor: 'text-blue-700',
    icon: (cls: string) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" />
      </svg>
    ),
  },
  totalEvents: {
    label: 'Total Events',
    href: '/admin/events',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    borderColor: 'border-l-purple-400',
    valueColor: 'text-purple-700',
    icon: (cls: string) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  totalRestaurants: {
    label: 'Total Restaurants',
    href: '/admin/dining',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    borderColor: 'border-l-amber-400',
    valueColor: 'text-amber-700',
    icon: (cls: string) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m18-4.5a9 9 0 0 0-18 0" />
      </svg>
    ),
  },
  totalVideos: {
    label: 'Total Videos',
    href: '/admin/videos',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    borderColor: 'border-l-rose-400',
    valueColor: 'text-rose-700',
    icon: (cls: string) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
      </svg>
    ),
  },
  totalGuides: {
    label: 'Total Guides',
    href: '/admin/guides',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    borderColor: 'border-l-emerald-400',
    valueColor: 'text-emerald-700',
    icon: (cls: string) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  totalClassifieds: {
    label: 'Total Classifieds',
    href: '/admin/classifieds',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-500',
    borderColor: 'border-l-teal-400',
    valueColor: 'text-teal-700',
    icon: (cls: string) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    ),
  },
  totalProducts: {
    label: 'Total Products',
    href: '/admin/store',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    borderColor: 'border-l-orange-400',
    valueColor: 'text-orange-700',
    icon: (cls: string) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
  activeCompetitions: {
    label: 'Active Competitions',
    href: '/admin/competitions',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
    borderColor: 'border-l-indigo-400',
    valueColor: 'text-indigo-700',
    icon: (cls: string) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 0 1-2.77.896m5.25-7.388v1.516" />
      </svg>
    ),
  },
  pageViewsToday: {
    label: 'Page Views Today',
    href: '#',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-500',
    borderColor: 'border-l-cyan-400',
    valueColor: 'text-cyan-700',
    icon: (cls: string) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
};

// Known stat keys in display order
const STAT_KEYS_ORDER = [
  'totalUsers',
  'totalArticles',
  'totalEvents',
  'totalRestaurants',
  'totalVideos',
  'totalGuides',
  'totalClassifieds',
  'totalProducts',
  'activeCompetitions',
  'pageViewsToday',
];

// ─── Map API Response to Stat Cards ──────────────────────────
// Handles different API response formats: the API might return
// { totalUsers: 1247, totalArticles: 342, ... } as a flat object,
// or it might return an array of { key, value, change } objects,
// or use snake_case keys like total_users. This function normalises them all.

function camelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function mapResponseToStats(data: unknown): DashboardStat[] {
  // If the API returns an array of stat objects
  if (Array.isArray(data)) {
    return data
      .map((item: Record<string, unknown>) => {
        const key = camelCase(String(item.key || item.name || ''));
        const config = STAT_ICON_CONFIG[key];
        if (!config) return null;
        return {
          key,
          label: config.label,
          value: formatStatValue(item.value),
          change: String(item.change ?? item.changePercent ?? '0%'),
          href: config.href,
          iconBg: config.iconBg,
          iconColor: config.iconColor,
          borderColor: config.borderColor,
          valueColor: config.valueColor,
          icon: config.icon,
        } as DashboardStat;
      })
      .filter(Boolean) as DashboardStat[];
  }

  // If the API returns a flat object like { totalUsers: 1247, ... }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const stats: DashboardStat[] = [];

    // Try each known key (or its snake_case variant) in order
    for (const key of STAT_KEYS_ORDER) {
      const config = STAT_ICON_CONFIG[key];
      if (!config) continue;

      // Look for the value under camelCase, snake_case, or nested
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      const rawValue = obj[key] ?? obj[snakeKey];
      const rawChange =
        obj[`${key}Change`] ??
        obj[`${snakeKey}_change`] ??
        obj.changes?.[key as keyof typeof obj.changes];

      if (rawValue !== undefined) {
        stats.push({
          key,
          label: config.label,
          value: formatStatValue(rawValue),
          change: formatChange(rawChange),
          href: config.href,
          iconBg: config.iconBg,
          iconColor: config.iconColor,
          borderColor: config.borderColor,
          valueColor: config.valueColor,
          icon: config.icon,
        });
      }
    }
    return stats;
  }

  return [];
}

function formatStatValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value ?? '0');
}

function formatChange(value: unknown): string {
  if (value === undefined || value === null) return '0%';
  const str = String(value);
  // If it already has a % sign, return as-is
  if (str.includes('%')) return str;
  // If it's a number, add %
  const num = Number(value);
  if (!isNaN(num)) {
    return num > 0 ? `+${num}%` : `${num}%`;
  }
  return str;
}

// ─── Map API Growth Data ─────────────────────────────────────

function mapGrowthData(data: unknown): GrowthDataPoint[] {
  if (Array.isArray(data)) {
    return data.map((item: Record<string, unknown>) => ({
      date: String(item.date ?? item.day ?? item.label ?? ''),
      count: Number(item.count ?? item.value ?? item.total ?? 0),
    }));
  }
  return [];
}

// ─── Map API Popular Content ─────────────────────────────────

function mapPopularContent(data: unknown): PopularContentItem[] {
  if (Array.isArray(data)) {
    return data.map((item: Record<string, unknown>, index: number) => ({
      id: String(item.id ?? item._id ?? index + 1),
      title: String(item.title ?? item.name ?? ''),
      type: String(item.type ?? item.contentType ?? item.content_type ?? 'article'),
      views: Number(item.views ?? item.viewCount ?? item.view_count ?? 0),
      date: String(item.date ?? item.publishedAt ?? item.published_at ?? item.createdAt ?? item.created_at ?? ''),
    }));
  }
  // Some APIs wrap the array in a `data` or `items` property
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    return mapPopularContent(obj.data ?? obj.items ?? obj.content ?? []);
  }
  return [];
}

// ─── Map API Activity Log ────────────────────────────────────

function mapActivityLog(data: unknown): ActivityItem[] {
  let items: unknown[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    items = (obj.data ?? obj.items ?? obj.activities ?? []) as unknown[];
  }

  return items.map((item: unknown, index: number) => {
    const a = item as Record<string, unknown>;
    return {
      id: String(a.id ?? a._id ?? index + 1),
      user: String(a.user ?? a.userName ?? a.user_name ?? 'Unknown'),
      action: String(a.action ?? a.type ?? ''),
      entityType: String(a.entityType ?? a.entity_type ?? a.resourceType ?? a.resource_type ?? ''),
      entity: String(a.entity ?? a.entityName ?? a.entity_name ?? a.resource ?? ''),
      timestamp: String(a.timestamp ?? a.time ?? a.createdAt ?? a.created_at ?? ''),
    };
  });
}

// ─── Style Mappings ──────────────────────────────────────────

const TYPE_BADGE_STYLES: Record<string, string> = {
  article: 'bg-blue-100 text-blue-800',
  event: 'bg-purple-100 text-purple-800',
  video: 'bg-orange-100 text-orange-800',
  guide: 'bg-green-100 text-green-800',
};

const ACTION_STYLES: Record<string, string> = {
  created: 'text-green-700',
  updated: 'text-blue-700',
  published: 'text-indigo-700',
  deleted: 'text-red-700',
  archived: 'text-gray-700',
  uploaded: 'text-teal-700',
};

// ─── Skeleton Components ─────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-gray-200 p-3.5 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-7 w-16 bg-gray-200 rounded mt-2" />
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
      </div>
      <div className="mt-2 h-3 w-32 bg-gray-100 rounded" />
    </div>
  );
}

function ChartSkeleton({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
      <h3 className="text-base font-semibold text-gray-900 mb-3">{label}</h3>
      <div className="flex items-end gap-1 h-32">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="h-3 w-4 bg-gray-100 rounded" />
            <div
              className="w-full bg-gray-200 rounded-t-md"
              style={{ height: `${20 + Math.random() * 60}%`, minHeight: '4px' }}
            />
            <div className="h-3 w-4 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5 animate-pulse">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="h-5 w-36 bg-gray-200 rounded" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 w-6 bg-gray-100 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full" />
              <div className="h-4 w-64 bg-gray-200 rounded" />
            </div>
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Error Banner ────────────────────────────────────────────

function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <p className="text-sm text-red-700">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-red-700 hover:text-red-900 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ─── SimpleBarChart ──────────────────────────────────────────

function SimpleBarChart({
  data,
  label,
  barColor,
}: {
  data: { date: string; count: number }[];
  label: string;
  barColor: string;
}) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3">{label}</h3>
      <div className="flex items-end gap-1 h-32">
        {data.map((d) => {
          const heightPercent = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
          return (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-xs text-gray-500">{d.count}</span>
              <div
                className={`w-full ${barColor} rounded-t-md`}
                style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                title={`${d.date}: ${d.count}`}
              />
              <span className="text-xs text-gray-400 truncate w-full text-center">
                {formatDateShort(d.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [contentGrowthData, setContentGrowthData] = useState<GrowthDataPoint[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<GrowthDataPoint[]>([]);
  const [popularContent, setPopularContent] = useState<PopularContentItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  const [statsLoading, setStatsLoading] = useState(true);
  const [contentGrowthLoading, setContentGrowthLoading] = useState(true);
  const [userGrowthLoading, setUserGrowthLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  const [statsError, setStatsError] = useState<string | null>(null);
  const [contentGrowthError, setContentGrowthError] = useState<string | null>(null);
  const [userGrowthError, setUserGrowthError] = useState<string | null>(null);
  const [popularError, setPopularError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);

  // ── Fetch Dashboard Stats ──────────────────────────────────
  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await apiClient.get('/admin/dashboard');
      const mapped = mapResponseToStats(res.data);
      setStats(mapped);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setStatsError('Failed to load dashboard stats. Please try again.');
    } finally {
      setStatsLoading(false);
    }
  };

  // ── Fetch Content Growth ───────────────────────────────────
  const fetchContentGrowth = async () => {
    setContentGrowthLoading(true);
    setContentGrowthError(null);
    try {
      const res = await apiClient.get('/admin/content-growth', { params: { days: 12 } });
      const mapped = mapGrowthData(res.data);
      setContentGrowthData(mapped);
    } catch (err) {
      console.error('Failed to load content growth:', err);
      setContentGrowthError('Failed to load content growth data.');
    } finally {
      setContentGrowthLoading(false);
    }
  };

  // ── Fetch User Growth ──────────────────────────────────────
  const fetchUserGrowth = async () => {
    setUserGrowthLoading(true);
    setUserGrowthError(null);
    try {
      const res = await apiClient.get('/admin/user-growth', { params: { days: 12 } });
      const mapped = mapGrowthData(res.data);
      setUserGrowthData(mapped);
    } catch (err) {
      console.error('Failed to load user growth:', err);
      setUserGrowthError('Failed to load user growth data.');
    } finally {
      setUserGrowthLoading(false);
    }
  };

  // ── Fetch Popular Content ──────────────────────────────────
  const fetchPopularContent = async () => {
    setPopularLoading(true);
    setPopularError(null);
    try {
      const res = await apiClient.get('/admin/popular-content');
      const mapped = mapPopularContent(res.data);
      setPopularContent(mapped);
    } catch (err) {
      console.error('Failed to load popular content:', err);
      setPopularError('Failed to load popular content.');
    } finally {
      setPopularLoading(false);
    }
  };

  // ── Fetch Activity Log ─────────────────────────────────────
  const fetchActivity = async () => {
    setActivityLoading(true);
    setActivityError(null);
    try {
      const res = await apiClient.get('/admin/activity-log', { params: { page: 1, limit: 20 } });
      const mapped = mapActivityLog(res.data);
      setRecentActivity(mapped);
    } catch (err) {
      console.error('Failed to load activity log:', err);
      setActivityError('Failed to load recent activity.');
    } finally {
      setActivityLoading(false);
    }
  };

  // ── Initial Load ───────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    fetchContentGrowth();
    fetchUserGrowth();
    fetchPopularContent();
    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening with your site today.</p>
      </div>

      {/* Stats Cards Row */}
      {statsError && <ErrorBanner message={statsError} onRetry={fetchStats} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-5">
        {statsLoading
          ? Array.from({ length: 10 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className={`group bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${stat.borderColor} p-3.5 hover:shadow-md hover:scale-[1.02] hover:border-gray-200 transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.valueColor} mt-1`}>{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {stat.icon(`w-5 h-5 ${stat.iconColor}`)}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {stat.change.startsWith('+') ? (
                    <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l7.5-7.5 7.5 7.5" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                    </svg>
                  )}
                  <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-500'}`}>
                    {stat.change} from last month
                  </span>
                </div>
              </Link>
            ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" />
            </svg>
            New Article
          </Link>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            New Event
          </Link>
          <Link
            href="/admin/guides/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            New Guide
          </Link>
          <Link
            href="/admin/media"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            Upload Media
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            Manage Users
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Settings
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      {(contentGrowthError || userGrowthError) && (
        <ErrorBanner
          message={contentGrowthError || userGrowthError || 'Failed to load growth data.'}
          onRetry={() => {
            if (contentGrowthError) fetchContentGrowth();
            if (userGrowthError) fetchUserGrowth();
          }}
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {contentGrowthLoading ? (
          <ChartSkeleton label="Content Growth (Last 12 Days)" />
        ) : contentGrowthData.length > 0 ? (
          <SimpleBarChart
            data={contentGrowthData}
            label="Content Growth (Last 12 Days)"
            barColor="bg-primary-400"
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Content Growth (Last 12 Days)</h3>
            <p className="text-sm text-gray-500">No content growth data available.</p>
          </div>
        )}
        {userGrowthLoading ? (
          <ChartSkeleton label="User Growth (Last 12 Days)" />
        ) : userGrowthData.length > 0 ? (
          <SimpleBarChart
            data={userGrowthData}
            label="User Growth (Last 12 Days)"
            barColor="bg-primary-600"
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">User Growth (Last 12 Days)</h3>
            <p className="text-sm text-gray-500">No user growth data available.</p>
          </div>
        )}
      </div>

      {/* Popular Content Table */}
      {popularError && <ErrorBanner message={popularError} onRetry={fetchPopularContent} />}
      {popularLoading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Popular Content</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 font-semibold text-gray-700">#</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700">Title</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700">Type</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700">Views</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {popularContent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No popular content data available.
                    </td>
                  </tr>
                ) : (
                  popularContent.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                      <td className="px-3 py-2">
                        <span className="font-medium text-gray-900 line-clamp-1">
                          {item.title}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            TYPE_BADGE_STYLES[item.type] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600 font-medium">
                        {item.views.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                        {item.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity Log */}
      {activityError && <ErrorBanner message={activityError} onRetry={fetchActivity} />}
      {activityLoading ? (
        <ActivitySkeleton />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                No recent activity.
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gray-600">
                        {activity.user.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className={ACTION_STYLES[activity.action] || 'text-gray-600'}>
                          {activity.action}
                        </span>{' '}
                        <span className="text-gray-500">{activity.entityType}</span>{' '}
                        <span className="font-medium text-gray-700">{activity.entity}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {activity.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
