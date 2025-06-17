"use client";

import { useEffect, useCallback } from "react";
import { useInvoiceViewModel } from "@/lib/viewmodels/invoiceViewModel";
import { Invoice, getInvoiceStatus, InvoiceStatus } from "@/lib/models/invoice";

interface UseInvoicePollingProps {
  invoices: Invoice[];
  enabled?: boolean;
  intervalMs?: number;
}

/**
 * Hook pour rafraîchir automatiquement les factures en cours de traitement
 */
export function useInvoicePolling({
  invoices,
  enabled = true,
  intervalMs = 5000,
}: UseInvoicePollingProps) {
  const { fetchInvoice } = useInvoiceViewModel();

  // Identifie les factures en cours de traitement
  const processingInvoices = invoices.filter(
    (invoice) => getInvoiceStatus(invoice) === InvoiceStatus.PROCESSING
  );

  const refreshProcessingInvoices = useCallback(async () => {
    if (!enabled || processingInvoices.length === 0) return;

    // Rafraîchir chaque facture en cours de traitement
    for (const invoice of processingInvoices) {
      try {
        await fetchInvoice(invoice.id);
      } catch (error) {
        console.error(
          `Erreur lors du rafraîchissement de la facture ${invoice.id}:`,
          error
        );
      }
    }
  }, [enabled, processingInvoices, fetchInvoice]);

  useEffect(() => {
    if (!enabled || processingInvoices.length === 0) return;

    const interval = setInterval(refreshProcessingInvoices, intervalMs);

    return () => clearInterval(interval);
  }, [
    refreshProcessingInvoices,
    intervalMs,
    enabled,
    processingInvoices.length,
  ]);

  return {
    processingCount: processingInvoices.length,
    isPolling: enabled && processingInvoices.length > 0,
    refreshManually: refreshProcessingInvoices,
  };
}
