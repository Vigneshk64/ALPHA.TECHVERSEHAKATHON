'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { useProtectedPage } from '@/lib/hooks';
import { signOutUser } from '@/lib/auth';

const COMMON_PROCEDURES = [
  { name: 'X-Ray', category: 'Imaging' },
  { name: 'Blood Test', category: 'Lab' },
  { name: 'MRI Scan', category: 'Imaging' },
  { name: 'CT Scan', category: 'Imaging' },
  { name: 'Ultrasound', category: 'Imaging' },
  { name: 'ECG', category: 'Diagnostic' },
  { name: 'Physical Therapy', category: 'Treatment' },
  { name: 'Consultation', category: 'Service' },
  { name: 'Surgery', category: 'Procedure' },
  { name: 'Medication', category: 'Pharmacy' },
];

export default function DoctorPage() {
  const router = useRouter();
  const { userProfile, loading } = useProtectedPage('doctor');
  const [patientId, setPatientId] = useState('');
  const [procedure, setProcedure] = useState('');
  const [customProcedure, setCustomProcedure] = useState('');
  const [cost, setCost] = useState('');
  const [reason, setReason] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!patientId.trim() || !cost || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    if (!procedure && !customProcedure) {
      setError('Please select or enter a procedure');
      return;
    }

    const finalProcedure = customProcedure || procedure;
    const finalCost = parseFloat(cost);

    if (isNaN(finalCost) || finalCost <= 0) {
      setError('Cost must be a positive number');
      return;
    }

    setLoadingSubmit(true);

    try {
      const billRef = doc(db!, 'bills', patientId.trim());
      const billSnapshot = await getDoc(billRef);
      const procedureItem = {
        name: finalProcedure,
        cost: finalCost,
        reason,
        timestamp: Date.now(),
      };

      if (billSnapshot.exists()) {
        await updateDoc(billRef, {
          procedures: arrayUnion(procedureItem),
          totalAmount: increment(finalCost),
        });
      } else {
        await setDoc(billRef, {
          patientId: patientId.trim(),
          procedures: [procedureItem],
          totalAmount: finalCost,
        });
      }

      setSuccess(true);
      setPatientId(patientId.trim());
      setProcedure('');
      setCustomProcedure('');
      setCost('');
      setReason('');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add charge');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    router.replace('/');
  };

  if (loading || !userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600 mt-2">Add a procedure to a patient's bill.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-gray-700">Signed in as <span className="font-semibold">{userProfile.name}</span></p>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Patient ID</label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter patient ID"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Procedure</label>
            <div className="grid grid-cols-2 gap-3">
              {COMMON_PROCEDURES.map((proc) => (
                <button
                  key={proc.name}
                  type="button"
                  onClick={() => setProcedure(proc.name)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    procedure === proc.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{proc.name}</p>
                  <p className="text-sm text-gray-500">{proc.category}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Or Enter Custom Procedure</label>
            <input
              type="text"
              value={customProcedure}
              onChange={(e) => {
                setCustomProcedure(e.target.value);
                setProcedure('');
              }}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter custom procedure name"
            />
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cost ($) *</label>
              <input
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reason / Notes *</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Explain why this charge is being added..."
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              Procedure successfully added to the bill.
            </div>
          )}

          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loadingSubmit ? 'Saving procedure...' : 'Add Procedure to Bill'}
          </button>
        </form>
      </div>
    </div>
  );
}
