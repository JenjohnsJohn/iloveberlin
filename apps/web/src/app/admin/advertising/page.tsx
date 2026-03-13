'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

// ─── Types ────────────────────────────────────────────────────

type ActiveTab = 'campaigns' | 'analytics';
type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
type AdPosition = 'homepage_banner' | 'sidebar' | 'article_inline' | 'category_header' | 'footer';

interface Placement {
  id: string;
  position: AdPosition;
  imageUrl: string;
  linkUrl: string;
  impressions: number;
  clicks: number;
  isActive: boolean;
}

interface Campaign {
  id: string;
  name: string;
  advertiser: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  budget: number;
  impressions: number;
  clicks: number;
  placements: Placement[];
}

// ─── Status Styles ────────────────────────────────────────────

const CAMPAIGN_STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-700',
};

const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const POSITION_LABELS: Record<AdPosition, string> = {
  homepage_banner: 'Homepage Banner',
  sidebar: 'Sidebar',
  article_inline: 'Article Inline',
  category_header: 'Category Header',
  footer: 'Footer',
};

// ─── Mappers ─────────────────────────────────────────────────

function mapPlacement(raw: Record<string, unknown>): Placement {
  return {
    id: String(raw.id || ''),
    position: (raw.position as AdPosition) || 'sidebar',
    imageUrl: String(raw.image_url ?? raw.imageUrl ?? ''),
    linkUrl: String(raw.link_url ?? raw.linkUrl ?? ''),
    impressions: Number(raw.impressions ?? 0),
    clicks: Number(raw.clicks ?? 0),
    isActive: Boolean(raw.is_active ?? raw.isActive ?? true),
  };
}

function mapCampaign(raw: Record<string, unknown>): Campaign {
  const rawPlacements = raw.placements;
  const placements = Array.isArray(rawPlacements)
    ? rawPlacements.map((p: Record<string, unknown>) => mapPlacement(p))
    : [];
  const startDate = String(raw.start_date ?? raw.startDate ?? '');
  const endDate = String(raw.end_date ?? raw.endDate ?? '');
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    advertiser: String(raw.advertiser || ''),
    status: (raw.status as CampaignStatus) || 'draft',
    startDate: startDate.includes('T') ? startDate.split('T')[0] : startDate,
    endDate: endDate.includes('T') ? endDate.split('T')[0] : endDate,
    budget: Number(raw.budget ?? 0),
    impressions: Number(raw.impressions ?? 0),
    clicks: Number(raw.clicks ?? 0),
    placements,
  };
}

// ─── Component ────────────────────────────────────────────────

