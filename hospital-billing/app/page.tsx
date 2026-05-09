'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleRoleSelect = (role: 'patient' | 'doctor' | 'billing') => {
    switch (role) {
      case 'patient':
        router.push('/patient');
        break;
      case 'doctor':
        router.push('/doctor');
        break;
      case 'billing':
        router.push('/billing');
        break;
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1920&auto=format&fit=crop)',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/65 z-10"></div>

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Navigation Bar */}
        <nav className="backdrop-blur-md bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">
              🏥 BillClear Hospital
            </h1>
            <div className="hidden md:flex gap-8 items-center">
              <a href="#" className="text-white hover:text-cyan-400 transition font-semibold">Home</a>
              <a href="#" className="text-white hover:text-cyan-400 transition font-semibold">Services</a>
              <a href="#" className="text-white hover:text-cyan-400 transition font-semibold">Contact</a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-6 py-16 w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Side - Content */}
              <div className="text-white">
                <h2 className="text-5xl sm:text-6xl font-bold mb-4 leading-tight">
                  Welcome to BillClear Hospital Billing
                </h2>
                <p className="text-xl text-cyan-200 mb-12 font-semibold">
                  Transparent, AI-powered billing system
                </p>

                {/* Info Cards */}
                <div className="space-y-4">
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">⚡</div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Real-Time Bills</h3>
                        <p className="text-gray-200">See charges as they're added</p>
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🤖</div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">AI Explanations</h3>
                        <p className="text-gray-200">Understand every charge</p>
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">✓</div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">No Hidden Costs</h3>
                        <p className="text-gray-200">Full transparency guaranteed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Role Selection Box */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/30 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-3xl font-bold text-white mb-8 text-center">
                  Select Your Role
                </h3>

                <div className="space-y-4">
                  <button
                    onClick={() => handleRoleSelect('patient')}
                    className="w-full backdrop-blur-md bg-gradient-to-r from-cyan-500/30 to-cyan-400/20 border border-cyan-400/50 text-white rounded-xl py-4 px-6 font-bold text-lg hover:from-cyan-500/50 hover:to-cyan-400/30 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-400/20 transition transform hover:scale-105"
                  >
                    <span className="text-2xl mr-3">👤</span>
                    I'm a Patient
                  </button>

                  <button
                    onClick={() => handleRoleSelect('doctor')}
                    className="w-full backdrop-blur-md bg-gradient-to-r from-cyan-500/30 to-cyan-400/20 border border-cyan-400/50 text-white rounded-xl py-4 px-6 font-bold text-lg hover:from-cyan-500/50 hover:to-cyan-400/30 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-400/20 transition transform hover:scale-105"
                  >
                    <span className="text-2xl mr-3">👨‍⚕️</span>
                    I'm a Doctor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="backdrop-blur-md bg-white/10 border-t border-white/20 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold mb-2">BillClear Hospital System</h3>
              <p className="text-gray-300 mb-3">Powered by AI | Built with Next.js & Firebase</p>
              <p className="text-gray-400">© 2026 Team Alpha - Sahyadri College</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
