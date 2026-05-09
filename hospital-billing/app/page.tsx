'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🏥 Hospital Billing Transparency</h1>
          <p className="text-gray-600 text-sm">Making healthcare costs clear</p>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Understand Your Medical Bills
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            No more confusing jargon. No more hidden costs. Every charge explained in plain English with AI-powered explanations.
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Patient Card */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden border-t-4 border-blue-500">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-2xl font-bold">Patient View</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-6 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>Real-time bill updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>See costs as they're added</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>AI explains any procedure</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>Running total always visible</span>
                </li>
              </ul>
              <Link
                href="/patient"
                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                View Your Bill
              </Link>
            </div>
          </div>

          {/* Doctor Card */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden border-t-4 border-green-500">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-white">
              <div className="text-4xl mb-3">👨‍⚕️</div>
              <h3 className="text-2xl font-bold">Doctor View</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-6 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Add procedures easily</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Common procedures library</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Custom entries allowed</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Instant patient notification</span>
                </li>
              </ul>
              <Link
                href="/doctor"
                className="w-full block text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Add Charges
              </Link>
            </div>
          </div>

          {/* Billing Card */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden border-t-4 border-purple-500">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-8 text-white">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-2xl font-bold">Billing Summary</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-6 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">✓</span>
                  <span>Final itemized bill</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">✓</span>
                  <span>Plain language descriptions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">✓</span>
                  <span>No hidden fees guarantee</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">✓</span>
                  <span>Print & download options</span>
                </li>
              </ul>
              <Link
                href="/billing"
                className="w-full block text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                View Final Bill
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-16 border-l-4 border-blue-600">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">✨ Key Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <span className="text-3xl">🔄</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Real-time Updates</h4>
                <p className="text-gray-600">Changes appear instantly using Firebase Firestore listeners</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-3xl">🤖</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">AI Explanations</h4>
                <p className="text-gray-600">Medical jargon explained in plain English using Google Gemma 2 AI</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-3xl">🔒</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Transparency</h4>
                <p className="text-gray-600">All charges visible with reasons - no hidden fees ever</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-3xl">📊</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Print & Download</h4>
                <p className="text-gray-600">Export bills as PDF or CSV for records</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-8 md:p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">🛠️ Built With Modern Technology</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Frontend & Backend</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• <span className="font-semibold">Next.js 14</span> App Router</li>
                <li>• <span className="font-semibold">TypeScript</span> for type safety</li>
                <li>• <span className="font-semibold">Tailwind CSS</span> for styling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Data & AI</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• <span className="font-semibold">Firebase Firestore</span> for real-time data</li>
                <li>• <span className="font-semibold">OpenRouter API</span> for AI explanations</li>
                <li>• <span className="font-semibold">Google Gemma 2</span> language model</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="mb-2">🏥 Hospital Billing Transparency System - Healthcare Hackathon</p>
          <p className="text-gray-400 text-sm">Making healthcare costs transparent and understandable for everyone</p>
        </div>
      </footer>
    </div>
  );
}
