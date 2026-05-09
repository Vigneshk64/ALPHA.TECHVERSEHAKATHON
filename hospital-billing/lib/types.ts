export type UserRole = 'patient' | 'doctor' | 'billing';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: number;
}

export interface BillProcedure {
  name: string;
  cost: number;
  reason: string;
  timestamp: number;
  category?: string;
  type?: 'procedure' | 'medicine' | 'room' | 'transport' | 'consultation';
  catalogId?: string;
  doctorPriced?: boolean;
}

export interface BillDocument {
  id: string;
  patientId: string;
  procedures: BillProcedure[];
  totalAmount: number;
}

export interface Procedure {
  id: string;
  name: string;
  defaultCost: number;
  category: string;
}

export interface HospitalCatalogItem {
  id: string;
  name: string;
  price: number;
  category: string;
  type: 'procedure' | 'medicine' | 'room' | 'transport' | 'consultation';
  editableByDoctor?: boolean;
}

export interface HospitalPriceCatalog {
  items: HospitalCatalogItem[];
  updatedAt: number;
  version: number;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role?: 'patient' | 'doctor' | 'billing';
  createdAt?: number;
}

export interface AuthContextType {
  user: User | null;
  needsProfileSetup: boolean;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}
