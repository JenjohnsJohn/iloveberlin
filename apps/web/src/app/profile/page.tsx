'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { ProtectedRoute } from '@/components/auth/protected-route';
import apiClient from '@/lib/api-client';

function ProfileContent() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');

  const handleStartEdit = () => {
    setDisplayName(user?.display_name || '');
    setBio(user?.bio || '');
    setLocation(user?.location || '');
    setWebsite(user?.website || '');
    setIsEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const { data } = await apiClient.patch('/users/me', {
        display_name: displayName,
        bio: bio || null,
        location: location || null,
        website: website || null,
      });
      setUser(data);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      {saveSuccess && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600 flex items-center gap-2 animate-fade-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Profile updated successfully.
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

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-primary-50 to-white rounded-xl border border-gray-200 shadow-soft mb-6 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-primary-100 ring-4 ring-primary-100 flex items-center justify-center text-primary-700 text-3xl font-bold overflow-hidden shadow-sm">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.display_name.charAt(0).toUpperCase()
                )}
              </div>
              {!isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-primary-50 hover:border-primary-300 transition-colors"
                  title="Edit Profile"
                >
                  <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 truncate">{user.display_name}</h2>
              <p className="text-gray-500 text-sm truncate">{user.email}</p>
              <div className="flex items-center flex-wrap gap-2 mt-2">
                {user.is_verified ? (
                  <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full font-medium">
                    Unverified
                  </span>
                )}
                <span className="inline-flex items-center text-xs text-gray-400 gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Member since {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Personal Info</h3>
          </div>
          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white outline-none transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white outline-none resize-none transition-all duration-200 text-sm"
                placeholder="Tell us about yourself"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
                Location
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white outline-none transition-all duration-200 text-sm"
                  placeholder="e.g., Berlin, Germany"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1.5">
                Website
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white outline-none transition-all duration-200 text-sm"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4">
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <div>
                <dt className="text-sm font-medium text-gray-500">Bio</dt>
                <dd className="mt-0.5 text-sm text-gray-900">{user.bio || 'No bio yet'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-0.5 text-sm text-gray-900">{user.location || 'Not specified'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div>
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-0.5 text-sm text-gray-900">
                  {user.website ? (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {user.website}
                    </a>
                  ) : (
                    'Not specified'
                  )}
                </dd>
              </div>
            </div>
          </dl>
        )}
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-soft">
        <div className="flex items-center gap-2 mb-5">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
        </div>
        <dl className="space-y-4">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-0.5 text-sm text-gray-900">{user.email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
              <dd className="mt-0.5 text-sm text-gray-900">
                {user.is_verified ? 'Email verified' : 'Email not verified'}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-5">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
        </div>
        <dl className="space-y-4">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-0.5 text-sm text-gray-900 capitalize">{user.role}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div>
              <dt className="text-sm font-medium text-gray-500">Notifications</dt>
              <dd className="mt-0.5">
                <a
                  href="/profile/notifications"
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline font-medium"
                >
                  Manage notification preferences
                </a>
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
