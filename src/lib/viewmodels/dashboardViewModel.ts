import { create } from "zustand";
import { DashboardState } from "../models/dashboard";

const mockStats = {
  totalInvoices: 124,
  paid: 86,
  pending: 27,
  overdue: 11,
  revenue: 12480,
};

const mockRevenueData = [
  { month: "Jan", revenue: 1200 },
  { month: "Fév", revenue: 1900 },
  { month: "Mar", revenue: 1300 },
  { month: "Avr", revenue: 1700 },
  { month: "Mai", revenue: 2200 },
  { month: "Juin", revenue: 1600 },
  { month: "Juil", revenue: 1800 },
  { month: "Août", revenue: 1400 },
  { month: "Sep", revenue: 2100 },
  { month: "Oct", revenue: 1900 },
  { month: "Nov", revenue: 2300 },
  { month: "Déc", revenue: 2500 },
];

const mockExpenseData = [
  { category: "Services", amount: 4300 },
  { category: "Matériel", amount: 2500 },
  { category: "Marketing", amount: 1800 },
  { category: "Logiciels", amount: 1200 },
  { category: "Autres", amount: 900 },
];

export const useDashboardViewModel = create<
  DashboardState & {
    fetchDashboardData: () => Promise<void>;
    importInvoices: (files: File[]) => Promise<void>;
  }
>((set) => ({
  stats: mockStats,
  revenueData: mockRevenueData,
  expenseData: mockExpenseData,
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      set({
        stats: mockStats,
        revenueData: mockRevenueData,
        expenseData: mockExpenseData,
        isLoading: false,
      });
    } catch {
      set({
        isLoading: false,
        error: "Erreur lors du chargement des données du tableau de bord",
      });
    }
  },

  importInvoices: async (files) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log(`${files.length} fichiers prêts pour l'importation`);
      set({ isLoading: false });
      return Promise.resolve();
    } catch (error) {
      set({
        isLoading: false,
        error: "Erreur lors de l'importation des factures",
      });
      return Promise.reject(error);
    }
  },
}));
