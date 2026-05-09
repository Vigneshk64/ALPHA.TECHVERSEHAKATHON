'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  doc,
  onSnapshot,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { onAuthStateChangedListener, getUserProfile } from '@/lib/auth';
import type { BillDocument, BillProcedure, UserProfile, UserRole } from '@/lib/types';

export function useBillListener(patientId: string) {
  const [procedures, setProcedures] = useState<BillProcedure[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      return;
    }

    const billRef = doc(db!, 'bills', patientId);
    const unsubscribe = onSnapshot(
      billRef,
      (snapshot: DocumentSnapshot) => {
        if (!snapshot.exists()) {
          setProcedures([]);
          setTotal(0);
        } else {
          const data = snapshot.data() as BillDocument;
          const procedures = data.procedures || [];
          setProcedures(procedures);
          setTotal(data.totalAmount ?? procedures.reduce((sum, proc) => sum + proc.cost, 0));
        }
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [patientId]);

  if (!patientId) {
    return { procedures: [], total: 0, loading: false, error };
  }

  return { procedures, total, loading, error };
}

export function useProtectedPage(requiredRole: UserRole) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (user) => {
      if (!user) {
        router.replace('/');
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (!profile || profile.role !== requiredRole) {
          router.replace('/');
          setLoading(false);
          return;
        }

        setUserProfile(profile);
      } catch {
        router.replace('/');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [requiredRole, router]);

  return { userProfile, loading };
}
