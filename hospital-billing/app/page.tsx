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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <nav className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🏥 Hospital Billing Transparency</h1>
          <p className="text-gray-600 text-sm">Making healthcare costs clear</p>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Welcome to Hospital Billing System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Select your role to access the appropriate dashboard and manage medical billing with transparency.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <button
            onClick={() => handleRoleSelect('patient')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200"
          >
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm a Patient</h3>
            <p className="text-gray-600">View your medical bills and get AI-powered explanations</p>
          </button>

          <button
            onClick={() => handleRoleSelect('doctor')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-200"
          >
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm a Doctor</h3>
            <p className="text-gray-600">Add procedures and manage patient billing</p>
          </button>

          <button
            onClick={() => handleRoleSelect('billing')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-200"
          >
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm Billing Staff</h3>
            <p className="text-gray-600">Manage billing summaries and reports</p>
          </button>
        </div>
      </div>
    </div>
  );
}
