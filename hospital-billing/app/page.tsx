'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, onAuthStateChangedListener, getUserProfile } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (authUser) => {
      try {
        if (authUser) {
          const profile = await getUserProfile(authUser.uid);
          if (profile) {
            switch (profile.role) {
              case 'patient':
                router.push('/patient');
                break;
              case 'doctor':
                router.push('/doctor');
                break;
              case 'billing':
                router.push('/billing');
                break;
            }
          } else {
            router.push('/setup');
          }
          return;
        }
      } catch (err) {
        console.error('Auth listener error:', err);
        setError(err instanceof Error ? err.message : 'Unable to verify your account.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <nav className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🏥 Hospital Billing Transparency</h1>
          <p className="text-gray-600 text-sm">Making healthcare costs clear</p>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Welcome to Hospital Billing System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Sign in to access your personalized dashboard and manage medical billing with transparency.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h3>
            <p className="text-gray-600">Use your Google account to continue</p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors hover:bg-gray-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {error && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8 md:p-12 border-l-4 border-blue-600">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">✨ What You Can Do</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">👤</div>
              <h4 className="font-bold text-gray-900 mb-1">Patients</h4>
              <p className="text-gray-600 text-sm">View bills, track costs, get AI explanations</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">👨‍⚕️</div>
              <h4 className="font-bold text-gray-900 mb-1">Doctors</h4>
              <p className="text-gray-600 text-sm">Add procedures, update charges in real-time</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <h4 className="font-bold text-gray-900 mb-1">Billing Staff</h4>
              <p className="text-gray-600 text-sm">Generate summaries, export documents</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="mb-2">🏥 Hospital Billing Transparency System - Healthcare Hackathon</p>
          <p className="text-gray-400 text-sm">Making healthcare costs transparent and understandable for everyone</p>
        </div>
      </footer>
    </div>
  );
}
