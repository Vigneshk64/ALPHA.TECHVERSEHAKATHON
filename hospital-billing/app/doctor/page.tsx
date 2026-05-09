'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { DEFAULT_HOSPITAL_CATALOG, getOrCreateHospitalCatalog } from '@/lib/hospital-catalog';
import type { HospitalCatalogItem } from '@/lib/types';

type SelectedCharge = {
  catalogId: string;
  price: number;
};

export default function DoctorPage() {
  const [authReady, setAuthReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [patientId, setPatientId] = useState('');
  const [verifiedPatient, setVerifiedPatient] = useState<{ patientId: string; name: string } | null>(null);
  const [verifyingPatient, setVerifyingPatient] = useState(false);
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [catalogItems, setCatalogItems] = useState<HospitalCatalogItem[]>(DEFAULT_HOSPITAL_CATALOG);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<'all' | HospitalCatalogItem['type']>('all');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCharges, setSelectedCharges] = useState<SelectedCharge[]>([]);
  const [consultationPrice, setConsultationPrice] = useState('');
  const [reason, setReason] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoggedIn(sessionStorage.getItem('doctor-authenticated') === 'true');
      setAuthReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      return;
    }

    let ignore = false;

    async function loadCatalog() {
      setCatalogLoading(true);

      try {
        const items = await getOrCreateHospitalCatalog();
        if (!ignore) {
          setCatalogItems(items);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load hospital catalog');
        }
      } finally {
        if (!ignore) {
          setCatalogLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      ignore = true;
    };
  }, [loggedIn]);

  const selectedChargeItems = selectedCharges
    .map((charge) => ({
      charge,
      item: catalogItems.find((catalogItem) => catalogItem.id === charge.catalogId),
    }))
    .filter((entry): entry is { charge: SelectedCharge; item: HospitalCatalogItem } => Boolean(entry.item));
  const selectedTotal = selectedChargeItems.reduce((sum, entry) => sum + entry.charge.price, 0);
  const selectedConsultation = selectedChargeItems.find((entry) => entry.item.editableByDoctor);
  const catalogTypes = useMemo(
    () => Array.from(new Set(catalogItems.map((item) => item.type))),
    [catalogItems]
  );
  const visibleCatalogItems = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();

    return catalogItems.filter((item) => {
      const matchesType = catalogFilter === 'all' || item.type === catalogFilter;
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query);

      return matchesType && matchesQuery;
    });
  }, [catalogFilter, catalogItems, catalogSearch]);

  const handleCatalogSelect = (item: HospitalCatalogItem) => {
    setSelectedCharges((currentCharges) => {
      const alreadySelected = currentCharges.some((charge) => charge.catalogId === item.id);

      if (alreadySelected) {
        if (item.editableByDoctor) {
          setConsultationPrice('');
        }

        return currentCharges.filter((charge) => charge.catalogId !== item.id);
      }

      if (item.editableByDoctor) {
        setConsultationPrice(String(item.price));
      }

      return [...currentCharges, { catalogId: item.id, price: item.price }];
    });
  };

  const handleConsultationPriceChange = (value: string) => {
    setConsultationPrice(value);

    setSelectedCharges((currentCharges) =>
      currentCharges.map((charge) => {
        const item = catalogItems.find((catalogItem) => catalogItem.id === charge.catalogId);

        if (!item?.editableByDoctor) {
          return charge;
        }

        return { ...charge, price: Number(value) };
      })
    );
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
  };

  const handleLogin = () => {
    if (loginEmail === 'georgerocky809@gmail.com' && loginPassword === 'sanathdr') {
      sessionStorage.setItem('doctor-authenticated', 'true');
      setLoggedIn(true);
      closeLoginModal();
      return;
    }

    setLoginError('Invalid credentials');
  };

  const handlePatientIdChange = (value: string) => {
    setPatientId(value);
    setVerifiedPatient(null);
    setShowCreatePatient(false);
    setNewPatientName('');
    setSelectedCharges([]);
    setConsultationPrice('');
    setReason('');
    setSuccess(false);
    setSuccessMessage('');
    setError('');
  };

  const handleVerifyPatient = async () => {
    const trimmedPatientId = patientId.trim();

    if (!trimmedPatientId) {
      setError('Please enter a patient ID');
      return;
    }

    setVerifyingPatient(true);
    setVerifiedPatient(null);
    setShowCreatePatient(false);
    setNewPatientName('');
    setSelectedCharges([]);
    setConsultationPrice('');
    setReason('');
    setSuccess(false);
    setSuccessMessage('');
    setError('');

    try {
      const userRef = doc(db!, 'users', trimmedPatientId);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        setShowCreatePatient(true);
        return;
      }

      const userData = userSnapshot.data() as { name?: string; patientId?: string; role?: string };

      if (userData.role && userData.role !== 'patient') {
        setError('This ID belongs to a non-patient user');
        return;
      }

      setVerifiedPatient({
        patientId: userData.patientId || trimmedPatientId,
        name: userData.name || 'Patient',
      });
      setPatientId(trimmedPatientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify patient');
    } finally {
      setVerifyingPatient(false);
    }
  };

  const handleCreatePatient = async () => {
    const trimmedPatientId = patientId.trim();
    const trimmedPatientName = newPatientName.trim();

    if (!trimmedPatientId) {
      setError('Please enter a patient ID');
      return;
    }

    if (!trimmedPatientName) {
      setError('Please enter the patient name');
      return;
    }

    setCreatingPatient(true);
    setError('');
    setSuccess(false);
    setSuccessMessage('');

    try {
      const timestamp = Date.now();
      const userRef = doc(db!, 'users', trimmedPatientId);
      const billRef = doc(db!, 'bills', trimmedPatientId);

      await setDoc(userRef, {
        patientId: trimmedPatientId,
        name: trimmedPatientName,
        role: 'patient',
        createdBy: 'doctor',
        createdAt: timestamp,
      });

      await setDoc(billRef, {
        patientId: trimmedPatientId,
        procedures: [],
        totalAmount: 0,
      });

      setVerifiedPatient({
        patientId: trimmedPatientId,
        name: trimmedPatientName,
      });
      setPatientId(trimmedPatientId);
      setShowCreatePatient(false);
      setNewPatientName('');
      setSuccess(true);
      setSuccessMessage('Patient created successfully. You can now add procedures.');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create patient');
    } finally {
      setCreatingPatient(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSuccessMessage('');

    if (!verifiedPatient) {
      setError('Please verify the patient ID first');
      return;
    }

    if (selectedChargeItems.length === 0 || !reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const invalidCharge = selectedChargeItems.find((entry) => !Number.isFinite(entry.charge.price) || entry.charge.price <= 0);

    if (invalidCharge) {
      setError(invalidCharge.item.editableByDoctor ? 'Please enter a valid consultation price' : 'Please select valid catalog items');
      return;
    }

    setLoadingSubmit(true);

    try {
      const billRef = doc(db!, 'bills', verifiedPatient.patientId);
      const billSnapshot = await getDoc(billRef);
      const timestamp = new Date().getTime();
      const procedureItems = selectedChargeItems.map(({ charge, item }, index) => ({
        name: item.name,
        cost: charge.price,
        reason: reason.trim(),
        timestamp: timestamp + index,
        category: item.category,
        type: item.type,
        catalogId: item.id,
        doctorPriced: Boolean(item.editableByDoctor),
      }));
      const finalCost = procedureItems.reduce((sum, item) => sum + item.cost, 0);

      if (billSnapshot.exists()) {
        await updateDoc(billRef, {
          procedures: arrayUnion(...procedureItems),
          totalAmount: increment(finalCost),
        });
      } else {
        await setDoc(billRef, {
          patientId: verifiedPatient.patientId,
          procedures: procedureItems,
          totalAmount: finalCost,
        });
      }

      setSuccess(true);
      setSuccessMessage(`${procedureItems.length} charge${procedureItems.length !== 1 ? 's' : ''} successfully added to the bill.`);
      setSelectedCharges([]);
      setConsultationPrice('');
      setReason('');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add charge');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleLockDashboard = () => {
    sessionStorage.removeItem('doctor-authenticated');
    setLoggedIn(false);
    setPatientId('');
    setSelectedCharges([]);
    setConsultationPrice('');
    setReason('');
    setVerifiedPatient(null);
    setShowCreatePatient(false);
    setNewPatientName('');
    setSuccess(false);
    setSuccessMessage('');
    setError('');
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="font-semibold text-gray-700">Loading doctor portal...</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute right-6 top-6">
          <button
            onClick={() => setShowLoginModal(true)}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Doctor Login
          </button>
        </div>

        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Doctor Portal</h1>
            <p className="mt-3 text-gray-600">Log in to access the doctor dashboard.</p>
          </div>
        </div>

        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Doctor Login</h2>
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="mb-4 w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="mb-4 w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {loginError && <p className="mb-4 text-sm font-semibold text-red-600">{loginError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeLoginModal}
                  className="rounded-xl bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogin}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600 mt-2">Add a predefined procedure to a patient&apos;s bill.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-gray-700">
              Signed in as <span className="font-semibold">Doctor</span>
            </p>
            <button
              onClick={handleLockDashboard}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              Lock dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Patient ID</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={patientId}
                onChange={(e) => handlePatientIdChange(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter patient ID"
              />
              <button
                type="button"
                onClick={handleVerifyPatient}
                disabled={verifyingPatient || !patientId.trim()}
                className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {verifyingPatient ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            {verifiedPatient && (
              <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                Patient verified: <span className="font-semibold">{verifiedPatient.name}</span>
              </div>
            )}
          </div>

          {showCreatePatient && !verifiedPatient && (
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <h2 className="text-lg font-bold text-gray-900">Create New Patient</h2>
              <p className="mt-1 text-sm text-gray-600">No patient was found for this ID.</p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name</label>
                  <input
                    type="text"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter patient name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient ID</label>
                  <input
                    type="text"
                    value={patientId.trim()}
                    readOnly
                    className="w-full rounded-2xl border border-blue-200 bg-gray-100 px-4 py-3 text-gray-900 outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreatePatient}
                disabled={creatingPatient || !newPatientName.trim()}
                className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {creatingPatient ? 'Creating Patient...' : 'Create Patient'}
              </button>
            </div>
          )}

          <div className={`mb-6 ${!verifiedPatient ? 'pointer-events-none opacity-50' : ''}`}>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Hospital Catalog</label>
                <p className="mt-1 text-xs font-medium text-gray-500">
                  Prices load from Firestore: hospital / priceCatalog.
                </p>
              </div>
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                disabled={!verifiedPatient}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-72"
                placeholder="Search catalog..."
              />
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!verifiedPatient}
                onClick={() => setCatalogFilter('all')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  catalogFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {catalogTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={!verifiedPatient}
                  onClick={() => setCatalogFilter(type)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                    catalogFilter === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {catalogLoading ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center text-sm font-semibold text-blue-700">
                Loading hospital catalog...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {visibleCatalogItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={!verifiedPatient}
                  onClick={() => handleCatalogSelect(item)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    selectedCharges.some((charge) => charge.catalogId === item.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold capitalize text-gray-700">
                      {item.type}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-blue-700">
                    {item.editableByDoctor ? 'Doctor priced' : `$${item.price.toFixed(2)}`}
                  </p>
                </button>
                ))}
              </div>
            )}
          </div>

          <div className={`mb-6 grid gap-6 md:grid-cols-2 ${!verifiedPatient ? 'pointer-events-none opacity-50' : ''}`}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Charges</label>
              {selectedChargeItems.length > 0 ? (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="space-y-3">
                    {selectedChargeItems.map(({ charge, item }) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="capitalize text-gray-500">{item.type}</p>
                        </div>
                        <p className="font-bold text-blue-700">${charge.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-blue-200 pt-3 font-bold text-gray-900">
                    <span>Total</span>
                    <span>${selectedTotal.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="w-full rounded-2xl border border-gray-300 bg-gray-100 px-4 py-3 text-gray-900">
                  Select one or more catalog items
                </div>
              )}

              {selectedConsultation && (
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={consultationPrice}
                  onChange={(e) => handleConsultationPriceChange(e.target.value)}
                  disabled={!verifiedPatient}
                  className="mt-3 w-full rounded-2xl border border-blue-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter doctor consultation price"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reason / Notes *</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={!verifiedPatient}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Explain why this charge is being added..."
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loadingSubmit || !verifiedPatient}
            className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loadingSubmit ? 'Saving procedure...' : 'Add Procedure to Bill'}
          </button>
        </form>
      </div>
    </div>
  );
}
