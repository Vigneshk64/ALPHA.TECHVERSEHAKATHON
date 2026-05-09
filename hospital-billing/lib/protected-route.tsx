'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'patient' | 'doctor' | 'billing';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in
        router.push('/');
      } else if (user.role !== requiredRole) {
        // Wrong role
        router.push('/');
      }
    }
  }, [user, loading, requiredRole, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
