import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { HospitalCatalogItem, HospitalPriceCatalog } from '@/lib/types';

export const DEFAULT_HOSPITAL_CATALOG: HospitalCatalogItem[] = [
  { id: 'x-ray', name: 'X-Ray', price: 500, category: 'Imaging', type: 'procedure' },
  { id: 'blood-test', name: 'Blood Test', price: 300, category: 'Lab', type: 'procedure' },
  { id: 'mri-scan', name: 'MRI Scan', price: 3500, category: 'Imaging', type: 'procedure' },
  { id: 'ct-scan', name: 'CT Scan', price: 2500, category: 'Imaging', type: 'procedure' },
  { id: 'ultrasound', name: 'Ultrasound', price: 800, category: 'Imaging', type: 'procedure' },
  { id: 'ecg', name: 'ECG', price: 400, category: 'Diagnostic', type: 'procedure' },
  { id: 'physical-therapy', name: 'Physical Therapy', price: 600, category: 'Treatment', type: 'procedure' },
  { id: 'surgery', name: 'Surgery', price: 15000, category: 'Procedure', type: 'procedure' },
  { id: 'consultation', name: 'Doctor Consultation', price: 500, category: 'Doctor Fee', type: 'consultation', editableByDoctor: true },
  { id: 'paracetamol', name: 'Paracetamol', price: 50, category: 'Pharmacy', type: 'medicine' },
  { id: 'amoxicillin', name: 'Amoxicillin', price: 150, category: 'Pharmacy', type: 'medicine' },
  { id: 'azithromycin', name: 'Azithromycin', price: 220, category: 'Pharmacy', type: 'medicine' },
  { id: 'ibuprofen', name: 'Ibuprofen', price: 80, category: 'Pharmacy', type: 'medicine' },
  { id: 'cetirizine', name: 'Cetirizine', price: 40, category: 'Pharmacy', type: 'medicine' },
  { id: 'omeprazole', name: 'Omeprazole', price: 90, category: 'Pharmacy', type: 'medicine' },
  { id: 'insulin', name: 'Insulin', price: 750, category: 'Pharmacy', type: 'medicine' },
  { id: 'saline-iv', name: 'IV Saline', price: 180, category: 'Pharmacy', type: 'medicine' },
  { id: 'syringe-kit', name: 'Syringe Kit', price: 35, category: 'Pharmacy', type: 'medicine' },
  { id: 'oxygen-mask', name: 'Oxygen Mask', price: 250, category: 'Pharmacy', type: 'medicine' },
  { id: 'room-charges', name: 'Room Charges', price: 1500, category: 'Stay', type: 'room' },
  { id: 'icu-charges', name: 'ICU Charges', price: 5000, category: 'Critical Care', type: 'room' },
  { id: 'ambulance', name: 'Ambulance', price: 800, category: 'Transport', type: 'transport' },
];

const catalogRef = () => doc(db!, 'hospital', 'priceCatalog');

export async function getOrCreateHospitalCatalog() {
  const snapshot = await getDoc(catalogRef());

  if (snapshot.exists()) {
    const data = snapshot.data() as Partial<HospitalPriceCatalog>;
    if (Array.isArray(data.items) && data.items.length > 0) {
      return data.items;
    }
  }

  await setDoc(catalogRef(), {
    items: DEFAULT_HOSPITAL_CATALOG,
    updatedAt: Date.now(),
    version: 1,
  });

  return DEFAULT_HOSPITAL_CATALOG;
}
