export interface InvoiceStats {
  totalInvoices: number;
  paid: number;
  pending: number;
  overdue: number;
  revenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
}

export interface DashboardState {
  stats: InvoiceStats;
  revenueData: MonthlyRevenue[];
  expenseData: ExpenseCategory[];
  isLoading: boolean;
  error: string | null;
}
