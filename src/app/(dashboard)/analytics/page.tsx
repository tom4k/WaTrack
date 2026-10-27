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
  ShieldCheck,
  Receipt,
  PieChart,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ConsumptionChart } from "@/components/analytics/ConsumptionChart";
import { ExpenditureChart } from "@/components/analytics/ExpenditureChart";
import { TODBreakdownChart } from "@/components/analytics/TODBreakdownChart";
import { CostAnatomyCard } from "@/components/analytics/CostAnatomyCard";
import { TariffTierCard } from "@/components/analytics/TariffTierCard";
import { SharasheriBenchmarkChart } from "@/components/analytics/SharasheriBenchmarkChart";
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
              Deep consumption intelligence, cost component anatomy, and Time-of-Day (TOD) zone analysis
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
                {formatIndianNumber(analytics.totalUnitsThisYear, 0)} units in 2026
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Group 1: Consumption & Expenditure Patterns */}
        <div className="space-y-6">
          <div className="border-b border-slate-200/70 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Consumption & Spending Trends</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical energy consumption, calendar normalization, and Time-Of-Day meter zone breakdown
            </p>
          </div>

          {/* Hero Chart 1: Full-Width Electricity Consumption & Bill History */}
          <ConsumptionChart
            cycleHistory={analytics.cycleHistory}
            monthlyNormalized={analytics.monthlyNormalized}
          />

          {/* Hero Chart 2: Full-Width Time-of-Day (TOD) Zone Consumption Analysis */}
          <TODBreakdownChart
            cycleHistory={analytics.cycleHistory}
            todDistribution={analytics.todDistribution}
          />

          {/* Chart 3: Expenditure & Cost Trends */}
          <ExpenditureChart cycleHistory={analytics.cycleHistory} />
        </div>

        {/* Group 2: Tariff Structure & Cost Anatomy */}
        <div className="space-y-6">
          <div className="border-b border-slate-200/70 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Tariff Structure & Cost Anatomy</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory charges distribution, Sharasheri (ശരാശരി) benchmark audit, and official KSEB LT-1 Domestic slab classification
            </p>
          </div>

          {/* Sharasheri (ശരാശരി) Benchmark & Average History Graph */}
          <SharasheriBenchmarkChart cycleHistory={analytics.cycleHistory} />

          {/* Cost Anatomy Breakdown */}
          {analytics.costBreakdown && (
            <CostAnatomyCard
              costBreakdown={analytics.costBreakdown}
              totalSpent={analytics.totalSpentAllTime}
            />
          )}

          {/* KSEB Tariff Ladder & Position */}
          <TariffTierCard
            avgUnitsPerCycle={analytics.avgUnitsPerCycle}
            avgUnitsPerMonth={analytics.avgUnitsPerMonth}
            avgCostPerUnit={analytics.avgCostPerUnit}
          />
        </div>

        {/* Group 3: Historical Records & Ledgers */}
        <div className="space-y-6">
          <div className="border-b border-slate-200/70 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Billing History & Ledgers</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed cycle-by-cycle reconciliation ledger and year-over-year annual comparative records
            </p>
          </div>

          <CycleLedgerTable
            cycleHistory={analytics.cycleHistory}
            yearlyComparison={analytics.yearlyComparison}
          />
        </div>
      </div>
    </AppShell>
  );
}
