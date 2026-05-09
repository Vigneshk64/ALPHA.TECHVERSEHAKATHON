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
