"use client";

import { useEffect } from "react";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { ImportDialog } from "@/components/dashboard/ImportDialog";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { useDashboardViewModel } from "@/lib/viewmodels/dashboardViewModel";

export default function Dashboard() {
  const { fetchDashboardData, isLoading } = useDashboardViewModel();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <ImportDialog />
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
