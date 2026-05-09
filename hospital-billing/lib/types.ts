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
