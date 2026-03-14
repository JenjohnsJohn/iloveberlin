'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

// ─── Types ────────────────────────────────────────────────────

interface Placement {
  id: string;
  position: string;
  image_url: string;
  link_url: string;
  impressions: number;
  clicks: number;
  is_active: boolean;
  campaign_name: string;
  campaign_id: string;
}

const POSITIONS: { key: string; label: string; description: string }[] = [
  { key: 'homepage_banner', label: 'Homepage Banner', description: 'Main banner at the top of the homepage' },
  { key: 'sidebar', label: 'Sidebar', description: 'Sidebar ad slot on article and listing pages' },
  { key: 'article_inline', label: 'Article Inline', description: 'Inline ad within article content' },
  { key: 'category_header', label: 'Category Header', description: 'Banner at the top of category pages' },
  { key: 'footer', label: 'Footer', description: 'Footer banner across all pages' },
];

// ─── Mapper ──────────────────────────────────────────────────

function mapPlacement(raw: Record<string, unknown>, campaignName: string, campaignId: string): Placement {
  return {
    id: String(raw.id || ''),
    position: String(raw.position || ''),
    image_url: String(raw.image_url ?? raw.imageUrl ?? ''),
    link_url: String(raw.link_url ?? raw.linkUrl ?? ''),
    impressions: Number(raw.impressions ?? 0),
    clicks: Number(raw.clicks ?? 0),
    is_active: Boolean(raw.is_active ?? raw.isActive ?? true),
    campaign_name: campaignName,
    campaign_id: campaignId,
  };
}

// ─── Component ───────────────────────────────────────────────

export default function AdPositionsPage() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

  const fetchPlacements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/admin/campaigns');
      const campaigns = Array.isArray(data) ? data : data.data ?? [];
      const allPlacements: Placement[] = [];
      for (const campaign of campaigns) {
        const rawPlacements = campaign.placements;
        if (Array.isArray(rawPlacements)) {
          for (const p of rawPlacements) {
            allPlacements.push(
              mapPlacement(p, String(campaign.name || ''), String(campaign.id || ''))
            );
          }
        }
      }
      setPlacements(allPlacements);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load ad positions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  const handleToggleActive = async (placement: Placement) => {
    try {
      setError(null);
      await apiClient.put(`/admin/placements/${placement.id}`, {
        is_active: !placement.is_active,
      });
      await fetchPlacements();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update placement';
      setError(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this placement?')) return;
    try {
      setError(null);
      await apiClient.delete(`/admin/placements/${id}`);
      await fetchPlacements();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete placement';
      setError(message);
    }
  };

  // Group placements by position
  const placementsByPosition: Record<string, Placement[]> = {};
  for (const pos of POSITIONS) {
    placementsByPosition[pos.key] = placements.filter((p) => p.position === pos.key);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Ad Positions &amp; Banners</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <>
          {POSITIONS.map((pos) => {
            const positionPlacements = placementsByPosition[pos.key] || [];
            const activePlacements = positionPlacements.filter((p) => p.is_active);
            const totalImpressions = positionPlacements.reduce((sum, p) => sum + p.impressions, 0);
            const totalClicks = positionPlacements.reduce((sum, p) => sum + p.clicks, 0);
            const ctr = totalImpressions > 0
              ? ((totalClicks / totalImpressions) * 100).toFixed(2)
              : '0.00';
            const isExpanded = expandedPosition === pos.key;

            return (
              <div key={pos.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{pos.label}</h3>
                    <p className="text-sm text-gray-500">{pos.description}</p>
                  </div>
                  <button
                    onClick={() => setExpandedPosition(isExpanded ? null : pos.key)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {isExpanded ? 'Collapse' : 'Manage'}
                  </button>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
                  <span>{activePlacements.length} active placement{activePlacements.length !== 1 ? 's' : ''}</span>
                  <span>{totalImpressions.toLocaleString()} impressions</span>
                  <span>{totalClicks.toLocaleString()} clicks</span>
                  <span>{ctr}% CTR</span>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {positionPlacements.length > 0 ? (
                      positionPlacements.map((placement) => {
                        const placementCtr = placement.impressions > 0
                          ? ((placement.clicks / placement.impressions) * 100).toFixed(2)
                          : '0.00';

                        return (
                          <div
                            key={placement.id}
                            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                                {placement.image_url ? (
                                  <img
                                    src={placement.image_url}
                                    alt="Ad preview"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  'Ad'
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {placement.campaign_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {placement.link_url}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-6 text-xs text-gray-600">
                                <span>{placement.impressions.toLocaleString()} impressions</span>
                                <span>{placement.clicks.toLocaleString()} clicks</span>
                                <span>{placementCtr}% CTR</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleActive(placement)}
                                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                                    placement.is_active
                                      ? 'text-green-700 bg-green-50 hover:bg-green-100'
                                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                                  }`}
                                >
                                  {placement.is_active ? 'Active' : 'Inactive'}
                                </button>
                                <button
                                  onClick={() => handleDelete(placement.id)}
                                  className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500 py-3">No active banners in this position</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-6">
            <Link href="/admin/advertising" className="text-sm text-gray-500 hover:text-gray-700">
              &larr; Manage campaigns in the Advertising page
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
