
export interface Transaction {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'P2P_SENT' | 'P2P_RECEIVED' | 'LOAN_DISBURSEMENT' | 'LOAN_PAYMENT' | 'CONTRIBUTION_SENT' | 'CONTRIBUTION_RECEIVED' | 'GROUP_WITHDRAWAL';
  status: string;
  created_at: string;
  currency: string;
  metadata?: string; // Viene como JSON string del backend
}

export interface Loan {
  id: number;
  principal_amount: number;
  outstanding_balance: number;
  status: 'active' | 'paid';
  created_at: string;
}

export interface AccountBalance {
  user_id: number;
  balance: number;
  currency: string;
  active_loan?: Loan | null; // El backend ahora nos devolverá esto
}