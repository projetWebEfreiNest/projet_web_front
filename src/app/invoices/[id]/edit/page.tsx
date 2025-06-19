"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useInvoiceViewModel } from "@/lib/viewmodels/invoiceViewModel";
import { useAuthViewModel } from "@/lib/viewmodels/authViewModel";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { CreateInvoiceInput, UpdateInvoiceInput } from "@/lib/models/invoice";

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const { token } = useAuthViewModel();
  const { currentInvoice, loading, error, fetchInvoice, updateInvoice } =
    useInvoiceViewModel();

  useEffect(() => {
    if (token && id && (!currentInvoice || currentInvoice.id !== id)) {
      fetchInvoice(id);
    }
  }, [token, id, currentInvoice, fetchInvoice]);

  const handleSubmit = async (data: CreateInvoiceInput, file?: File) => {
    const updateData: UpdateInvoiceInput = {
      ...data,
      id: id,
    };

    const result = await updateInvoice(updateData, file);
    if (result) {
      router.push(`/invoices/${id}`);
    }
  };

  const handleCancel = () => {
    router.push(`/invoices/${id}`);
  };

  if (loading && !currentInvoice) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-lg">Chargement de la facture...</p>
      </div>
    );
  }

  if (error || !currentInvoice) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || "Facture non trouvée"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Modifier la facture</h1>
        <p className="text-muted-foreground">
          Modifiez les informations de votre facture
        </p>
      </div>

      <InvoiceForm
        invoice={currentInvoice}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={loading}
      />
    </div>
  );
}
