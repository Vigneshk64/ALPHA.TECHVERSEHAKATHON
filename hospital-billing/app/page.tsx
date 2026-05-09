'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      // Check if user has completed role setup
      const checkRoleSetup = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // User has role, redirect based on role
            if (userData.role === 'doctor') {
              router.push('/doctor');
            } else if (userData.role === 'patient') {
              router.push('/patient');
            } else if (userData.role === 'billing') {
              router.push('/billing');
            }
          } else {
            // New user, needs role selection
            router.push('/setup');
          }
        } catch (err) {
          console.error('Error checking role:', err);
        }
      };
      
      checkRoleSetup();
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
      // Auth context will handle the rest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      setSigningIn(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3"></h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">KVS Hospital </h2>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Manglore Karnataka</h2>
          <p className="text-gray-600">Transparent Healthcare Costs</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-blue-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome Back</h3>
          <p className="text-gray-600 text-sm mb-8">Sign in with your Google account to get started</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {signingIn ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Features */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-4">Get started with:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl">👤</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">As a Patient</p>
                  <p className="text-xs text-gray-600">View your bills in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">👨‍⚕️</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">As a Doctor</p>
                  <p className="text-xs text-gray-600">Add procedures and charges</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">📋</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">As Billing Staff</p>
                  <p className="text-xs text-gray-600">Manage final billing summaries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
