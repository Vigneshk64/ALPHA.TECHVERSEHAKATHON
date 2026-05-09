'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createUserProfile } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { user, loading, needsProfileSetup } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/');
      } else if (!needsProfileSetup) {
        if (user.role === 'doctor') {
          router.replace('/doctor');
        } else if (user.role === 'patient') {
          router.replace('/patient');
        } else if (user.role === 'billing') {
          router.replace('/billing');
        }
      }
    }
  }, [loading, needsProfileSetup, router, user]);

  if (loading || !user || !needsProfileSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSelectRole = async (role: UserRole) => {
    try {
      setSaving(true);
      setError(null);
      setSelectedRole(role);

      await createUserProfile(user.uid, user.email, user.name, role);

      if (role === 'doctor') {
        router.push('/doctor');
      } else if (role === 'patient') {
        router.push('/patient');
      } else if (role === 'billing') {
        router.push('/billing');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save role');
      setSelectedRole(null);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome, {user.name || 'there'}! 👋</h1>
          <p className="text-gray-600">Select your role to get started</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => handleSelectRole('patient')}
            disabled={saving}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              selectedRole === 'patient'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 bg-white'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-4xl mb-3">👤</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Patient</h3>
            <p className="text-sm text-gray-600 mb-4">
              View your medical bills in real-time, understand charges with AI explanations.
            </p>
            <div className="text-xs text-blue-600 font-semibold">
              {selectedRole === 'patient' && saving ? 'Setting up...' : 'Click to select'}
            </div>
          </button>

          <button
            onClick={() => handleSelectRole('doctor')}
            disabled={saving}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              selectedRole === 'doctor'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 bg-white'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-4xl mb-3">👨‍⚕️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Doctor</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add procedures and charges for patients. Track billing in real-time.
            </p>
            <div className="text-xs text-green-600 font-semibold">
              {selectedRole === 'doctor' && saving ? 'Setting up...' : 'Click to select'}
            </div>
          </button>

          <button
            onClick={() => handleSelectRole('billing')}
            disabled={saving}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              selectedRole === 'billing'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300 bg-white'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Billing Staff</h3>
            <p className="text-sm text-gray-600 mb-4">
              Generate final bills, manage invoices, and export patient billing statements.
            </p>
            <div className="text-xs text-purple-600 font-semibold">
              {selectedRole === 'billing' && saving ? 'Setting up...' : 'Click to select'}
            </div>
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-blue-900">💡 Tip:</span> Your role is stored in Firestore so you can access the right dashboard every time.
          </p>
        </div>
      </div>
    </div>
  );
}
