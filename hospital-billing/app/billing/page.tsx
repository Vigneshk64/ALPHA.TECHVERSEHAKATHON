'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBillListener } from '@/lib/hooks';

export default function BillingSummaryPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState('');
  const [activePatientId, setActivePatientId] = useState('');
  const [error, setError] = useState('');
  const { procedures, total, loading: billLoading, error: billError } = useBillListener(activePatientId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const headers = ['Charge', 'Type', 'Category', 'Cost', 'Reason', 'Date'];
    const rows = procedures.map((item) => [
      item.name,
      item.type || '',
      item.category || '',
      `$${item.cost.toFixed(2)}`,
      item.reason,
      new Date(item.timestamp).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      '',
      `Total,$${total.toFixed(2)}`,
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-${activePatientId || 'patient'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleLoadBill = () => {
    if (!patientId.trim()) {
      setError('Please enter a patient ID to load the bill');
      return;
    }
    setError('');
    setActivePatientId(patientId.trim());
  };

  const handleSignOut = () => {
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <div className="bg-white/90 border-b border-gray-200 shadow-sm backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing Summary</h1>
            <p className="text-gray-600 mt-2">Search a patient bill and export a final statement.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
        <div className="mb-10 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-blue-700">Patient Bill Lookup</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-3">Enter a Patient ID</h2>
              <p className="mt-2 text-gray-600">Load the billing record for a specific patient and export the final invoice.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-80"
                placeholder="Patient ID"
              />
              <button
                onClick={handleLoadBill}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold transition hover:bg-blue-700"
              >
                Load Bill
              </button>
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        </div>

        <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-700">Patient ID</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{activePatientId || 'Not selected'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePrint}
              disabled={!activePatientId}
              className="rounded-2xl bg-gray-700 px-5 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDownload}
              disabled={!activePatientId}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              ⬇️ Download CSV
            </button>
          </div>
        </div>

        {billLoading ? (
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-12 text-center text-gray-700">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p>Loading bill...</p>
          </div>
        ) : !activePatientId ? (
          <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50 p-12 text-center text-gray-700">
            <p className="text-lg font-semibold">No bill loaded yet</p>
            <p className="mt-2">Enter a patient ID above to view their final billing statement.</p>
          </div>
        ) : procedures.length === 0 ? (
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-12 text-center text-gray-700">
            <p className="text-lg font-semibold">No procedures found</p>
            <p className="mt-2">This patient does not have any billing records yet.</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-blue-950/5">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-gray-900">HEALTHCARE HOSPITAL</h2>
              <p className="mt-2 text-gray-600">123 Medical Avenue, Healthcare City, HC 12345</p>
              <p className="mt-1 text-gray-600">Phone: (555) 123-4567 | Email: billing@healthcare.com</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 mb-12">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-gray-600">Bill To</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">Patient ID: {activePatientId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm uppercase tracking-[0.25em] text-gray-600">Bill Date</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-sm font-semibold text-gray-900">Charge</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-900">Type</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-900">Category</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-900">Reason</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {procedures.map((item, index) => (
                    <tr key={`${item.name}-${item.timestamp}-${index}`} className="border-b border-gray-100">
                      <td className="py-4 px-4 text-gray-900">{item.name}</td>
                      <td className="py-4 px-4 text-gray-600 capitalize">{item.type || 'Charge'}</td>
                      <td className="py-4 px-4 text-gray-600">{item.category || '-'}</td>
                      <td className="py-4 px-4 text-gray-600">{item.reason}</td>
                      <td className="py-4 px-4 text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">${item.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10 flex justify-end">
              <div className="w-full max-w-xs rounded-3xl border border-gray-200 bg-blue-50 p-6">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>Total Amount Due</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {billError && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {billError}
          </div>
        )}
      </div>
    </div>
  );
}

