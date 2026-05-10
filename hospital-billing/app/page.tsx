'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LOGIN_EMAIL = 'georgerocky809@gmail.com';
const LOGIN_PASSWORD = 'sanathdr';

const FAILURES = [
  {
    icon: '📊',
    problem: 'Estimates did not match final bills',
    detail: 'Patients were given verbal or informal estimates but received a completely different amount at discharge — often with no explanation.',
    fix: 'Doctor sets a written estimated cost when admitting the patient. The patient portal displays both the estimate and live charges side-by-side, with an alert when the estimate is exceeded.',
  },
  {
    icon: '🔤',
    problem: 'Medical terminology confused patients',
    detail: 'Bills listed procedure codes and clinical jargon that patients could not interpret without help from staff.',
    fix: 'Every charge has a "What is this?" button powered by AI that explains each item in plain, patient-friendly language.',
  },
  {
    icon: '⏱️',
    problem: 'No visibility into charges during treatment',
    detail: 'Patients only received a bill at the point of discharge — a large, unexpected total with no incremental awareness.',
    fix: 'Charges appear on the patient portal in real time the moment the doctor adds them, using Firebase live sync.',
  },
  {
    icon: '❓',
    problem: 'No reason given for individual charges',
    detail: 'Items would appear on bills without context, making it impossible to verify whether each charge was accurate.',
    fix: 'Doctors must enter a written reason before any charge can be submitted. Each item displays that reason, date, and category.',
  },
  {
    icon: '🔒',
    problem: 'No standardised pricing',
    detail: 'Costs varied without a fixed reference, leaving patients unable to know whether they were being charged fairly.',
    fix: 'All prices are drawn from a pre-approved hospital catalog stored in Firestore. Doctors select items — they cannot enter arbitrary figures.',
  },
];

