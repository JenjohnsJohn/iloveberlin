'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !accessToken) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [accessToken, isLoading, router]);

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center animate-pulse-soft">
          <svg className="w-6 h-6 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div className="container mx-auto px-4 py-24 text-center animate-fade-in">
        <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-accent-600 mb-4">Access Denied</h1>
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
