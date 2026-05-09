'use client';

import { useState } from 'react';
import { useBillListener } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

export default function PatientPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState('');
  const [enteredPatientId, setEnteredPatientId] = useState('');
  const { procedures, total, loading: billLoading, error } = useBillListener(enteredPatientId);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [explanation, setExplanation] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const handlePatientIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      setEnteredPatientId(patientId.trim());
    }
  };

  const handleExplain = async (procedure: string) => {
    setModalOpen(true);
    setSelectedProcedure(procedure);
    setExplanation('');
    setModalError('');
    setModalLoading(true);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ procedure }),
      });

      const data = await response.json();
      setExplanation(data.explanation || 'No explanation returned.');
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Could not load explanation');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProcedure('');
    setExplanation('');
    setModalError('');
  };

  const handleSignOut = () => {
    router.replace('/');
  };

  if (!enteredPatientId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="bg-white border-b border-blue-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Portal</h1>
              <p className="text-gray-600 mt-2">Enter your patient ID to view your medical bill.</p>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-16">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <form onSubmit={handlePatientIdSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Patient ID</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your patient ID"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold transition hover:bg-blue-700"
              >
                View My Bill
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Medical Bill</h1>
            <p className="text-gray-600 mt-2">Your healthcare charges explained clearly.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-gray-700">Patient ID: <span className="font-semibold">{enteredPatientId}</span></p>
            <button
              onClick={() => setEnteredPatientId('')}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              Change Patient ID
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 mb-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Total Bill Amount</p>
          <p className="text-5xl font-bold mt-5">${total.toFixed(2)}</p>
          <p className="text-blue-100 mt-4">{procedures.length} procedure{procedures.length !== 1 ? 's' : ''}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {procedures.length === 0 ? (
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-12 text-center text-gray-700">
            <div className="text-4xl mb-4">📋</div>
            <p className="font-semibold">No procedures yet</p>
            <p className="mt-2">Your charges will appear instantly as your doctor adds them.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {procedures.map((item, index) => (
              <div key={`${item.name}-${item.timestamp}-${index}`} className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
                    <p className="mt-2 text-gray-600">{item.reason}</p>
                    <p className="mt-3 text-sm text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">${item.cost.toFixed(2)}</p>
                    <button
                      onClick={() => handleExplain(item.name)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-200"
                    >
                      💡 What is this?
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-blue-600">AI Explanation</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">{selectedProcedure}</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
              {modalLoading ? (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p>Loading explanation…</p>
                </div>
              ) : modalError ? (
                <p className="text-sm text-red-700">{modalError}</p>
              ) : (
                <p className="text-gray-800 leading-relaxed">{explanation}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
