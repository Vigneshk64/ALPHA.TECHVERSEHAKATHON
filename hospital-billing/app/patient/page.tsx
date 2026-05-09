'use client';

import { useState } from 'react';
import { BillItem } from '@/lib/types';
import { useBillListener } from '@/lib/hooks';

interface BillItemWithExplanation extends BillItem {
  explanation?: string;
  loadingExplanation?: boolean;
}

export default function PatientPage() {
  const [patientId] = useState('patient-demo-001');
  const { items, total, loading, error } = useBillListener(patientId);
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: BillItemWithExplanation;
  }>({});
  const [lastNewItem, setLastNewItem] = useState<string | null>(null);

  const getExplanation = async (itemId: string, procedure: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        loadingExplanation: true,
      },
    }));

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ procedure }),
      });

      const data = await response.json();
      setExpandedItems((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          explanation: data.explanation,
          loadingExplanation: false,
        },
      }));
    } catch (err) {
      setExpandedItems((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          explanation: 'Could not load explanation',
          loadingExplanation: false,
        },
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bill...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">My Medical Bill</h1>
          <p className="text-gray-600 mt-2">Your healthcare charges explained clearly</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Running Total Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 mb-8 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Total Bill Amount</p>
          <p className="text-5xl font-bold mt-2">${total.toFixed(2)}</p>
          <p className="text-blue-100 mt-4">{items.length} charge{items.length !== 1 ? 's' : ''}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-blue-50 border-2 border-blue-200 border-dashed rounded-lg p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-700 font-semibold">No charges yet</p>
            <p className="text-gray-600 mt-2">Your charges will appear here as they are added</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`border-l-4 border-blue-500 bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow ${
                  lastNewItem === item.id ? 'ring-2 ring-green-400 animate-pulse' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.procedure}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.reason}</p>
                    {item.status === 'pending' && (
                      <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-blue-600">${item.cost.toFixed(2)}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* AI Explanation Button */}
                <button
                  onClick={() =>
                    expandedItems[item.id]?.explanation
                      ? setExpandedItems((prev) => {
                          const next = { ...prev };
                          delete next[item.id];
                          return next;
                        })
                      : getExplanation(item.id, item.procedure)
                  }
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded transition-colors"
                >
                  <span>💡</span>
                  {expandedItems[item.id]?.loadingExplanation
                    ? 'Loading...'
                    : expandedItems[item.id]?.explanation
                      ? 'Hide explanation'
                      : 'What is this?'}
                </button>

                {/* AI Explanation */}
                {expandedItems[item.id]?.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-800 leading-relaxed">{expandedItems[item.id].explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Demo Info */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Demo Mode:</span> Viewing charges for patient ID: <code className="bg-gray-200 px-2 py-1 rounded text-xs">{patientId}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
