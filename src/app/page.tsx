"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthViewModel } from "@/lib/viewmodels/authViewModel";
import { useInvoiceViewModel } from "@/lib/viewmodels/invoiceViewModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Eye } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { logout, isLoading: isLogoutLoading, token } = useAuthViewModel();
  const {
    invoices,
    fetchInvoices,
    loading: invoicesLoading,
  } = useInvoiceViewModel();

  useEffect(() => {
    if (token) {
      fetchInvoices(1, 5);
    }
  }, [token, fetchInvoices]);

  const handleLogout = () => {
    logout(router);
  };

  const recentInvoices = invoices.slice(0, 5);
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce(
    (sum, invoice) =>
      sum + (invoice.invoiceData?.reduce((s, d) => s + d.amount, 0) || 0),
    0
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold">Tableau de bord</h1>
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" onClick={() => router.push("/")}>
                Accueil
              </Button>
              <Button variant="ghost" onClick={() => router.push("/invoices")}>
                Factures
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/invoices/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle facture
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLogoutLoading}
            >
              {isLogoutLoading ? "Déconnexion..." : "Se déconnecter"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-6 p-6 md:p-8">
        {invoicesLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg">Chargement des données...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Mes factures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total
                      </span>
                      <span className="font-medium">{totalInvoices}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Montant total
                      </span>
                      <span className="font-medium">
                        {totalAmount.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => router.push("/invoices")}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir toutes les factures
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Bienvenue dans votre espace factures</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Gérez facilement vos factures émises et reçues. Créez,
                      modifiez et organisez toutes vos factures en un seul
                      endroit.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={() => router.push("/invoices/new")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer une facture
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/invoices")}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir toutes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {recentInvoices.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Factures récentes</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/invoices")}
                    >
                      Voir tout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                      >
                        <div>
                          <p className="font-medium">{invoice.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(invoice.date).toLocaleDateString("fr-FR")}{" "}
                            • {invoice.type === "EMIS" ? "Émise" : "Reçue"}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {(
                            invoice.invoiceData?.reduce(
                              (sum, data) => sum + data.amount,
                              0
                            ) || 0
                          ).toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