export default function Home() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');

  const closeLogin = () => { setShowLogin(false); setEmail(''); setPassword(''); setLoginErr(''); };

  const handleLogin = () => {
    if (email === LOGIN_EMAIL && password === LOGIN_PASSWORD) {
      sessionStorage.setItem('doctor-authenticated', 'true');
      closeLogin();
      router.push('/doctor');
      return;
    }
    setLoginErr('Incorrect email or password. Please try again.');
  };

  return (
    <div className="min-h-screen" style={{ background: 'transparent', color: '#0F172A', fontFamily: 'var(--font-sans)' }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <header style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }} className="sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <button onClick={() => router.push('/')} className="flex items-center gap-3">
            <div style={{ background: '#2563EB' }} className="grid h-9 w-9 place-items-center rounded-lg text-white font-bold text-sm">
              KVS
            </div>
            <div className="text-left">
              <p style={{ color: '#0F172A' }} className="text-sm font-semibold leading-tight">KVS Hospital</p>
              <p style={{ color: '#64748B' }} className="text-xs">Mangalore</p>
            </div>
          </button>

          <nav className="flex items-center gap-3">
            <button
              onClick={() => router.push('/patient')}
              style={{ color: '#2563EB', borderColor: '#2563EB' }}
              className="hidden rounded-lg border bg-transparent px-4 py-2 text-sm font-medium transition hover:bg-blue-50 md:inline-flex"
            >
              Patient Portal
            </button>
            <button
              onClick={() => setShowLogin(true)}
              style={{ background: '#2563EB' }}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Doctor Login
            </button>
          </nav>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={{ background: 'transparent', borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 lg:grid-cols-[1fr_420px]">

          {/* Left copy */}
          <div>
            <span style={{ background: '#DBEAFE', color: '#1D4ED8' }} className="inline-block rounded-full px-3 py-1 text-xs font-semibold mb-4">
              Digital Billing Transparency · Case 30
            </span>
            <h1 style={{ color: '#0F172A' }} className="text-4xl font-bold leading-tight sm:text-5xl">
              Clear, real-time billing<br />for every patient.
            </h1>
            <p style={{ color: '#475569' }} className="mt-4 text-lg leading-relaxed max-w-lg">
              KVS Hospital's digital billing system gives patients complete visibility into their charges — with a plain-English AI explanation for every item.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/patient')}
                style={{ background: '#2563EB' }}
                className="rounded-lg px-6 py-3 font-semibold text-white transition hover:opacity-90"
              >
                View My Bill
              </button>
              <button
                onClick={() => setShowLogin(true)}
                style={{ color: '#2563EB', borderColor: '#2563EB' }}
                className="rounded-lg border bg-white px-6 py-3 font-semibold transition hover:bg-blue-50"
              >
                Doctor Dashboard
              </button>
            </div>

            {/* Trust signals */}
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { label: 'Live Charges', sublabel: 'Updated in real time' },
                { label: 'AI Explainer', sublabel: 'Plain-language billing' },
                { label: 'Fixed Pricing', sublabel: 'Pre-approved catalog' },
              ].map(({ label, sublabel }) => (
                <div key={label}>
                  <p style={{ color: '#2563EB' }} className="text-base font-bold">{label}</p>
                  <p style={{ color: '#64748B' }} className="text-xs mt-0.5">{sublabel}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: access card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }} className="rounded-2xl p-6 shadow-sm">
            <p style={{ color: '#64748B' }} className="text-xs font-semibold uppercase tracking-widest mb-1">Patient Access</p>
            <h2 style={{ color: '#0F172A' }} className="text-xl font-bold mb-5">Check your bill instantly</h2>

            <button
              onClick={() => router.push('/patient')}
              style={{ background: '#2563EB' }}
              className="flex w-full items-center justify-between rounded-xl px-5 py-4 text-white transition hover:opacity-90"
            >
              <div>
                <p className="font-bold">I&apos;m a Patient</p>
                <p style={{ color: '#BFDBFE' }} className="text-sm mt-0.5">View charges, estimates &amp; AI explanations</p>
              </div>
              <span className="text-xl font-bold">→</span>
            </button>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { icon: '⚡', text: 'Live charge updates' },
                { icon: '🤖', text: 'AI bill explainer' },
                { icon: '📊', text: 'Estimate vs actual' },
                { icon: '📋', text: 'Doctor\'s notes' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155' }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm">
                  <span>{icon}</span>
                  <span style={{ color: '#334155' }} className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAILURE ANALYSIS ────────────────────────────────── */}
      <section style={{ background: 'transparent', borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16">

          <div className="mb-10 text-center">
            <span style={{ background: '#FEF2F2', color: '#B91C1C' }} className="inline-block rounded-full px-3 py-1 text-xs font-semibold mb-3">
              Case 30 — Failure Analysis
            </span>
            <h2 style={{ color: '#0F172A' }} className="text-2xl font-bold sm:text-3xl">Why the old system failed</h2>
            <p style={{ color: '#64748B' }} className="mt-3 max-w-xl mx-auto text-base leading-relaxed">
              Here is every identified failure in the previous billing approach — and the direct, working solution built into KVS Hospital&apos;s system.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FAILURES.map(({ icon, problem, detail, fix }) => (
              <div key={problem} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
                className="rounded-xl p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{icon}</span>
                  <span style={{ color: '#DC2626' }} className="text-xs font-semibold uppercase tracking-wide">Problem</span>
                </div>
                <h3 style={{ color: '#0F172A' }} className="font-semibold mb-2">{problem}</h3>
                <p style={{ color: '#64748B' }} className="text-sm leading-relaxed">{detail}</p>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }} className="mt-4 rounded-lg p-3">
                  <p style={{ color: '#15803D' }} className="text-xs font-semibold mb-1">✓ KVS Hospital Fix</p>
                  <p style={{ color: '#374151' }} className="text-sm leading-relaxed">{fix}</p>
                </div>
              </div>
            ))}

            {/* Summary CTA */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }} className="rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span style={{ color: '#2563EB' }} className="text-xs font-semibold uppercase tracking-wide">Our Approach</span>
                <h3 style={{ color: '#0F172A' }} className="mt-2 text-lg font-bold leading-snug">
                  Every failure has a direct, working fix.
                </h3>
                <p style={{ color: '#475569' }} className="mt-2 text-sm leading-relaxed">
                  From live charge tracking to AI explanations and cost estimates — billing transparency is built into every layer.
                </p>
              </div>
              <button
                onClick={() => router.push('/patient')}
                style={{ background: '#2563EB' }}
                className="mt-6 w-full rounded-lg py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                See it live → Patient Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ background: 'transparent', borderTop: '1px solid rgba(226, 232, 240, 0.5)' }} className="py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div style={{ background: '#2563EB' }} className="grid h-7 w-7 place-items-center rounded text-white text-xs font-bold">K</div>
            <p style={{ color: '#0F172A' }} className="text-sm font-semibold">KVS Hospital, Mangalore</p>
          </div>
          <p style={{ color: '#94A3B8' }} className="text-sm">AI-assisted billing transparency · Case 30 Solution</p>
        </div>
      </footer>

      {/* ── DOCTOR LOGIN MODAL ──────────────────────────────── */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(15,23,42,0.4)' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }} className="w-full max-w-md rounded-2xl p-8 shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div style={{ background: '#2563EB' }} className="grid h-9 w-9 place-items-center rounded-lg text-white text-sm font-bold">KVS</div>
                <div>
                  <p style={{ color: '#2563EB' }} className="text-xs font-semibold uppercase tracking-wide">Secure Access</p>
                  <h2 style={{ color: '#0F172A' }} className="text-lg font-bold">Doctor Login</h2>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-medium">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="doctor@kvshospital.in"
                  style={{ border: '1px solid #CBD5E1', color: '#0F172A' }}
                  className="w-full rounded-lg bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  style={{ border: '1px solid #CBD5E1', color: '#0F172A' }}
                  className="w-full rounded-lg bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            {loginErr && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}
                className="mt-4 rounded-lg px-4 py-3 text-sm">
                {loginErr}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button onClick={closeLogin}
                style={{ border: '1px solid #CBD5E1', color: '#374151' }}
                className="flex-1 rounded-lg bg-white py-2.5 text-sm font-medium transition hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleLogin}
                style={{ background: '#2563EB' }}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                Log in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
