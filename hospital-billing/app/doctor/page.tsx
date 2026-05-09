'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
  const [patientId, setPatientId] = useState('patient-demo-001');
  const [procedure, setProcedure] = useState('');
  const [customProcedure, setCustomProcedure] = useState('');
  const [cost, setCost] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!patientId || !cost || !reason) {
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

    setLoading(true);

    try {
      await addDoc(collection(db, 'bills'), {
        patientId,
        procedure: finalProcedure,
        cost: finalCost,
        reason,
        timestamp: Date.now(),
        status: 'completed',
      });

      setSuccess(true);
      setProcedure('');
      setCustomProcedure('');
      setCost('');
      setReason('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add charge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Charges</h1>
          <p className="text-gray-600 mt-2">Record procedures and treatments for patient billing</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Patient ID */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Patient ID
            </label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter patient ID"
            />
          </div>

          {/* Common Procedures */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Procedure
            </label>
            <div className="grid grid-cols-2 gap-3">
              {COMMON_PROCEDURES.map((proc) => (
                <button
                  key={proc.name}
                  type="button"
                  onClick={() => setProcedure(proc.name)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    procedure === proc.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{proc.name}</p>
                  <p className="text-xs text-gray-600">{proc.category}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Procedure */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Or Enter Custom Procedure
            </label>
            <input
              type="text"
              value={customProcedure}
              onChange={(e) => {
                setCustomProcedure(e.target.value);
                setProcedure('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter custom procedure name"
            />
          </div>

          {/* Cost */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cost ($) *
            </label>
            <input
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Reason/Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason/Notes *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain why this charge is being added..."
              rows={4}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-semibold">✓ Charge added successfully! Patient will be notified.</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Adding Charge...' : 'Add Charge to Bill'}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-blue-900">💡 How it works:</span> When you add a charge, it will instantly appear
            on the patient's bill. They will receive a notification and can see a plain-language explanation of the procedure.
          </p>
        </div>
      </div>
    </div>
  );
}
