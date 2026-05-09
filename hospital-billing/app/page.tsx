'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, onAuthStateChangedListener, getUserProfile, createUserProfile, signOutUser } from '@/lib/auth';
import type { UserRole } from '@/lib/types';
import type { User } from 'firebase/auth';

const roleOptions: UserRole[] = ['patient', 'doctor', 'billing'];

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [needsRole, setNeedsRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [error, setError] = useState('');
  const [savingRole, setSavingRole] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (firebaseUser) => {
      setLoading(true);
      setError('');

      if (!firebaseUser) {
        setUser(null);
        setNeedsRole(false);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      try {
        const profile = await getUserProfile(firebaseUser.uid);

        if (profile) {
          const destination =
            profile.role === 'doctor'
              ? '/doctor'
              : profile.role === 'patient'
              ? '/patient'
              : '/billing';
          router.replace(destination);
          return;
        }

        setNeedsRole(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  };

  const handleSaveRole = async () => {
    if (!user) {
      setError('No signed-in user found. Please sign in again.');
      return;
    }

    setSavingRole(true);
    setError('');

    try {
      await createUserProfile(
        user.uid,
        user.email ?? '',
        user.displayName ?? user.email?.split('@')[0] ?? 'Patient',
        selectedRole
      );

      const destination =
        selectedRole === 'doctor'
          ? '/doctor'
          : selectedRole === 'patient'
          ? '/patient'
          : '/billing';

      router.replace(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save role');
    } finally {
      setSavingRole(false);
    }
  };

  const handleSignOut = async () => {
    setError('');
    try {
      await signOutUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your login state...</p>
        </div>
      </div>
    );
  }

  if (needsRole && user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Select Your Role</h1>
            <p className="mt-2 text-gray-600">New user detected. Choose the role that describes your access.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {roleOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedRole(option)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  selectedRole === option
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-800 hover:border-blue-300'
                }`}
              >
                <p className="font-semibold capitalize">{option}</p>
                <p className="text-sm text-gray-500">
                  {option === 'patient'
                    ? 'See your own bill and request explanations.'
                    : option === 'doctor'
                    ? 'Add procedures and update patient bills.'
                    : 'Access final invoices and billing records.'}
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={handleSaveRole}
            disabled={savingRole}
            className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {savingRole ? 'Saving role...' : 'Continue'}
          </button>

          <button
            onClick={handleSignOut}
            type="button"
            className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-5 py-3 text-gray-700 transition hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <nav className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🏥 Hospital Billing Transparency</h1>
          <button
            onClick={handleSignIn}
            className="rounded-full bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Login to manage hospital billing securely</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sign in with Google, then access the patient, doctor, or billing experience based on your assigned role.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient</h3>
            <p className="text-gray-600">See your bill in real time and ask AI for plain-language procedure explanations.</p>
          </div>
          <div className="rounded-3xl border border-green-100 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Doctor</h3>
            <p className="text-gray-600">Add procedures and costs to patient records quickly with Firebase-backed persistence.</p>
          </div>
          <div className="rounded-3xl border border-purple-100 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Billing</h3>
            <p className="text-gray-600">Review final invoices and export itemized bills for patients.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
