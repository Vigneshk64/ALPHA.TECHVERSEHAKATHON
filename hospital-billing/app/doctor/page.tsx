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
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientEstimate, setNewPatientEstimate] = useState('');
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
    setNewPatientAge('');
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
    setNewPatientAge('');
    setNewPatientEstimate('');
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
    const trimmedPatientAge = newPatientAge.trim();

    if (!trimmedPatientId) {
      setError('Please enter a patient ID');
      return;
    }

    if (!trimmedPatientName) {
      setError('Please enter the patient name');
      return;
    }

    if (!trimmedPatientAge) {
      setError('Please enter the patient age');
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
      const estimatedCostNum = parseFloat(newPatientEstimate);
      const hasEstimate = !isNaN(estimatedCostNum) && estimatedCostNum > 0;

      await setDoc(userRef, {
        patientId: trimmedPatientId,
        name: trimmedPatientName,
        age: trimmedPatientAge,
        role: 'patient',
        createdBy: 'doctor',
        createdAt: timestamp,
      });

      await setDoc(billRef, {
        patientId: trimmedPatientId,
        procedures: [],
        totalAmount: 0,
        ...(hasEstimate && { estimatedCost: estimatedCostNum }),
      });

      setVerifiedPatient({
        patientId: trimmedPatientId,
        name: trimmedPatientName,
      });
      setPatientId(trimmedPatientId);
      setShowCreatePatient(false);
      setNewPatientName('');
      setNewPatientAge('');
      setNewPatientEstimate('');
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

  // ── Loading ───────────────────────────────────────────────
  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2" style={{ borderColor: '#2563EB' }} />
          <p style={{ color: '#64748B' }} className="text-sm font-medium">Loading doctor portal…</p>
        </div>
      </div>
    );
  }

  // ── Login ─────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', width: '100%', maxWidth: '420px' }} className="rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-7">
            <div style={{ background: '#2563EB' }} className="grid h-10 w-10 place-items-center rounded-lg text-white font-bold text-sm">KVS</div>
            <div>
              <p style={{ color: '#2563EB' }} className="text-xs font-semibold uppercase tracking-wide">Secure Access</p>
              <h1 style={{ color: '#0F172A' }} className="text-lg font-bold">Doctor Login</h1>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-medium">Email address</label>
              <input type="email" value={loginEmail} placeholder="doctor@kvshospital.in"
                onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ border: '1px solid #CBD5E1', color: '#0F172A' }}
                className="w-full rounded-lg bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-medium">Password</label>
              <input type="password" value={loginPassword} placeholder="••••••••"
                onChange={e => setLoginPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ border: '1px solid #CBD5E1', color: '#0F172A' }}
                className="w-full rounded-lg bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
          {loginError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }} className="mt-4 rounded-lg px-4 py-3 text-sm">{loginError}</div>
          )}
          <button onClick={handleLogin} style={{ background: '#2563EB' }}
            className="mt-6 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
            Log in
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A' }}>

      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 30 }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <div style={{ background: '#2563EB' }} className="grid h-9 w-9 place-items-center rounded-lg text-white font-bold text-sm">KVS</div>
            <div>
              <p style={{ color: '#2563EB' }} className="text-xs font-semibold uppercase tracking-wide">KVS Hospital</p>
              <h1 style={{ color: '#0F172A' }} className="text-lg font-bold leading-tight">Doctor Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ color: '#64748B' }} className="text-sm hidden sm:inline">Signed in as <strong style={{ color: '#0F172A' }}>Doctor</strong></span>
            <button onClick={handleLockDashboard}
              style={{ border: '1px solid #CBD5E1', color: '#374151' }}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50">Lock Dashboard</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <form onSubmit={handleSubmit} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }} className="rounded-2xl p-6 shadow-sm sm:p-8">

          {/* Patient ID */}
          <div className="mb-7">
            <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-semibold">Patient ID</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input type="text" value={patientId} placeholder="Enter patient ID" onChange={e => handlePatientIdChange(e.target.value)}
                style={{ border: '1px solid #CBD5E1', color: '#0F172A' }}
                className="w-full rounded-lg bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              <button type="button" onClick={handleVerifyPatient} disabled={verifyingPatient || !patientId.trim()}
                style={{ background: '#059669' }}
                className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                {verifyingPatient ? 'Verifying…' : 'Verify Patient'}
              </button>
            </div>
            {verifiedPatient && (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#065F46' }} className="mt-3 rounded-lg px-4 py-3 text-sm">
                ✓ Verified: <strong>{verifiedPatient.name}</strong> ({verifiedPatient.patientId})
              </div>
            )}
          </div>

          {/* Create Patient */}
          {showCreatePatient && !verifiedPatient && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }} className="mb-7 rounded-xl p-5">
              <h2 style={{ color: '#0F172A' }} className="font-bold mb-1">Create New Patient</h2>
              <p style={{ color: '#64748B' }} className="text-sm mb-4">No patient found for this ID. Register them below.</p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-medium">Patient Name</label>
                  <input type="text" value={newPatientName} placeholder="Full name" onChange={e => setNewPatientName(e.target.value)}
                    style={{ border: '1px solid #CBD5E1', color: '#0F172A' }}
                    className="w-full rounded-lg bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-medium">Age</label>
                  <input type="number" min="0" value={newPatientAge} placeholder="e.g. 45" onChange={e => setNewPatientAge(e.target.value)}
                    style={{ border: '1px solid #CBD5E1', color: '#0F172A' }}
                    className="w-full rounded-lg bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-medium">Patient ID</label>
                  <input type="text" value={patientId.trim()} readOnly
                    style={{ border: '1px solid #E2E8F0', color: '#94A3B8', background: '#F8FAFC' }}
                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none" />
                </div>
                <div>
                  <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-medium">
                    Estimated Cost (₹) <span style={{ color: '#94A3B8' }} className="font-normal">(optional)</span>
                  </label>
                  <input type="number" min="0" step="0.01" value={newPatientEstimate} placeholder="e.g. 5000" onChange={e => setNewPatientEstimate(e.target.value)}
                    style={{ border: '1px solid #FDE68A', color: '#0F172A', background: '#FFFBEB' }}
                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none" />
                  <p style={{ color: '#94A3B8' }} className="mt-1 text-xs">Patient will see this vs actual charges</p>
                </div>
              </div>
              <button type="button" onClick={handleCreatePatient} disabled={creatingPatient || !newPatientName.trim()}
                style={{ background: '#2563EB' }}
                className="mt-4 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
                {creatingPatient ? 'Creating…' : 'Create Patient'}
              </button>
            </div>
          )}

          {/* Hospital Catalog */}
          <div className={`mb-7 ${!verifiedPatient ? 'pointer-events-none opacity-50' : ''}`}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <label style={{ color: '#374151' }} className="block text-sm font-semibold">Hospital Catalog</label>
                <p style={{ color: '#94A3B8' }} className="text-xs mt-0.5">Prices from Firestore: hospital / priceCatalog</p>
              </div>
              <input type="text" value={catalogSearch} placeholder="Search catalog…" disabled={!verifiedPatient}
                onChange={e => setCatalogSearch(e.target.value)}
                style={{ border: '1px solid #CBD5E1', color: '#0F172A' }}
                className="w-full rounded-lg bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-56" />
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <button type="button" disabled={!verifiedPatient} onClick={() => setCatalogFilter('all')}
                style={catalogFilter === 'all' ? { background: '#2563EB', color: '#FFFFFF', border: '1px solid #2563EB' } : { border: '1px solid #CBD5E1', color: '#374151', background: '#FFFFFF' }}
                className="rounded-full px-4 py-1.5 text-sm font-medium transition hover:opacity-90">All</button>
              {catalogTypes.map(type => (
                <button key={type} type="button" disabled={!verifiedPatient} onClick={() => setCatalogFilter(type)}
                  style={catalogFilter === type ? { background: '#2563EB', color: '#FFFFFF', border: '1px solid #2563EB' } : { border: '1px solid #CBD5E1', color: '#374151', background: '#FFFFFF' }}
                  className="rounded-full px-4 py-1.5 text-sm font-medium capitalize transition hover:opacity-90">{type}</button>
              ))}
            </div>
            {catalogLoading ? (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }} className="rounded-xl p-8 text-center">
                <p style={{ color: '#64748B' }} className="text-sm">Loading hospital catalog…</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCatalogItems.map(item => {
                  const sel = selectedCharges.some(c => c.catalogId === item.id);
                  return (
                    <button key={item.id} type="button" disabled={!verifiedPatient} onClick={() => handleCatalogSelect(item)}
                      style={sel ? { border: '2px solid #2563EB', background: '#EFF6FF' } : { border: '1px solid #E2E8F0', background: '#FFFFFF' }}
                      className="rounded-xl px-4 py-4 text-left transition hover:shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p style={{ color: '#0F172A' }} className="font-semibold text-sm">{item.name}</p>
                          <p style={{ color: '#94A3B8' }} className="text-xs mt-0.5">{item.category}</p>
                        </div>
                        <span style={{ background: '#F1F5F9', color: '#64748B' }} className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize shrink-0">{item.type}</span>
                      </div>
                      <p style={{ color: '#2563EB' }} className="mt-3 text-sm font-bold">
                        {item.editableByDoctor ? 'Doctor priced' : `₹${item.price.toFixed(2)}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected + Reason */}
          <div className={`mb-7 grid gap-5 md:grid-cols-2 ${!verifiedPatient ? 'pointer-events-none opacity-50' : ''}`}>
            <div>
              <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-semibold">Selected Charges</label>
              {selectedChargeItems.length > 0 ? (
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }} className="rounded-xl p-4">
                  <div className="space-y-2">
                    {selectedChargeItems.map(({ charge, item }) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p style={{ color: '#0F172A' }} className="font-medium">{item.name}</p>
                          <p style={{ color: '#64748B' }} className="text-xs capitalize">{item.type}</p>
                        </div>
                        <p style={{ color: '#1D4ED8' }} className="font-bold">₹{charge.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm font-bold" style={{ borderColor: '#BFDBFE' }}>
                    <span style={{ color: '#0F172A' }}>Total</span>
                    <span style={{ color: '#1D4ED8' }}>₹{selectedTotal.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#94A3B8' }} className="rounded-xl px-4 py-3 text-sm">
                  Select one or more catalog items above
                </div>
              )}
              {selectedConsultation && (
                <div className="mt-3">
                  <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-medium">Consultation Price (₹)</label>
                  <input type="number" min="1" step="1" value={consultationPrice} disabled={!verifiedPatient}
                    onChange={e => handleConsultationPriceChange(e.target.value)} placeholder="Enter price"
                    style={{ border: '1px solid #CBD5E1', color: '#0F172A' }}
                    className="w-full rounded-lg bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
              )}
            </div>
            <div>
              <label style={{ color: '#374151' }} className="mb-1.5 block text-sm font-semibold">
                Reason / Notes <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} disabled={!verifiedPatient} rows={5}
                placeholder="Explain why this charge is being added. Patients will see this."
                style={{ border: '1px solid #CBD5E1', color: '#0F172A', resize: 'vertical' }}
                className="w-full rounded-lg bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              <p style={{ color: '#94A3B8' }} className="mt-1 text-xs">This reason is visible to the patient on their portal.</p>
            </div>
          </div>

          {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }} className="mb-5 rounded-lg px-4 py-3 text-sm">{error}</div>}
          {success && <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#065F46' }} className="mb-5 rounded-lg px-4 py-3 text-sm">{successMessage}</div>}

          <button type="submit" disabled={loadingSubmit || !verifiedPatient}
            style={{ background: '#2563EB' }}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
            {loadingSubmit ? 'Saving charges…' : 'Add Procedure to Bill'}
          </button>
        </form>
      </div>
    </div>
  );
}

