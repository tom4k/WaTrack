"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Zap, IndianRupee, FileDown } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ConsumptionChart } from "@/components/analytics/ConsumptionChart";
import { ExpenditureChart } from "@/components/analytics/ExpenditureChart";
import { TODBreakdownChart } from "@/components/analytics/TODBreakdownChart";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatINR, formatIndianNumber, formatUnits } from "@/lib/formatters";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bills?analytics=true")
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data.analytics || null);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return (
      <AppShell>
        <div className="py-20 text-center text-slate-500 text-sm">
          Loading consumption analytics...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Electricity Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Consumption patterns, expenditure trends, and KSEB Time-of-Day (TOD) zone analysis
            </p>
          </div>

          <a
            href="/api/export/bills"
            className="inline-flex items-center justify-center h-10 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 transition-colors self-start sm:self-auto"
          >
            <FileDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export Historical Data</span>
          </a>
        </div>

        {/* Top 3 Quick Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Average Bi-Monthly Units
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                {formatIndianNumber(analytics.avgUnitsPerCycle, 0)} kWh
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ≈ {formatIndianNumber(analytics.avgUnitsPerMonth, 0)} kWh normalized per month
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Average Effective Tariff Rate
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 mt-2">
                ₹{analytics.avgCostPerUnit}{" "}
                <span className="text-sm font-normal text-slate-500">/ kWh</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Including energy, duty, surcharge & fixed charges
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total 2026 Expenditure
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                {formatINR(analytics.totalSpentThisYear)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {analytics.totalUnitsThisYear} units consumed across 2026 billing cycles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConsumptionChart
            cycleHistory={analytics.cycleHistory}
            monthlyNormalized={analytics.monthlyNormalized}
          />
          <ExpenditureChart cycleHistory={analytics.cycleHistory} />
        </div>

        {/* TOD Distribution & Yearly Comparison Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TODBreakdownChart todDistribution={analytics.todDistribution} />
          </div>

          <div className="lg:col-span-2">
            <Card className="border-slate-200/80 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Year-Over-Year Comparison</CardTitle>
                <CardDescription>
                  Comparison of electricity usage and total billing expenditure by calendar year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Year</th>
                        <th className="py-2.5 px-3 text-right">Bills Count</th>
                        <th className="py-2.5 px-3 text-right">Total Units</th>
                        <th className="py-2.5 px-3 text-right">Total Expenditure</th>
                        <th className="py-2.5 px-3 text-right">Avg Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {analytics.yearlyComparison.map((y: any) => {
                        const avgRate = y.units > 0 ? (y.expenditure / y.units).toFixed(2) : "0.00";
                        return (
                          <tr key={y.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 font-medium">
                            <td className="py-3 px-3 font-bold font-mono text-sm text-slate-900 dark:text-slate-100">
                              {y.year}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-500">
                              {y.billsCount} {y.billsCount === 1 ? "bill" : "bills"}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {formatUnits(y.units)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold">
                              {formatINR(y.expenditure)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                              ₹{avgRate} / kWh
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
