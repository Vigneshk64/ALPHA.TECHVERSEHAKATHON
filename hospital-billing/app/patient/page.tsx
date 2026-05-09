'use client';

import { useState } from 'react';
import { useBillListener } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

export default function PatientPage() {
  const router = useRouter();
  const [patientId, setPatientId]             = useState('');
  const [enteredId, setEnteredId]             = useState('');
  const { procedures, total, estimatedCost, error } = useBillListener(enteredId);
  const [modalOpen, setModalOpen]             = useState(false);
  const [selProc, setSelProc]                 = useState('');
  const [explanation, setExplanation]         = useState('');
  const [rateLimited, setRateLimited]         = useState(false);
  const [aiLoading, setAiLoading]             = useState(false);
  const [aiErr, setAiErr]                     = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) setEnteredId(patientId.trim());
  };

  const explain = async (proc: string) => {
    setModalOpen(true); setSelProc(proc); setExplanation('');
    setAiErr(''); setRateLimited(false); setAiLoading(true);
    try {
      const res  = await fetch('/api/explain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ procedure: proc }) });
      const data = await res.json();
      setExplanation(data.explanation || 'No explanation returned.');
      if (data.error) setRateLimited(true);
    } catch (err) {
      setAiErr(err instanceof Error ? err.message : 'Could not load explanation');
    } finally {
      setAiLoading(false);
    }
  };

  const closeModal = () => { setModalOpen(false); setSelProc(''); setExplanation(''); setAiErr(''); setRateLimited(false); };

  const typePill: Record<string, { bg: string; color: string }> = {
    procedure:    { bg: '#DBEAFE', color: '#1D4ED8' },
    medicine:     { bg: '#D1FAE5', color: '#065F46' },
    room:         { bg: '#EDE9FE', color: '#5B21B6' },
    transport:    { bg: '#FEF3C7', color: '#92400E' },
    consultation: { bg: '#CCFBF1', color: '#0F766E' },
  };

  /* ─── ID Entry ──────────────────────────────────────────── */
  if (!enteredId) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A' }}>

        {/* nav */}
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <button onClick={() => router.push('/')} className="flex items-center gap-3">
              <div style={{ background: '#2563EB' }} className="grid h-9 w-9 place-items-center rounded-lg text-white font-bold text-sm">KVS</div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>KVS Hospital</p>
                <p className="text-xs" style={{ color: '#64748B' }}>Patient Portal</p>
              </div>
            </button>
            <button onClick={() => router.push('/')}
              style={{ border: '1px solid #CBD5E1', color: '#374151' }}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50">
              ← Home
            </button>
          </div>
        </header>

        <div className="mx-auto grid max-w-5xl items-start gap-10 px-6 py-12 lg:grid-cols-[1fr_380px]">

          {/* Left info */}
          <div>
            <span style={{ background: '#DBEAFE', color: '#1D4ED8' }} className="inline-block rounded-full px-3 py-1 text-xs font-semibold mb-4">
              Live Billing
            </span>
            <h1 style={{ color: '#0F172A' }} className="text-3xl font-bold leading-tight">
              Know every charge<br />while care is happening.
            </h1>
            <p style={{ color: '#475569' }} className="mt-4 text-base leading-relaxed">
              View your procedures, medicines, and consultation charges — all from your patient ID. An AI explains every item in plain language.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: '⚡', text: 'Charges update the moment your doctor adds them' },
                { icon: '🤖', text: 'AI explains every charge in plain language' },
                { icon: '📊', text: "See your doctor's estimate vs current total" },
                { icon: '📋', text: 'Doctor must record a reason for every charge' },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                  <span className="mt-0.5 text-base">{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Form card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }} className="rounded-2xl p-7 shadow-sm">
            <h2 style={{ color: '#0F172A' }} className="text-lg font-bold mb-1">Enter your Patient ID</h2>
            <p style={{ color: '#64748B' }} className="text-sm mb-6">Your ID is provided at the time of admission.</p>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-medium">Patient ID</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                  placeholder="e.g. P001"
                  required
                  style={{ border: '1px solid #CBD5E1', color: '#0F172A' }}
                  className="w-full rounded-lg bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button type="submit"
                style={{ background: '#2563EB' }}
                className="w-full rounded-lg py-3 text-sm font-semibold text-white transition hover:opacity-90">
                View My Bill →
              </button>
            </form>
            <p style={{ color: '#94A3B8' }} className="mt-5 text-center text-xs">
              Your billing data is only visible to you and your care team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Bill View ─────────────────────────────────────────── */
  const overEstimate   = estimatedCost !== null && total > estimatedCost;
  const withinEstimate = estimatedCost !== null && total <= estimatedCost && total > 0;
  const diff           = estimatedCost !== null ? total - estimatedCost : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A' }}>

      {/* nav */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 30 }}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div>
            <p style={{ color: '#2563EB' }} className="text-xs font-semibold uppercase tracking-wide">KVS Hospital · Patient Portal</p>
            <h1 style={{ color: '#0F172A' }} className="text-xl font-bold leading-tight">My Medical Bill</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <span style={{ background: '#F1F5F9', color: '#0F172A', border: '1px solid #E2E8F0' }}
              className="rounded-lg px-3 py-1.5 text-sm">
              ID: <strong>{enteredId}</strong>
            </span>
            <button onClick={() => setEnteredId('')}
              style={{ border: '1px solid #CBD5E1', color: '#374151' }}
              className="rounded-lg bg-white px-3 py-1.5 text-sm transition hover:bg-gray-50">
              Change ID
            </button>
            <button onClick={() => router.replace('/')}
              style={{ border: '1px solid #CBD5E1', color: '#374151' }}
              className="rounded-lg bg-white px-3 py-1.5 text-sm transition hover:bg-gray-50">
              ← Home
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* Total banner */}
        <div style={{ background: '#2563EB' }} className="rounded-2xl p-7 mb-5 shadow-sm">
          <p style={{ color: '#BFDBFE' }} className="text-xs font-semibold uppercase tracking-widest">Current Charges</p>
          <p className="mt-2 text-5xl font-bold text-white">${total.toFixed(2)}</p>
          <p style={{ color: '#BFDBFE' }} className="mt-1 text-sm">
            {procedures.length} charge{procedures.length !== 1 ? 's' : ''} from hospital catalog
          </p>

          {estimatedCost !== null && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:max-w-sm">
              <div style={{ background: 'rgba(255,255,255,0.15)' }} className="rounded-xl px-4 py-3">
                <p style={{ color: '#BFDBFE' }} className="text-xs font-semibold">Doctor&apos;s Estimate</p>
                <p className="mt-1 text-2xl font-bold text-white">${estimatedCost.toFixed(2)}</p>
              </div>
              <div style={{ background: overEstimate ? 'rgba(251,191,36,0.25)' : 'rgba(52,211,153,0.25)' }}
                className="rounded-xl px-4 py-3">
                <p style={{ color: '#BFDBFE' }} className="text-xs font-semibold">Difference</p>
                <p style={{ color: overEstimate ? '#FDE68A' : '#6EE7B7' }} className="mt-1 text-2xl font-bold">
                  {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Alerts */}
        {overEstimate && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }} className="mb-5 flex items-start gap-3 rounded-xl p-4">
            <span style={{ color: '#D97706' }} className="text-lg mt-0.5">⚠</span>
            <div>
              <p style={{ color: '#92400E' }} className="font-semibold text-sm">Charges exceed the initial estimate</p>
              <p style={{ color: '#78350F' }} className="text-sm mt-1 leading-relaxed">
                Your doctor estimated <strong>${estimatedCost!.toFixed(2)}</strong> but current charges are <strong>${total.toFixed(2)}</strong> — a difference of <strong>${Math.abs(diff).toFixed(2)}</strong>. Please speak to the billing desk if you have questions.
              </p>
            </div>
          </div>
        )}

        {withinEstimate && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }} className="mb-5 flex items-start gap-3 rounded-xl p-4">
            <span style={{ color: '#059669' }} className="text-lg mt-0.5">✓</span>
            <div>
              <p style={{ color: '#065F46' }} className="font-semibold text-sm">Within the estimated cost</p>
              <p style={{ color: '#047857' }} className="text-sm mt-1">
                Current charges of <strong>${total.toFixed(2)}</strong> are within your doctor&apos;s estimate of <strong>${estimatedCost!.toFixed(2)}</strong>.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}
            className="mb-5 rounded-xl p-4 text-sm">{error}</div>
        )}

        {/* Charges */}
        {procedures.length === 0 ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }} className="rounded-xl p-14 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p style={{ color: '#0F172A' }} className="font-semibold">No charges yet</p>
            <p style={{ color: '#64748B' }} className="text-sm mt-1">Charges will appear here the moment your doctor adds them.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {procedures.map((item, i) => {
              const pill = typePill[item.type ?? ''] ?? { bg: '#F1F5F9', color: '#475569' };
              return (
                <div key={`${item.name}-${item.timestamp}-${i}`}
                  style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
                  className="rounded-xl p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 style={{ color: '#0F172A' }} className="font-semibold">{item.name}</h2>
                        {item.type && (
                          <span style={{ background: pill.bg, color: pill.color }}
                            className="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize">
                            {item.type}
                          </span>
                        )}
                        {item.category && (
                          <span style={{ background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}
                            className="rounded-full px-2.5 py-0.5 text-xs">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#64748B' }} className="mt-1.5 text-sm leading-relaxed">{item.reason}</p>
                      <p style={{ color: '#94A3B8' }} className="mt-1 text-xs">
                        {new Date(item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                      <p style={{ color: '#0F172A' }} className="text-xl font-bold">${item.cost.toFixed(2)}</p>
                      <button onClick={() => explain(item.name)}
                        style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition hover:bg-blue-100">
                        💡 What is this?
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4" style={{ background: 'rgba(15,23,42,0.4)' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }} className="w-full max-w-lg rounded-2xl p-7 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p style={{ color: '#2563EB' }} className="text-xs font-semibold uppercase tracking-wide">AI Explanation</p>
                <h2 style={{ color: '#0F172A' }} className="mt-1 text-lg font-bold">{selProc}</h2>
              </div>
              <button onClick={closeModal}
                style={{ border: '1px solid #E2E8F0', color: '#64748B' }}
                className="rounded-lg bg-white px-3 py-1.5 text-sm transition hover:bg-gray-50">
                Close
              </button>
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }} className="rounded-xl p-5">
              {aiLoading ? (
                <div className="flex items-center gap-3" style={{ color: '#64748B' }}>
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2" style={{ borderColor: '#2563EB' }} />
                  <p className="text-sm">Loading AI explanation…</p>
                </div>
              ) : aiErr ? (
                <p className="text-sm" style={{ color: '#B91C1C' }}>{aiErr}</p>
              ) : (
                <div>
                  {rateLimited && (
                    <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}
                      className="mb-3 rounded-lg px-3 py-2 text-xs">
                      ⚠ AI is currently busy — showing a standard description instead.
                    </div>
                  )}
                  <p style={{ color: '#334155' }} className="text-sm leading-7">{explanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