export default function AdvertisingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('campaigns');
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [formName, setFormName] = useState('');
  const [formAdvertiser, setFormAdvertiser] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formBudget, setFormBudget] = useState('');

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/admin/campaigns');
      const items = Array.isArray(data) ? data : data.data ?? [];
      setCampaigns(items.map((c: Record<string, unknown>) => mapCampaign(c)));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load campaigns';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreateCampaign = async () => {
    if (!formName) return;
    try {
      setError(null);
      await apiClient.post('/admin/campaigns', {
        name: formName,
        advertiser: formAdvertiser,
        start_date: formStartDate,
        end_date: formEndDate,
        budget: parseFloat(formBudget) || 0,
      });
      setFormName('');
      setFormAdvertiser('');
      setFormStartDate('');
      setFormEndDate('');
      setFormBudget('');
      setShowCreateForm(false);
      await fetchCampaigns();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create campaign';
      setError(message);
    }
  };

  // Edit modal state
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editName, setEditName] = useState('');
  const [editAdvertiser, setEditAdvertiser] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editBudget, setEditBudget] = useState('');

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setEditName(campaign.name);
    setEditAdvertiser(campaign.advertiser);
    setEditStartDate(campaign.startDate);
    setEditEndDate(campaign.endDate);
    setEditBudget(String(campaign.budget));
  };

  const handleEditCampaign = async () => {
    if (!editingCampaign || !editName) return;
    try {
      setError(null);
      await apiClient.put(`/admin/campaigns/${editingCampaign.id}`, {
        name: editName,
        advertiser: editAdvertiser,
        start_date: editStartDate,
        end_date: editEndDate,
        budget: parseFloat(editBudget) || 0,
      });
      setEditingCampaign(null);
      await fetchCampaigns();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update campaign';
      setError(message);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      setError(null);
      await apiClient.delete(`/admin/campaigns/${id}`);
      await fetchCampaigns();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete campaign';
      setError(message);
    }
  };

  const handlePauseCampaign = async (id: string) => {
    try {
      setError(null);
      await apiClient.put(`/admin/campaigns/${id}`, { status: 'paused' });
      await fetchCampaigns();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to pause campaign';
      setError(message);
    }
  };

  const handleResumeCampaign = async (id: string) => {
    try {
      setError(null);
      await apiClient.put(`/admin/campaigns/${id}`, { status: 'active' });
      await fetchCampaigns();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to resume campaign';
      setError(message);
    }
  };

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: 'campaigns', label: 'Campaigns' },
    { key: 'analytics', label: 'Analytics' },
  ];

  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const topPerforming = [...campaigns]
    .filter((c) => c.impressions > 0)
    .sort((a, b) => {
      const ctrA = a.impressions > 0 ? a.clicks / a.impressions : 0;
      const ctrB = b.impressions > 0 ? b.clicks / b.impressions : 0;
      return ctrB - ctrA;
    })
    .slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Advertising</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + New Campaign
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Campaign</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                placeholder="Enter campaign name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advertiser
              </label>
              <input
                type="text"
                placeholder="Enter advertiser name"
                value={formAdvertiser}
                onChange={(e) => setFormAdvertiser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget (EUR)
              </label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formBudget}
                onChange={(e) => setFormBudget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreateCampaign}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Create Campaign
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <>
          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Campaign</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Advertiser</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Dates</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Budget</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Impressions</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Clicks</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">CTR</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => {
                      const ctr = campaign.impressions > 0
                        ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
                        : '0.00';
                      const isExpanded = expandedCampaign === campaign.id;

                      return (
                        <tr key={campaign.id} className="border-b border-gray-100">
                          <td colSpan={9} className="p-0">
                            {/* Campaign Row */}
                            <div className="flex items-center hover:bg-gray-50 transition-colors">
                              <div className="px-4 py-3 flex-1 min-w-0">
                                <button
                                  onClick={() =>
                                    setExpandedCampaign(isExpanded ? null : campaign.id)
                                  }
                                  className="font-medium text-gray-900 hover:text-primary-600 text-left"
                                >
                                  {campaign.name}
                                  {campaign.placements && campaign.placements.length > 0 && (
                                    <span className="ml-1 text-xs text-gray-400">
                                      ({campaign.placements.length} placements)
                                    </span>
                                  )}
                                </button>
                              </div>
                              <div className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                {campaign.advertiser}
                              </div>
                              <div className="px-4 py-3">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${CAMPAIGN_STATUS_STYLES[campaign.status]}`}
                                >
                                  {CAMPAIGN_STATUS_LABELS[campaign.status]}
                                </span>
                              </div>
                              <div className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                                {campaign.startDate} - {campaign.endDate}
                              </div>
                              <div className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                {'\u20AC'}{campaign.budget.toLocaleString()}
                              </div>
                              <div className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                {campaign.impressions.toLocaleString()}
                              </div>
                              <div className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                {campaign.clicks.toLocaleString()}
                              </div>
                              <div className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                {ctr}%
                              </div>
                              <div className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openEditModal(campaign)}
                                    className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  {campaign.status === 'active' && (
                                    <button
                                      onClick={() => handlePauseCampaign(campaign.id)}
                                      className="px-3 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 rounded hover:bg-yellow-100 transition-colors"
                                    >
                                      Pause
                                    </button>
                                  )}
                                  {campaign.status === 'paused' && (
                                    <button
                                      onClick={() => handleResumeCampaign(campaign.id)}
                                      className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
                                    >
                                      Resume
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                    className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Placements */}
                            {isExpanded && campaign.placements && campaign.placements.length > 0 && (
                              <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                  Placements
                                </h4>
                                <div className="space-y-3">
                                  {campaign.placements.map((placement) => (
                                    <div
                                      key={placement.id}
                                      className="bg-white rounded border border-gray-200 p-3 flex items-center justify-between"
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                          Ad
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">
                                            {POSITION_LABELS[placement.position] || placement.position}
                                          </p>
                                          <p className="text-xs text-gray-500 truncate max-w-xs">
                                            {placement.linkUrl}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-6 text-xs text-gray-600">
                                        <span>{placement.impressions.toLocaleString()} impressions</span>
                                        <span>{placement.clicks.toLocaleString()} clicks</span>
                                        <span
                                          className={`px-2 py-0.5 rounded-full font-medium ${
                                            placement.isActive
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-gray-100 text-gray-600'
                                          }`}
                                        >
                                          {placement.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {campaigns.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No campaigns found.</p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <p className="text-sm text-gray-500">Total Impressions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalImpressions.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <p className="text-sm text-gray-500">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalClicks.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <p className="text-sm text-gray-500">Overall CTR</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{overallCTR}%</p>
                </div>
              </div>

              {/* Active Campaigns Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Active Campaigns
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {activeCampaigns.length} campaign{activeCampaigns.length !== 1 ? 's' : ''} currently running
                </p>
                {activeCampaigns.length > 0 ? (
                  <div className="space-y-3">
                    {activeCampaigns.map((campaign) => {
                      const ctr = campaign.impressions > 0
                        ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
                        : '0.00';
                      const budgetUsed = campaign.budget > 0
                        ? Math.min(((campaign.clicks * 0.5) / campaign.budget) * 100, 100)
                        : 0;

                      return (
                        <div
                          key={campaign.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {campaign.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {campaign.startDate} - {campaign.endDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span>{campaign.impressions.toLocaleString()} impressions</span>
                            <span>{campaign.clicks.toLocaleString()} clicks</span>
                            <span>{ctr}% CTR</span>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Budget used (estimated)</span>
                              <span>{budgetUsed.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-primary-600 h-1.5 rounded-full"
                                style={{ width: `${budgetUsed}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No active campaigns.</p>
                )}
              </div>

              {/* Top Performing Campaigns */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Performing Campaigns (by CTR)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">#</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Campaign</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Impressions</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Clicks</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">CTR</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPerforming.map((campaign, index) => {
                        const ctr = campaign.impressions > 0
                          ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
                          : '0.00';

                        return (
                          <tr
                            key={campaign.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {campaign.name}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {campaign.impressions.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {campaign.clicks.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {ctr}%
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${CAMPAIGN_STATUS_STYLES[campaign.status]}`}
                              >
                                {CAMPAIGN_STATUS_LABELS[campaign.status]}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-6">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advertiser
                </label>
                <input
                  type="text"
                  value={editAdvertiser}
                  onChange={(e) => setEditAdvertiser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (EUR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEditCampaign}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingCampaign(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
