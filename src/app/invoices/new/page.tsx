"use client";

import { useRouter } from "next/navigation";
import { useInvoiceViewModel } from "@/lib/viewmodels/invoiceViewModel";
import { useAuthViewModel } from "@/lib/viewmodels/authViewModel";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { CreateInvoiceInput } from "@/lib/models/invoice";
import { useEffect } from "react";

export default function NewInvoicePage() {
  const router = useRouter();
  const { token } = useAuthViewModel();
  const { createInvoice, loading } = useInvoiceViewModel();

  useEffect(() => {
    // Le token est automatiquement géré par le client URQL
  }, [token]);

  const handleSubmit = async (data: CreateInvoiceInput, file?: File) => {
    const result = await createInvoice(data, file);
    if (result) {
      router.push("/invoices");
    }
  };

  const handleCancel = () => {
    router.push("/invoices");
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nouvelle facture</h1>
        <p className="text-muted-foreground">
          Uploadez votre facture pour extraction automatique des données par IA
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            🤖 Comment ça marche ?
          </h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Remplissez les informations de base</li>
            <li>2. Uploadez votre fichier (PDF, image, Word)</li>
            <li>3. Notre IA extrait automatiquement les données</li>
            <li>4. Consultez les résultats dans quelques instants</li>
          </ol>
        </div>
      </div>

      <InvoiceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={loading}
      />
    </div>
  );
}
