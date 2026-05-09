'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { BillItem } from '@/lib/types';

export function useBillListener(patientId: string) {
  const [items, setItems] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    try {
      const q = query(
        collection(db, 'bills'),
        where('patientId', '==', patientId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const billItems: BillItem[] = [];
        snapshot.forEach((doc) => {
          billItems.push({ id: doc.id, ...doc.data() } as BillItem);
        });
        billItems.sort((a, b) => b.timestamp - a.timestamp);
        setItems(billItems);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bills');
      setLoading(false);
    }
  }, [patientId]);

  const total = items.reduce((sum, item) => sum + item.cost, 0);

  return { items, total, loading, error };
}
