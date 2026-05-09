'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { verifyPatient } from '@/lib/auth';

const PROCEDURES = [
  { name: "X-Ray", category: "Imaging", price: 500 },
  { name: "Blood Test", category: "Lab", price: 300 },
  { name: "MRI Scan", category: "Imaging", price: 3500 },
  { name: "CT Scan", category: "Imaging", price: 2500 },
  { name: "Ultrasound", category: "Imaging", price: 800 },
  { name: "ECG", category: "Diagnostic", price: 400 },
  { name: "Physical Therapy", category: "Treatment", price: 600 },
  { name: "Consultation", category: "Service", price: 500 },
  { name: "Surgery", category: "Procedure", price: 15000 },
  { name: "Medication", category: "Pharmacy", price: 200 },
  { name: "Paracetamol", category: "Pharmacy", price: 50 },
  { name: "Amoxicillin", category: "Pharmacy", price: 150 },
  { name: "Room Charges", category: "Accommodation", price: 1500 },
  { name: "ICU Charges", category: "Accommodation", price: 5000 },
  { name: "Ambulance", category: "Service", price: 800 }
];

export default function DoctorPage() {
  const router = useRouter();
<<<<<<< HEAD
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  // Doctor dashboard state
=======
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
>>>>>>> 0fe5efe37e452bf98d437bbd800816573ac0b40c
  const [patientId, setPatientId] = useState('');
  const [verifiedPatient, setVerifiedPatient] = useState<{ id: string; name: string } | null>(null);
  const [verifyingPatient, setVerifyingPatient] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [creatingPatient, setCreatingPatient] = useState(false);
<<<<<<< HEAD
  const [procedure, setProcedure] = useState('');
  const [cost, setCost] = useState('');
=======
  const [selectedProcedure, setSelectedProcedure] = useState<typeof PROCEDURES[0] | null>(null);
>>>>>>> 0fe5efe37e452bf98d437bbd800816573ac0b40c
  const [reason, setReason] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    setLoginError('');

    if (email === 'georgerocky809@gmail.com' && password === 'sanathdr') {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
    } else {
      setLoginError('Invalid credentials');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLoginModal(false);
    setEmail('');
    setPassword('');
    setLoginError('');
    setPatientId('');
    setVerifiedPatient(null);
    setShowCreateForm(false);
    setProcedure('');
    setCost('');
    setReason('');
  };

  const handlePatientIdChange = (newId: string) => {
    setPatientId(newId);
    if (verifiedPatient && verifiedPatient.id !== newId.trim()) {
      setVerifiedPatient(null);
      setShowCreateForm(false);
    }
=======
    if (email === 'georgerocky809@gmail.com' && password === 'sanathdr') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleSelectProcedure = (proc: typeof PROCEDURES[0]) => {
    setSelectedProcedure(proc);
>>>>>>> 0fe5efe37e452bf98d437bbd800816573ac0b40c
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!verifiedPatient) {
      setError('Please verify the patient ID first');
      return;
    }

<<<<<<< HEAD
    if (!procedure || !reason) {
      setError('Please select a procedure and enter notes');
      return;
    }

    const selectedProcedure = PROCEDURES.find(p => p.name === procedure);
    if (!selectedProcedure) {
      setError('Invalid procedure selected');
=======
    if (!selectedProcedure) {
      setError('Please select a procedure');
      return;
    }

    if (!reason) {
      setError('Please enter a reason');
>>>>>>> 0fe5efe37e452bf98d437bbd800816573ac0b40c
      return;
    }

    const finalCost = selectedProcedure.price;

    setLoadingSubmit(true);

    try {
      const billRef = doc(db!, 'bills', verifiedPatient.id);
      const billSnapshot = await getDoc(billRef);
      const procedureItem = {
<<<<<<< HEAD
        name: procedure,
=======
        name: selectedProcedure.name,
>>>>>>> 0fe5efe37e452bf98d437bbd800816573ac0b40c
        cost: finalCost,
        reason,
        timestamp: Date.now(),
      };

      if (billSnapshot.exists()) {
        await updateDoc(billRef, {
          procedures: arrayUnion(procedureItem),
          totalAmount: increment(finalCost),
        });
      } else {
        await setDoc(billRef, {
          patientId: verifiedPatient.id,
          procedures: [procedureItem],
          totalAmount: finalCost,
        });
      }

      setSuccess(true);
<<<<<<< HEAD
      setProcedure('');
      setCost('');
=======
      setSelectedProcedure(null);
>>>>>>> 0fe5efe37e452bf98d437bbd800816573ac0b40c
      setReason('');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add charge');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleVerifyPatient = async () => {
    if (!patientId.trim()) {
      setError('Please enter a patient ID');
      return;
    }

    setVerifyingPatient(true);
    setError('');
    setVerifiedPatient(null);
    setShowCreateForm(false);
    setNewPatientName('');

    try {
      const result = await verifyPatient(patientId.trim());
      if (result.exists && result.name) {
        setVerifiedPatient({ id: patientId.trim(), name: result.name });
      } else {
        setShowCreateForm(true);
        setError('');
      }
    } catch (err) {
      setError('Failed to verify patient. Please try again.');
    } finally {
      setVerifyingPatient(false);
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatientName.trim()) {
      setError('Please enter patient name');
      return;
    }

    setCreatingPatient(true);
    setError('');

    try {
      const trimmedPatientId = patientId.trim();
      const timestamp = Date.now();

      // Create user document
      const userDocRef = doc(db!, 'users', trimmedPatientId);
      await setDoc(userDocRef, {
        patientId: trimmedPatientId,
        name: newPatientName.trim(),
        role: 'patient',
        createdBy: 'doctor',
        createdAt: timestamp,
      });

      // Create empty bill document
      const billDocRef = doc(db!, 'bills', trimmedPatientId);
      await setDoc(billDocRef, {
        patientId: trimmedPatientId,
        procedures: [],
        totalAmount: 0,
      });

      // Set verified patient and show success
      setVerifiedPatient({ id: trimmedPatientId, name: newPatientName.trim() });
      setShowCreateForm(false);
      setNewPatientName('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create patient');
    } finally {
      setCreatingPatient(false);
    }
  };

  const handleSignOut = async () => {
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
<<<<<<< HEAD
        <div className="bg-white border-b border-blue-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600 mt-2">Add a procedure to a patient's bill.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!isLoggedIn && (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm transition hover:bg-blue-700 font-semibold"
                >
                  🔐 Doctor Login
                </button>
              )}
              <button
                onClick={handleLogout}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {!isLoggedIn ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="mb-4 text-6xl">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6">Please log in to access the doctor dashboard</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-blue-600 text-white rounded-2xl px-6 py-3 font-semibold hover:bg-blue-700 transition"
            >
              Login Now
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8">
          {/* Patient Verification Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Patient ID</label>
            <div className="flex gap-3">
=======
      {!isLoggedIn ? (
        <div className="flex items-center justify-center min-h-screen">
          <form onSubmit={handleLogin} className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Doctor Login</h1>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
>>>>>>> 0fe5efe37e452bf98d437bbd800816573ac0b40c
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter email"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter password"
                required
              />
            </div>
            {loginError && (
              <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold transition hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="bg-white border-b border-blue-100 shadow-sm">
            <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-gray-600 mt-2">Add a procedure to a patient's bill.</p>
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

          <div className="max-w-3xl mx-auto px-6 py-10">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8">
              {/* Patient Verification Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Patient ID</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => handlePatientIdChange(e.target.value)}
                    className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter patient ID"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPatient}
                    disabled={verifyingPatient || !patientId.trim()}
                    className="rounded-2xl bg-green-600 px-6 py-3 text-white font-semibold transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {verifyingPatient ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
                {verifiedPatient && (
                  <div className="mt-3 rounded-2xl bg-green-50 border border-green-200 p-3">
                    <p className="text-sm text-green-700">
                      ✓ Patient verified: <span className="font-semibold">{verifiedPatient.name}</span>
                    </p>
                  </div>
                )}
              </div>

<<<<<<< HEAD
          {verifiedPatient && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Procedure</label>
            <div className="grid grid-cols-2 gap-3">
              {PROCEDURES.map((proc) => (
                <button
                  key={proc.name}
                  type="button"
                  onClick={() => {
                    setProcedure(proc.name);
                    setCost(proc.price.toString());
                  }}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    procedure === proc.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{proc.name}</p>
                  <p className="text-sm text-gray-500">{proc.category}</p>
                  <p className="text-sm font-semibold text-blue-600 mt-1">${proc.price}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cost ($)</label>
              <input
                type="number"
                step="0.01"
                value={cost}
                readOnly
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none bg-gray-50 cursor-not-allowed"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reason / Notes *</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Explain why this charge is being added..."
              />
            </div>
          </div>
            </>
          )}

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              Procedure successfully added to the bill.
            </div>
          )}

          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loadingSubmit ? 'Adding procedure...' : 'Add Procedure to Bill'}
          </button>
        </form>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Doctor Login</h2>
              <p className="text-gray-600 mt-1">Enter your credentials</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••••"
                  required
                />
              </div>

              {loginError && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold transition hover:bg-blue-700"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setEmail('');
                  setPassword('');
                  setLoginError('');
                }}
                className="w-full rounded-2xl border border-gray-300 px-5 py-3 text-gray-700 font-semibold transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
=======
              {showCreateForm && !verifiedPatient && (
                <div className="mb-6 rounded-2xl bg-blue-50 border border-blue-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Patient</h3>
                  <p className="text-sm text-gray-600 mb-4">Patient ID not found. Create a new patient record?</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Patient ID</label>
                      <input
                        type="text"
                        value={patientId}
                        disabled
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name *</label>
                      <input
                        type="text"
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Enter patient name"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleCreatePatient}
                        disabled={creatingPatient || !newPatientName.trim()}
                        className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {creatingPatient ? 'Creating...' : 'Create Patient'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewPatientName('');
                          setError('');
                        }}
                        className="rounded-2xl border border-gray-300 px-5 py-3 text-gray-700 font-semibold transition hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {verifiedPatient && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Select Procedure</label>
                    <div className="grid grid-cols-2 gap-3">
                      {PROCEDURES.map((proc) => (
                        <button
                          key={proc.name}
                          type="button"
                          onClick={() => handleSelectProcedure(proc)}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            selectedProcedure?.name === proc.name
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <p className="font-semibold text-gray-900">{proc.name}</p>
                          <p className="text-sm text-gray-500">{proc.category}</p>
                          <p className="text-sm font-semibold text-green-600">${proc.price}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedProcedure && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reason / Notes *</label>
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Explain why this charge is being added..."
                      />
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                  Procedure successfully added to the bill.
                </div>
              )}

              <button
                type="submit"
                disabled={loadingSubmit}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {loadingSubmit ? 'Saving procedure...' : 'Add Procedure to Bill'}
              </button>
            </form>
          </div>
        </>
>>>>>>> 0fe5efe37e452bf98d437bbd800816573ac0b40c
      )}
    </div>
  );
}