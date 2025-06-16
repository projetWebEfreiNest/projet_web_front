"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { ImportDialog } from "@/components/dashboard/ImportDialog";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { useDashboardViewModel } from "@/lib/viewmodels/dashboardViewModel";
import { useAuthViewModel } from "@/lib/viewmodels/authViewModel";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const router = useRouter();
  const { fetchDashboardData, isLoading } = useDashboardViewModel();
  const { logout, isLoading: isLogoutLoading } = useAuthViewModel();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    logout(router);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <div className="flex items-center gap-4">
            <ImportDialog />
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
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg">Chargement des données...</p>
          </div>
        ) : (
          <>
            <DashboardStats />

            <div className="grid gap-6 md:grid-cols-2">
              <RevenueChart />
              <ExpenseChart />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
