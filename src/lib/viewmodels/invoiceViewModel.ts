import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  InvoiceState,
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from "../models/invoice";
import { createInvoiceService } from "../services/invoiceService";
import { getUrqlClient } from "../urql/client";
import { toast } from "sonner";

export const useInvoiceViewModel = create<
  InvoiceState & {
    fetchInvoices: (page?: number, limit?: number) => Promise<void>;
    fetchInvoice: (id: number) => Promise<void>;
    createInvoice: (
      input: CreateInvoiceInput,
      file?: File
    ) => Promise<Invoice | null>;
    updateInvoice: (
      input: UpdateInvoiceInput,
      file?: File
    ) => Promise<Invoice | null>;
    deleteInvoice: (id: number) => Promise<void>;
    setCurrentInvoice: (invoice: Invoice | null) => void;
    clearError: () => void;
  }
>()(
  persist(
    (set, get) => ({
      invoices: [],
      currentInvoice: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },

      fetchInvoices: async (page = 1, limit = 10) => {
        set({ loading: true, error: null });
        try {
          const client = getUrqlClient();
          const invoiceService = createInvoiceService(client);
          const response = await invoiceService.getInvoices(page, limit);

          set({
            invoices: response.invoices,
            pagination: {
              page: response.page,
              limit: response.limit,
              total: response.total,
              totalPages: response.totalPages,
            },
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erreur lors de la récupération des factures";
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
        }
      },

      fetchInvoice: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const client = getUrqlClient();
          const invoiceService = createInvoiceService(client);
          const invoice = await invoiceService.getInvoice(id);
          set({ currentInvoice: invoice, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erreur lors de la récupération de la facture";
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
        }
      },

      createInvoice: async (input: CreateInvoiceInput, file?: File) => {
        set({ loading: true, error: null });
        try {
          const client = getUrqlClient();
          const invoiceService = createInvoiceService(client);

          let newInvoice: Invoice;
          if (file) {
            newInvoice = await invoiceService.createInvoiceWithFile(
              file,
              input
            );
          } else {
            newInvoice = await invoiceService.createInvoice(input);
          }

          const currentInvoices = get().invoices;
          set({
            invoices: [newInvoice, ...currentInvoices],
            currentInvoice: newInvoice,
            loading: false,
          });

          toast.success("Facture créée avec succès");
          return newInvoice;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erreur lors de la création de la facture";
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          return null;
        }
      },

      updateInvoice: async (input: UpdateInvoiceInput, file?: File) => {
        set({ loading: true, error: null });
        try {
          const client = getUrqlClient();
          const invoiceService = createInvoiceService(client);

          let updatedInvoice: Invoice;
          if (file) {
            updatedInvoice = await invoiceService.updateInvoiceWithFile(
              input.id,
              file,
              input
            );
          } else {
            updatedInvoice = await invoiceService.updateInvoice(input);
          }

          const currentInvoices = get().invoices;
          const updatedInvoices = currentInvoices.map((invoice) =>
            invoice.id === updatedInvoice.id ? updatedInvoice : invoice
          );

          set({
            invoices: updatedInvoices,
            currentInvoice: updatedInvoice,
            loading: false,
          });

          toast.success("Facture mise à jour avec succès");
          return updatedInvoice;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erreur lors de la mise à jour de la facture";
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          return null;
        }
      },

      deleteInvoice: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const client = getUrqlClient();
          const invoiceService = createInvoiceService(client);
          await invoiceService.deleteInvoice(id);

          const currentInvoices = get().invoices;
          const filteredInvoices = currentInvoices.filter(
            (invoice) => invoice.id !== id
          );

          set({
            invoices: filteredInvoices,
            currentInvoice:
              get().currentInvoice?.id === id ? null : get().currentInvoice,
            loading: false,
          });

          toast.success("Facture supprimée avec succès");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erreur lors de la suppression de la facture";
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
        }
      },

      setCurrentInvoice: (invoice: Invoice | null) => {
        set({ currentInvoice: invoice });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "invoice-storage",
      partialize: (state) => ({
        invoices: state.invoices,
        currentInvoice: state.currentInvoice,
        pagination: state.pagination,
      }),
    }
  )
);
