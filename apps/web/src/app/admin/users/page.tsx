'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { formatDate } from '@/lib/format-date';

type UserRole = 'user' | 'editor' | 'admin' | 'super_admin';
type UserStatusType = 'active' | 'inactive' | 'suspended' | 'deleted';

interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  status: UserStatusType;
  avatar_url: string | null;
  last_login_at: string | null;
  created_at: string;
}

const ROLE_STYLES: Record<UserRole, string> = {
  user: 'bg-gray-100 text-gray-700',
  editor: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800',
  super_admin: 'bg-amber-100 text-amber-800',
};

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'User',
  editor: 'Editor',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const STATUS_STYLES: Record<UserStatusType, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  suspended: 'bg-red-100 text-red-700',
  deleted: 'bg-gray-200 text-gray-500',
};

const STATUS_LABELS: Record<UserStatusType, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  deleted: 'Deleted',
};

export default function UsersAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 20;

  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/admin/users', {
        params: {
          page,
          limit,
          search: search || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      setUsers(data.data ?? []);
      const total = data.total ?? 0;
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load users';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    try {
      setError(null);
      await apiClient.patch(`/admin/users/${id}/role`, { role: newRole });
      await fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to update role');
    }
  };

  const handleStatusToggle = async (user: AdminUser) => {
    const newStatus: UserStatusType =
      user.status === 'active' ? 'suspended' : 'active';
    try {
      setError(null);
      await apiClient.patch(`/admin/users/${user.id}/status`, {
        status: newStatus,
      });
      await fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string, displayName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${displayName}"? This action cannot be undone.`,
      )
    )
      return;
    try {
      setError(null);
      await apiClient.delete(`/admin/users/${id}`);
      await fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to delete user');
    }
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Users</h2>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email..."
          className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm w-64"
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchUsers}
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
          <span className="text-sm text-gray-500">Loading users...</span>
        </div>
      ) : (
        <>
          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">User</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Email</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Role</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Status</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Last Login</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Joined</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isCurrentUser = user.id === currentUser?.id;
                    const canModify = !isCurrentUser && user.status !== 'deleted';

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        {/* Avatar + Name */}
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0 overflow-hidden">
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
                            <span className="font-medium text-gray-900 truncate max-w-[160px]">
                              {user.display_name}
                              {isCurrentUser && (
                                <span className="ml-1.5 text-xs text-gray-400">(you)</span>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-3 py-2 text-gray-600">{user.email}</td>

                        {/* Role */}
                        <td className="px-3 py-2">
                          {isSuperAdmin && canModify ? (
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleRoleChange(user.id, e.target.value as UserRole)
                              }
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${ROLE_STYLES[user.role]}`}
                            >
                              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[user.role]}`}
                            >
                              {ROLE_LABELS[user.role]}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[user.status]}`}
                          >
                            {STATUS_LABELS[user.status]}
                          </span>
                        </td>

                        {/* Last Login */}
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                          {formatDate(user.last_login_at) || '—'}
                        </td>

                        {/* Joined */}
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                          {formatDate(user.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-2">
                            {canModify && (
                              <>
                                <button
                                  onClick={() => handleStatusToggle(user)}
                                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                                    user.status === 'active'
                                      ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                      : 'text-green-700 bg-green-50 hover:bg-green-100'
                                  }`}
                                >
                                  {user.status === 'active' ? 'Suspend' : 'Activate'}
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(user.id, user.display_name)
                                  }
                                  className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
