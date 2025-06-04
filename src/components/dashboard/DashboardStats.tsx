"use client";

import { useDashboardViewModel } from "@/lib/viewmodels/dashboardViewModel";

export function DashboardStats() {
  const { stats } = useDashboardViewModel();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-medium text-gray-800">
              Total des factures
            </p>
            <p className="text-3xl font-bold text-gray-600">
              {stats.totalInvoices}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Factures payées</p>
            <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Factures en attente
            </p>
            <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Factures en retard
            </p>
            <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
