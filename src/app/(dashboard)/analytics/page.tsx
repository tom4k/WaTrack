"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Zap, IndianRupee, FileDown, Calendar, Scale, AlertCircle } from "lucide-react";
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

        {/* KSEB Sharasheri (ശരാശരി) Billing Audit Card */}
        {analytics.sharasheriAudit?.hasSharasheriBill && (
          <Card className="border-amber-400/40 dark:border-amber-600/40 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent shadow-sm">
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <span>KSEB &ldquo;ശരാശരി&rdquo; (Sharasheri) Assessment Audit</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Reg 125 & 126
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Audit analysis of average-assessed billing versus physical meter readings and historical 3-cycle benchmarks
                    </CardDescription>
                  </div>
                </div>
                <div className="text-xs text-amber-800 dark:text-amber-300 font-mono self-start sm:self-auto bg-amber-100/60 dark:bg-amber-900/30 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                  Cycle: {analytics.sharasheriAudit.activeBillDate}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* 4 Key Metric Pillars */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-sans font-medium text-slate-500">Physical Meter (ഉപഭോഗം)</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {analytics.sharasheriAudit.actualMeterUnits} <span className="text-xs font-normal text-slate-500">kWh</span>
                  </div>
                  <p className="text-[10px] font-sans text-slate-400 mt-0.5">Sum of curr - prev readings</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60">
                  <div className="text-[11px] font-sans font-medium text-amber-800 dark:text-amber-300">Billed &ldquo;ശരാശരി&rdquo;</div>
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {analytics.sharasheriAudit.billedSharasheriUnits} <span className="text-xs font-normal text-amber-500">kWh</span>
                  </div>
                  <p className="text-[10px] font-sans text-amber-700/80 dark:text-amber-400/80 mt-0.5">Assessed billed consumption</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-sans font-medium text-slate-500">KSEB 3-Cycle Benchmark</div>
                  <div className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-1">
                    {analytics.sharasheriAudit.threeCycleHistoricalAverage} <span className="text-xs font-normal text-slate-500">kWh</span>
                  </div>
                  <p className="text-[10px] font-sans text-slate-400 mt-0.5">Avg of past 3 billing cycles</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-sans font-medium text-slate-500">Variance / Impact</div>
                  <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <span>+{analytics.sharasheriAudit.varianceUnits} kWh</span>
                    <span className="text-xs font-normal">({analytics.sharasheriAudit.variancePercent > 0 ? `+${analytics.sharasheriAudit.variancePercent}` : analytics.sharasheriAudit.variancePercent}%)</span>
                  </div>
                  <p className="text-[10px] font-sans text-slate-500 mt-0.5">Est. Differential: ₹{analytics.sharasheriAudit.estimatedExcessCost.toFixed(2)}</p>
                </div>
              </div>

              {/* Two detailed breakdown grids */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Historical 3-cycle computation table */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Historical 3-Cycle Calculation</span>
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">Kerala Supply Code Reg 125</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    When KSEB applies <em>&ldquo;ശരാശരി&rdquo;</em> (average billing), the benchmark is derived from the average of the <strong>preceding 3 consecutive regular billing cycles</strong>:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right font-mono mt-1">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 uppercase font-sans">
                          <th className="text-left py-1">Billing Cycle</th>
                          <th className="py-1">Bill Date</th>
                          <th className="py-1">Consumed</th>
                          <th className="py-1">Bill Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {analytics.sharasheriAudit.historicalCycles.map((c: any, idx: number) => (
                          <tr key={idx} className="hover:bg-white/60 dark:hover:bg-slate-800/40">
                            <td className="text-left py-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">{c.cycleName}</td>
                            <td className="py-1.5 text-slate-500">{c.billDate}</td>
                            <td className="py-1.5 font-bold text-slate-900 dark:text-slate-100">{c.units} kWh</td>
                            <td className="py-1.5 text-slate-600 dark:text-slate-300">₹{c.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-slate-200 dark:border-slate-700 font-bold bg-white/40 dark:bg-slate-800/30">
                          <td colSpan={2} className="text-left py-1.5 font-sans text-sky-700 dark:text-sky-300">
                            3-Cycle Benchmark Average:
                          </td>
                          <td className="py-1.5 text-sky-600 dark:text-sky-400">
                            {analytics.sharasheriAudit.threeCycleHistoricalAverage} kWh
                          </td>
                          <td className="py-1.5 text-slate-500 font-normal text-[11px] font-sans">
                            {analytics.sharasheriAudit.threeCycleVarianceUnits > 0
                              ? `+${analytics.sharasheriAudit.threeCycleVarianceUnits} kWh diff`
                              : "Matched"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TOD Zone-wise Sharasheri comparison */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Time-Of-Day (TOD) Assessment Breakdown</span>
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">റീഡിങ് vs ശരാശരി</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Comparison between physical meter advance and billed <em>&ldquo;ശരാശരി&rdquo;</em> across all 3 Time-Of-Day tariff slabs:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right font-mono mt-1">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 uppercase font-sans">
                          <th className="text-left py-1">TOD Zone</th>
                          <th className="py-1">Meter Used</th>
                          <th className="py-1 text-amber-600 dark:text-amber-400 font-bold">ശരാശരി</th>
                          <th className="py-1">Variance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="text-left py-1.5 font-sans text-slate-700 dark:text-slate-300">Normal (06:00–18:00)</td>
                          <td className="py-1.5">{analytics.sharasheriAudit.todDiscrepancy.normal.raw} kWh</td>
                          <td className="py-1.5 font-bold text-amber-600 dark:text-amber-400">{analytics.sharasheriAudit.todDiscrepancy.normal.sharasheri} kWh</td>
                          <td className={`py-1.5 font-bold ${analytics.sharasheriAudit.todDiscrepancy.normal.diff > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                            {analytics.sharasheriAudit.todDiscrepancy.normal.diff > 0 ? `+${analytics.sharasheriAudit.todDiscrepancy.normal.diff}` : analytics.sharasheriAudit.todDiscrepancy.normal.diff} kWh
                          </td>
                        </tr>
                        <tr>
                          <td className="text-left py-1.5 font-sans text-slate-700 dark:text-slate-300">Off-Peak (22:00–06:00)</td>
                          <td className="py-1.5">{analytics.sharasheriAudit.todDiscrepancy.offPeak.raw} kWh</td>
                          <td className="py-1.5 font-bold text-amber-600 dark:text-amber-400">{analytics.sharasheriAudit.todDiscrepancy.offPeak.sharasheri} kWh</td>
                          <td className={`py-1.5 font-bold ${analytics.sharasheriAudit.todDiscrepancy.offPeak.diff > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                            {analytics.sharasheriAudit.todDiscrepancy.offPeak.diff > 0 ? `+${analytics.sharasheriAudit.todDiscrepancy.offPeak.diff}` : analytics.sharasheriAudit.todDiscrepancy.offPeak.diff} kWh
                          </td>
                        </tr>
                        <tr>
                          <td className="text-left py-1.5 font-sans text-slate-700 dark:text-slate-300">Peak (18:00–22:00)</td>
                          <td className="py-1.5">{analytics.sharasheriAudit.todDiscrepancy.peak.raw} kWh</td>
                          <td className="py-1.5 font-bold text-amber-600 dark:text-amber-400">{analytics.sharasheriAudit.todDiscrepancy.peak.sharasheri} kWh</td>
                          <td className={`py-1.5 font-bold ${analytics.sharasheriAudit.todDiscrepancy.peak.diff > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                            {analytics.sharasheriAudit.todDiscrepancy.peak.diff > 0 ? `+${analytics.sharasheriAudit.todDiscrepancy.peak.diff}` : analytics.sharasheriAudit.todDiscrepancy.peak.diff} kWh
                          </td>
                        </tr>
                        <tr className="border-t border-slate-200 dark:border-slate-700 font-bold bg-white/40 dark:bg-slate-800/30">
                          <td className="text-left py-1.5 font-sans text-slate-900 dark:text-slate-100">Total Billed</td>
                          <td className="py-1.5 text-slate-900 dark:text-slate-100">{analytics.sharasheriAudit.actualMeterUnits} kWh</td>
                          <td className="py-1.5 text-amber-600 dark:text-amber-400">{analytics.sharasheriAudit.billedSharasheriUnits} kWh</td>
                          <td className="py-1.5 text-amber-700 dark:text-amber-300">+{analytics.sharasheriAudit.varianceUnits} kWh</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <span className="text-sm">📌</span>
                <div>
                  <span className="font-semibold">KSEB Regulatory Compliance Note:</span> {analytics.sharasheriAudit.regulatoryNote}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
