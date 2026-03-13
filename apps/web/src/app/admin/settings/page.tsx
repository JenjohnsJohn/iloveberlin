'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

type SettingType = 'string' | 'text' | 'number' | 'boolean' | 'json';
type SettingGroup = 'general' | 'seo' | 'social' | 'contact';

interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  type: SettingType;
  group: SettingGroup;
  label: string;
  description: string | null;
}

const GROUPS: { key: SettingGroup; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'seo', label: 'SEO' },
  { key: 'social', label: 'Social' },
  { key: 'contact', label: 'Contact' },
];

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<SettingGroup>('general');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/admin/settings');
      const list: SiteSetting[] = Array.isArray(data) ? data : data.data ?? [];
      setSettings(list);

      const values: Record<string, string> = {};
      for (const s of list) {
        values[s.key] = s.value ?? '';
      }
      setFormValues(values);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load settings';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const groupSettings = settings.filter((s) => s.group === activeGroup);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveGroup = async () => {
    const updates = groupSettings.map((s) => ({
      key: s.key,
      value: formValues[s.key] || null,
    }));

    try {
      setSaving(true);
      setError(null);
      await apiClient.patch('/admin/settings', { settings: updates });
      setSuccessMsg(`${GROUPS.find((g) => g.key === activeGroup)?.label} settings saved successfully`);
      await fetchSettings();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (setting: SiteSetting) => {
    const value = formValues[setting.key] ?? '';

    switch (setting.type) {
      case 'text':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-y"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        );
      case 'boolean':
        return (
          <button
            type="button"
            role="switch"
            aria-checked={value === 'true'}
            onClick={() =>
              handleChange(setting.key, value === 'true' ? 'false' : 'true')
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value === 'true' ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value === 'true' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );
      case 'json':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-mono resize-y"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchSettings}
            className="text-red-800 underline text-xs font-medium ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-6 w-6 text-primary-600 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-500">Loading settings...</span>
        </div>
      ) : (
        <>
          {/* Group Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-0 -mb-px">
              {GROUPS.map((group) => (
                <button
                  key={group.key}
                  onClick={() => setActiveGroup(group.key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeGroup === group.key
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {groupSettings.map((setting) => (
                <div key={setting.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {setting.label}
                  </label>
                  {setting.description && (
                    <p className="text-xs text-gray-500 mb-2">
                      {setting.description}
                    </p>
                  )}
                  {renderInput(setting)}
                </div>
              ))}
              {groupSettings.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No settings in this group.
                </p>
              )}
            </div>

            {groupSettings.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleSaveGroup}
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
