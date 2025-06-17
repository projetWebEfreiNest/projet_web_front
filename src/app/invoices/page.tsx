"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInvoiceViewModel } from "@/lib/viewmodels/invoiceViewModel";
import { useAuthViewModel } from "@/lib/viewmodels/authViewModel";
import { useInvoicePolling } from "@/hooks/useInvoicePolling";
import { InvoiceCard } from "@/components/invoices/InvoiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, RefreshCw, Zap } from "lucide-react";
import { Invoice } from "@/lib/models/invoice";

export default function InvoicesPage() {
  const router = useRouter();
  const { token } = useAuthViewModel();
  const {
    invoices,
    loading,
    error,
    pagination,
    fetchInvoices,
    deleteInvoice,
    setCurrentInvoice,
  } = useInvoiceViewModel();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Polling pour les factures en cours de traitement
  const { processingCount, isPolling, refreshManually } = useInvoicePolling({
    invoices,
    enabled: true,
    intervalMs: 5000,
  });

  useEffect(() => {
    if (token) {
      fetchInvoices();
    }
  }, [token, fetchInvoices]);

  const handleCreateNew = () => {
    setCurrentInvoice(null);
    router.push("/invoices/new");
  };

  const handleView = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    router.push(`/invoices/${invoice.id}`);
  };

  const handleEdit = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    router.push(`/invoices/${invoice.id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      await deleteInvoice(id);
    }
  };

  const handleDownload = (invoice: Invoice) => {
    if (invoice.filePath) {
      window.open(invoice.filePath, "_blank");
    }
  };

  const handlePageChange = (page: number) => {
    fetchInvoices(page, pagination.limit);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || invoice.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalEmis = invoices
    .filter((inv) => inv.type === "EMIS")
    .reduce(
      (sum, inv) =>
        sum + (inv.invoiceData?.reduce((s, d) => s + d.amount, 0) || 0),
      0
    );

  const totalRecus = invoices
    .filter((inv) => inv.type === "RECUS")
    .reduce(
      (sum, inv) =>
        sum + (inv.invoiceData?.reduce((s, d) => s + d.amount, 0) || 0),
      0
    );

  if (loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-lg">Chargement des factures...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes factures</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-muted-foreground">
              Gérez vos factures émises et reçues
            </p>
            {isPolling && processingCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Zap className="h-4 w-4 animate-pulse" />
                <span>{processingCount} facture(s) en traitement</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshManually}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total émis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {totalEmis.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total reçu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {totalRecus.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total factures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une facture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toutes</SelectItem>
            <SelectItem value="EMIS">Factures émises</SelectItem>
            <SelectItem value="RECUS">Factures reçues</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== "ALL"
                ? "Aucune facture ne correspond à vos critères"
                : "Aucune facture trouvée"}
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Créer votre première facture
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                variant={page === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                disabled={loading}
              >
                {page}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
