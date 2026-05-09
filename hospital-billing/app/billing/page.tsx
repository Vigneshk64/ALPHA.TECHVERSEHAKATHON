'use client';

import { useState } from 'react';
import { BillItem } from '@/lib/types';
import { useBillListener } from '@/lib/hooks';

export default function BillingSummaryPage() {
  const [patientId] = useState('patient-demo-001');
  const { items, total, loading, error } = useBillListener(patientId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create CSV content
    const headers = ['Procedure', 'Cost', 'Reason', 'Date'];
    const rows = items.map((item) => [
      item.procedure,
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
    a.download = `bill-${patientId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
    <div className="min-h-screen bg-white print:bg-white">
      {/* Header - Hidden in Print */}
      <div className="print:hidden bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing Summary</h1>
              <p className="text-gray-600 mt-1">Final itemized bill with no hidden fees</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              >
                <span>🖨️</span>
                Print
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <span>⬇️</span>
                Download CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hospital Info */}
        <div className="mb-12 text-center print:mb-8">
          <h2 className="text-2xl font-bold text-gray-900">HEALTHCARE HOSPITAL</h2>
          <p className="text-gray-600 mt-2">123 Medical Avenue, Healthcare City, HC 12345</p>
          <p className="text-gray-600">Phone: (555) 123-4567 | Email: billing@healthcare.com</p>
        </div>

        {/* Bill Header */}
        <div className="grid grid-cols-2 gap-8 mb-12 print:mb-8">
          <div>
            <p className="text-gray-600 text-sm font-semibold">BILL TO:</p>
            <p className="text-gray-900 font-semibold mt-1">Patient ID: {patientId}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm font-semibold">BILL DATE:</p>
            <p className="text-gray-900 font-semibold mt-1">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Charges Table */}
        <div className="mb-8 print:mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 print:mb-3">ITEMIZED CHARGES</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="text-left py-3 px-4 font-bold text-gray-900">Procedure</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">Reason/Description</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-900 w-24">Date</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-900 w-24">Cost</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No charges on file
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 print:hover:bg-white">
                      <td className="py-3 px-4 text-gray-900 font-semibold">{item.procedure}</td>
                      <td className="py-3 px-4 text-gray-700">{item.reason}</td>
                      <td className="py-3 px-4 text-gray-600 text-center text-sm">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-900 text-right font-semibold">
                        ${item.cost.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Hidden Fees Section */}
        <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8 print:mb-6">
          <h4 className="font-bold text-green-900 mb-2">✓ TRANSPARENCY GUARANTEE</h4>
          <p className="text-green-800 text-sm">
            This bill contains ALL charges related to your care. There are no hidden fees, surprise charges, or pending items not
            listed above. Every item has been clearly explained. If you have questions about any charge, please contact our billing
            department.
          </p>
        </div>

        {/* Total Section */}
        <div className="flex justify-end mb-12 print:mb-8">
          <div className="w-80">
            <div className="flex justify-between py-3 px-4 border-b-2 border-gray-900">
              <span className="font-bold text-gray-900">TOTAL AMOUNT DUE:</span>
              <span className="font-bold text-2xl text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="grid grid-cols-2 gap-8 py-8 border-t border-gray-200 print:border-t-2 print:border-gray-900">
          <div>
            <p className="font-bold text-gray-900 mb-2">PAYMENT METHODS:</p>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Credit/Debit Card (online)</li>
              <li>• Bank Transfer</li>
              <li>• Payment Plan Available</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">NEED HELP?</p>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Call: (555) 123-4567</li>
              <li>• Email: billing@healthcare.com</li>
              <li>• Portal: patient.healthcare.com</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-300 text-center text-gray-600 text-xs print:mt-8 print:pt-6">
          <p>This is an official billing statement. Keep for your records.</p>
          <p className="mt-1">Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
