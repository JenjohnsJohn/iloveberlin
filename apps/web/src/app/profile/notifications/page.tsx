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
  icon,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 group">
      <div className="flex items-start gap-3 flex-1 pr-4">
        <span className="mt-0.5 text-gray-400 group-hover:text-primary-500 transition-colors">
          {icon}
        </span>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          enabled ? 'bg-primary-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${
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
    <div className="container mx-auto px-4 py-12 max-w-2xl animate-fade-in">
      <div className="mb-6">
        <Link
          href="/profile"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Profile
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Preferences</h1>
      <p className="text-gray-600 mb-8">
        Choose how you want to be notified about new content and updates.
      </p>

      {saveSuccess && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600 flex items-center gap-2 animate-fade-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Preferences saved successfully.
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2 animate-fade-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {saveError}
        </div>
      )}

      {/* Email Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft mb-6">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-7">
          Receive updates via email about content you care about.
        </p>
        <div className="divide-y divide-gray-100">
          <Toggle
            enabled={preferences.email_new_articles}
            onChange={(v) => updatePreference('email_new_articles', v)}
            label="New Articles"
            description="Get notified when new articles are published."
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            }
          />
          <Toggle
            enabled={preferences.email_events}
            onChange={(v) => updatePreference('email_events', v)}
            label="Events"
            description="Receive updates about upcoming events in Berlin."
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <Toggle
            enabled={preferences.email_competitions}
            onChange={(v) => updatePreference('email_competitions', v)}
            label="Competitions"
            description="Be the first to know about new competitions and prizes."
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
          />
          <Toggle
            enabled={preferences.email_newsletter}
            onChange={(v) => updatePreference('email_newsletter', v)}
            label="Weekly Newsletter"
            description="A curated weekly digest of the best Berlin content."
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Push Notifications</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-7">
          Receive instant push notifications on your device.
        </p>
        <div className="divide-y divide-gray-100">
          <Toggle
            enabled={preferences.push_new_articles}
            onChange={(v) => updatePreference('push_new_articles', v)}
            label="New Articles"
            description="Instant alerts for new article publications."
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            }
          />
          <Toggle
            enabled={preferences.push_events}
            onChange={(v) => updatePreference('push_events', v)}
            label="Events"
            description="Push alerts for event reminders and updates."
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <Toggle
            enabled={preferences.push_competitions}
            onChange={(v) => updatePreference('push_competitions', v)}
            label="Competitions"
            description="Instant alerts when new competitions launch."
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
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
