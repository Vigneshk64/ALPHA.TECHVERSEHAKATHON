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
        }
      }
    }
  }, [loading, needsProfileSetup, router, user]);

  if (loading || !user || !needsProfileSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_30%),linear-gradient(180deg,#eff6ff,#ffffff)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="font-semibold text-gray-600">Loading...</p>
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save role');
      setSelectedRole(null);
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),linear-gradient(180deg,#eff6ff,#ffffff)] px-5 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">Account setup</p>
          <h1 className="mt-3 text-4xl font-black text-gray-950">Welcome, {user.name || 'there'}!</h1>
          <p className="mt-3 text-gray-600">Select your role to get the right BillClear workspace.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <button
            onClick={() => handleSelectRole('patient')}
            disabled={saving}
            className={`rounded-[2rem] border-2 p-7 text-left shadow-xl shadow-blue-950/5 transition-all hover:-translate-y-1 ${
              selectedRole === 'patient'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            } ${saving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-xl font-black text-blue-700">P</div>
            <h3 className="mb-2 text-xl font-black text-gray-900">Patient</h3>
            <p className="mb-4 text-sm leading-6 text-gray-600">
              View medical bills in real time and understand charges with AI explanations.
            </p>
            <div className="text-xs font-semibold text-blue-600">
              {selectedRole === 'patient' && saving ? 'Setting up...' : 'Click to select'}
            </div>
          </button>

          <button
            onClick={() => handleSelectRole('doctor')}
            disabled={saving}
            className={`rounded-[2rem] border-2 p-7 text-left shadow-xl shadow-blue-950/5 transition-all hover:-translate-y-1 ${
              selectedRole === 'doctor'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-green-300'
            } ${saving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-green-100 text-xl font-black text-green-700">D</div>
            <h3 className="mb-2 text-xl font-black text-gray-900">Doctor</h3>
            <p className="mb-4 text-sm leading-6 text-gray-600">
              Verify patients, create new patient records, and add catalog charges.
            </p>
            <div className="text-xs font-semibold text-green-600">
              {selectedRole === 'doctor' && saving ? 'Setting up...' : 'Click to select'}
            </div>
          </button>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-blue-900">Tip:</span> Your role is stored in Firestore so you can access the right dashboard every time.
          </p>
        </div>
      </div>
    </div>
  );
}
