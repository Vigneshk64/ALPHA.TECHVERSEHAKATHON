'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LOGIN_EMAIL = 'georgerocky809@gmail.com';
const LOGIN_PASSWORD = 'sanathdr';

export default function Home() {
  const router = useRouter();
  const [showDoctorLogin, setShowDoctorLogin] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [doctorLoginError, setDoctorLoginError] = useState('');

  const closeDoctorLogin = () => {
    setShowDoctorLogin(false);
    setDoctorEmail('');
    setDoctorPassword('');
    setDoctorLoginError('');
  };

  const handleDoctorLogin = () => {
    if (doctorEmail === LOGIN_EMAIL && doctorPassword === LOGIN_PASSWORD) {
      sessionStorage.setItem('doctor-authenticated', 'true');
      closeDoctorLogin();
      router.push('/doctor');
      return;
    }

    setDoctorLoginError('Invalid credentials');
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-slate-950 bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage:
          'linear-gradient(115deg, rgba(3, 20, 31, 0.92) 0%, rgba(6, 31, 42, 0.72) 42%, rgba(3, 10, 18, 0.86) 100%), url(https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=90&w=3840&auto=format&fit=crop)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/65 to-transparent" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <nav className="border-b border-white/15 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <button
              onClick={() => router.push('/')}
              className="group flex items-center gap-3 rounded-full pr-4 transition hover:bg-white/10"
              aria-label="BillClear home"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full border border-cyan-300/40 bg-cyan-300/15 text-lg font-black text-cyan-100 transition group-hover:bg-cyan-300/25">
                B
              </span>
              <span className="text-left">
                <span className="block text-xl font-black tracking-wide">BillClear</span>
                <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/80">
                  Hospital Billing
                </span>
              </span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/patient')}
                className="hidden rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-200/60 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-200 md:inline-flex"
              >
                Patient Portal
              </button>
              <button
                onClick={() => setShowDoctorLogin(true)}
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              >
                Doctor Login
              </button>
            </div>
          </div>
        </nav>

        <main className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-cyan-200/30 bg-cyan-100/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.22em] text-cyan-100 backdrop-blur">
              Transparent care payments
            </p>
            <h1 className="text-5xl font-black leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              Hospital billing made clear before the final counter.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-100/90">
              Patients can check live charges, doctors can post approved procedures, and final statements stay traceable by patient ID.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {[
                ['Live', 'Charges'],
                ['AI', 'Explainers'],
                ['ID', 'Lookup'],
              ].map(([top, bottom]) => (
                <button
                  key={bottom}
                  className="group rounded-2xl border border-white/15 bg-white/10 p-5 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-200/50 hover:bg-white/15 hover:shadow-2xl hover:shadow-cyan-950/30 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                >
                  <span className="block text-3xl font-black text-cyan-200 transition group-hover:text-white">
                    {top}
                  </span>
                  <span className="mt-1 block text-sm font-bold uppercase tracking-[0.16em] text-slate-200">
                    {bottom}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/20 bg-white/12 p-7 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-100">Select Your Role</p>
                <h2 className="mt-2 text-3xl font-black text-white">Patient access</h2>
              </div>
              <span className="rounded-full border border-emerald-200/40 bg-emerald-200/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-100">
                Open
              </span>
            </div>

            <button
              onClick={() => router.push('/patient')}
              className="group w-full rounded-2xl border border-cyan-200/40 bg-cyan-300/15 p-6 text-left transition hover:-translate-y-1 hover:border-cyan-100 hover:bg-cyan-300/25 hover:shadow-2xl hover:shadow-cyan-950/40 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            >
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-2xl font-black text-white">I&apos;m a Patient</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-cyan-50/80">
                    Enter your patient ID and view your active billing summary.
                  </p>
                </div>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-2xl font-black text-slate-950 transition group-hover:translate-x-1">
                  &rarr;
                </span>
              </div>
            </button>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button className="rounded-2xl border border-white/15 bg-black/20 px-4 py-4 text-left text-sm font-bold text-white transition hover:border-cyan-200/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-100">
                Live charge timeline
              </button>
              <button className="rounded-2xl border border-white/15 bg-black/20 px-4 py-4 text-left text-sm font-bold text-white transition hover:border-cyan-200/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-100">
                Clear bill breakdown
              </button>
            </div>
          </aside>
        </main>

        <footer className="border-t border-white/15 bg-black/20 py-5 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 text-sm font-semibold text-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <p>BillClear Hospital System</p>
            <p className="text-slate-300/80">AI assisted billing transparency</p>
          </div>
        </footer>
      </div>

      {showDoctorLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white p-8 shadow-2xl">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-700">Secure access</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Doctor Login</h2>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={doctorEmail}
              onChange={(e) => setDoctorEmail(e.target.value)}
              className="mb-4 w-full rounded-2xl border border-slate-300 p-3 text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
            <input
              type="password"
              placeholder="Password"
              value={doctorPassword}
              onChange={(e) => setDoctorPassword(e.target.value)}
              className="mb-4 w-full rounded-2xl border border-slate-300 p-3 text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
            {doctorLoginError && (
              <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {doctorLoginError}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDoctorLogin}
                className="rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDoctorLogin}
                className="rounded-2xl bg-cyan-600 px-5 py-3 font-bold text-white transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
