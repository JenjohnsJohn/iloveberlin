'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface NotificationPreferences {
  email_new_articles: boolean;
  email_events: boolean;
  email_competitions: boolean;
  email_newsletter: boolean;
  push_new_articles: boolean;
  push_events: boolean;
  push_competitions: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email_new_articles: true,
  email_events: true,
  email_competitions: true,
  email_newsletter: true,
  push_new_articles: true,
  push_events: true,
  push_competitions: true,
};

function Toggle({
  enabled,
  onChange,
  label,
  description,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          enabled ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function NotificationsContent() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Mock save - in production this would call the API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/profile"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          &larr; Back to Profile
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Preferences</h1>
      <p className="text-gray-600 mb-8">
        Choose how you want to be notified about new content and updates.
      </p>

      {saveSuccess && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          Preferences saved successfully.
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {saveError}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Email Notifications */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Email Notifications</h2>
          <p className="text-sm text-gray-500 mb-4">
            Receive updates via email about content you care about.
          </p>
          <div className="divide-y divide-gray-100">
            <Toggle
              enabled={preferences.email_new_articles}
              onChange={(v) => updatePreference('email_new_articles', v)}
              label="New Articles"
              description="Get notified when new articles are published."
            />
            <Toggle
              enabled={preferences.email_events}
              onChange={(v) => updatePreference('email_events', v)}
              label="Events"
              description="Receive updates about upcoming events in Berlin."
            />
            <Toggle
              enabled={preferences.email_competitions}
              onChange={(v) => updatePreference('email_competitions', v)}
              label="Competitions"
              description="Be the first to know about new competitions and prizes."
            />
            <Toggle
              enabled={preferences.email_newsletter}
              onChange={(v) => updatePreference('email_newsletter', v)}
              label="Weekly Newsletter"
              description="A curated weekly digest of the best Berlin content."
            />
          </div>
        </div>

        {/* Push Notifications */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Push Notifications</h2>
          <p className="text-sm text-gray-500 mb-4">
            Receive instant push notifications on your device.
          </p>
          <div className="divide-y divide-gray-100">
            <Toggle
              enabled={preferences.push_new_articles}
              onChange={(v) => updatePreference('push_new_articles', v)}
              label="New Articles"
              description="Instant alerts for new article publications."
            />
            <Toggle
              enabled={preferences.push_events}
              onChange={(v) => updatePreference('push_events', v)}
              label="Events"
              description="Push alerts for event reminders and updates."
            />
            <Toggle
              enabled={preferences.push_competitions}
              onChange={(v) => updatePreference('push_competitions', v)}
              label="Competitions"
              description="Instant alerts when new competitions launch."
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
