export interface BillItem {
  id: string;
  procedure: string;
  cost: number;
  reason: string;
  timestamp: number;
  status?: 'pending' | 'completed';
}

export interface PatientBill {
  patientId: string;
  items: BillItem[];
  total: number;
  lastUpdated: number;
}

export interface Procedure {
  id: string;
  name: string;
  defaultCost: number;
  category: string;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'billing';
  createdAt: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}
