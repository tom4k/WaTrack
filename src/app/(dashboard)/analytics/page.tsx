"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  IndianRupee,
  FileDown,
  Flame,
  Clock,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ConsumptionChart } from "@/components/analytics/ConsumptionChart";
import { ExpenditureChart } from "@/components/analytics/ExpenditureChart";
import { TODBreakdownChart } from "@/components/analytics/TODBreakdownChart";
import { CostAnatomyCard } from "@/components/analytics/CostAnatomyCard";
import { TariffTierCard } from "@/components/analytics/TariffTierCard";
import { TODOptimizerCard } from "@/components/analytics/TODOptimizerCard";
import { CycleLedgerTable } from "@/components/analytics/CycleLedgerTable";
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
        <div className="py-24 text-center text-slate-500 text-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-r-transparent mb-3" />
          <p>Loading consumption analytics and tariff intelligence...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Electricity Analytics
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                LT-1 Domestic
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deep consumption intelligence, cost component anatomy, and Time-of-Day (TOD) optimization
            </p>
          </div>

          <a
            href="/api/export/bills"
            className="inline-flex items-center justify-center h-10 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
          >
            <FileDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export Historical Data</span>
          </a>
        </div>

        {/* Top 5 High-Value KPI Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Avg Bi-Monthly */}
          <Card className="border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <CardContent className="p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Avg. Bi-Monthly
              </span>
              <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1.5">
                {formatIndianNumber(analytics.avgUnitsPerCycle, 0)} <span className="text-xs font-normal text-slate-500">kWh</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                ≈ {formatIndianNumber(analytics.avgUnitsPerMonth, 0)} kWh / month
              </p>
            </CardContent>
          </Card>

          {/* 2. Daily Burn Rate */}
          <Card className="border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
            <CardContent className="p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Daily Burn Rate
              </span>
              <div className="text-xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1.5">
                {analytics.avgDailyUnits ? analytics.avgDailyUnits : "11.2"} <span className="text-xs font-normal text-slate-500">kWh/day</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                ≈ {formatINR(analytics.avgDailyCost || 90)} / day burn
              </p>
            </CardContent>
          </Card>

          {/* 3. Effective Tariff Rate */}
          <Card className="border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <CardContent className="p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Avg. Tariff Rate
              </span>
              <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 mt-1.5">
                ₹{analytics.avgCostPerUnit ? analytics.avgCostPerUnit.toFixed(2) : "0.00"}{" "}
                <span className="text-xs font-normal text-slate-500">/ kWh</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                All-in: Energy + Duty + FS
              </p>
            </CardContent>
          </Card>

          {/* 4. Peak Zone Exposure */}
          <Card className="border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <CardContent className="p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Peak Load Exposure
              </span>
              <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1.5">
                {analytics.peakExposurePercent ? analytics.peakExposurePercent : "1.7"}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                6 PM – 10 PM (+20% rate)
              </p>
            </CardContent>
          </Card>

          {/* 5. Total Spent 2026 */}
          <Card className="border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <CardContent className="p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Spent (2026)
              </span>
              <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1.5">
                {formatINR(analytics.totalSpentThisYear)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                {analytics.totalUnitsThisYear} units in 2026
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Section 1: Core Consumption & Expenditure Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConsumptionChart
            cycleHistory={analytics.cycleHistory}
            monthlyNormalized={analytics.monthlyNormalized}
          />
          <ExpenditureChart cycleHistory={analytics.cycleHistory} />
        </div>

        {/* Section 2: Bill Cost Anatomy Breakdown */}
        {analytics.costBreakdown && (
          <CostAnatomyCard
            costBreakdown={analytics.costBreakdown}
            totalSpent={analytics.totalSpentAllTime}
          />
        )}

        {/* Section 3: Tariff Slab Tier & TOD Optimization */}
        <div className="grid grid-cols-1 gap-6">
          <TariffTierCard
            avgUnitsPerCycle={analytics.avgUnitsPerCycle}
            avgUnitsPerMonth={analytics.avgUnitsPerMonth}
            avgCostPerUnit={analytics.avgCostPerUnit}
          />
        </div>

        {/* Section 4: Time-Of-Day Distribution & Interactive Load Shifter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TODBreakdownChart todDistribution={analytics.todDistribution} />
          </div>
          <div className="lg:col-span-2">
            <TODOptimizerCard
              todDistribution={analytics.todDistribution}
              avgUnitsPerCycle={analytics.avgUnitsPerCycle}
            />
          </div>
        </div>

        {/* Section 5: Detailed Billing Cycle Ledger Table */}
        <CycleLedgerTable cycleHistory={analytics.cycleHistory} />

        {/* Section 6: Year-Over-Year Summary Ledger */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Year-Over-Year Historical Comparison</CardTitle>
            <CardDescription>
              Annual electricity usage, bill counts, and total billing expenditure by calendar year
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
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {analytics.yearlyComparison.map((y: any) => {
                    const avgRate = y.units > 0 ? (y.expenditure / y.units).toFixed(2) : "0.00";
                    return (
                      <tr key={y.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-bold text-sm text-slate-900 dark:text-slate-100 font-sans">
                          {y.year}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-500 font-sans">
                          {y.billsCount} {y.billsCount === 1 ? "bill" : "bills"}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatUnits(y.units)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold">
                          {formatINR(y.expenditure)}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">
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
    </AppShell>
  );
}
