"use client";

import { useDashboardViewModel } from "@/lib/viewmodels/dashboardViewModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export function RevenueChart() {
  const { revenueData } = useDashboardViewModel();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenus mensuels</CardTitle>
        <CardDescription>
          Vue d&apos;ensemble des revenus sur l&apos;année courante
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} €`}
              />
              <Tooltip
                formatter={(value: number) => [`${value} €`, "Revenu"]}
                labelFormatter={(label) => `Mois: ${label}`}
              />
              <Bar dataKey="revenue" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
