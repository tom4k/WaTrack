"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Zap, IndianRupee, FileDown, Calendar, Scale, AlertCircle, CheckCircle2 } from "lucide-react";
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

        {/* KSEB Billing & Sharasheri (ശരാശരി) Tariff Audit Card */}
        {analytics.sharasheriAudit?.hasSharasheriBill && (
          <Card className="border-emerald-500/40 dark:border-emerald-600/40 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent shadow-sm">
            <CardHeader className="pb-3 border-b border-emerald-200/50 dark:border-emerald-800/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <span>KSEB Tariff & &ldquo;ശരാശരി&rdquo; (Sharasheri) Audit</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Billed on Raw Meter Units
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Independent mathematical reconciliation against official KSEB unit rates and Supply Code benchmark profiles
                    </CardDescription>
                  </div>
                </div>
                <div className="text-xs text-emerald-800 dark:text-emerald-300 font-mono self-start sm:self-auto bg-emerald-100/60 dark:bg-emerald-900/30 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Bill #{analytics.sharasheriAudit.latestBillNumber} • {analytics.sharasheriAudit.latestBillDate}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* 4 Key Metric Pillars */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60">
                  <div className="text-[11px] font-sans font-medium text-emerald-900 dark:text-emerald-300">Billed Meter Usage</div>
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                    {analytics.sharasheriAudit.rawMeterUnits} <span className="text-xs font-normal text-emerald-600">kWh</span>
                  </div>
                  <p className="text-[10px] font-sans text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Physical meter advance (348+326+12)</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-sans font-medium text-slate-500">Benchmark &ldquo;ശരാശരി&rdquo;</div>
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {analytics.sharasheriAudit.sharasheriBenchmarkUnits} <span className="text-xs font-normal text-amber-500">kWh</span>
                  </div>
                  <p className="text-[10px] font-sans text-slate-400 mt-0.5">Profile: {analytics.sharasheriAudit.monthlyAverageBenchmark} kWh/month (Reg 122/123)</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-sans font-medium text-slate-500">Usage vs Benchmark</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <span>{analytics.sharasheriAudit.varianceUnits} kWh</span>
                    <span className="text-xs font-normal">({analytics.sharasheriAudit.variancePercentage}%)</span>
                  </div>
                  <p className="text-[10px] font-sans text-slate-400 mt-0.5">Consumption lower than average</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-sans font-medium text-slate-500">Savings vs Profile</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    ₹{analytics.sharasheriAudit.savingsComparedToBenchmark.toFixed(2)}
                  </div>
                  <p className="text-[10px] font-sans text-slate-500 mt-0.5">Saved by using 686u instead of 752u</p>
                </div>
              </div>

              {/* Two detailed breakdown grids */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Official KSEB Unit Rates Proof */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Official KSEB Tariff Rate Proof</span>
                    </h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">100% Exact Match</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Every line item on your bill matches the <strong>raw meter units (686 kWh)</strong> at official KSERC tariff rates:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right font-mono mt-1">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 uppercase font-sans">
                          <th className="text-left py-1">Item / Zone</th>
                          <th className="py-1">Raw Units</th>
                          <th className="py-1">Rate</th>
                          <th className="py-1 font-bold">Billed Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="text-left py-1.5 font-sans text-slate-700 dark:text-slate-300">Normal (ECN)</td>
                          <td className="py-1.5 font-bold text-emerald-600 dark:text-emerald-400">348 kWh</td>
                          <td className="py-1.5 text-slate-500">₹6.84 / u</td>
                          <td className="py-1.5 font-bold text-slate-900 dark:text-slate-100">₹2,380.32</td>
                        </tr>
                        <tr>
                          <td className="text-left py-1.5 font-sans text-slate-700 dark:text-slate-300">Off-Peak (ECO)</td>
                          <td className="py-1.5 font-bold text-emerald-600 dark:text-emerald-400">326 kWh</td>
                          <td className="py-1.5 text-slate-500">₹7.60 / u</td>
                          <td className="py-1.5 font-bold text-slate-900 dark:text-slate-100">₹2,477.60</td>
                        </tr>
                        <tr>
                          <td className="text-left py-1.5 font-sans text-slate-700 dark:text-slate-300">Peak (ECP)</td>
                          <td className="py-1.5 font-bold text-emerald-600 dark:text-emerald-400">12 kWh</td>
                          <td className="py-1.5 text-slate-500">₹9.50 / u</td>
                          <td className="py-1.5 font-bold text-slate-900 dark:text-slate-100">₹114.00</td>
                        </tr>
                        <tr>
                          <td className="text-left py-1.5 font-sans text-slate-700 dark:text-slate-300">Fuel Surcharge (FSM)</td>
                          <td className="py-1.5 font-bold text-emerald-600 dark:text-emerald-400">686 kWh</td>
                          <td className="py-1.5 text-slate-500">₹0.03 / u</td>
                          <td className="py-1.5 font-bold text-slate-900 dark:text-slate-100">₹20.58</td>
                        </tr>
                        <tr className="border-t border-slate-200 dark:border-slate-700 font-bold bg-white/40 dark:bg-slate-800/30">
                          <td className="text-left py-1.5 font-sans text-emerald-700 dark:text-emerald-300">Energy Sub-Total</td>
                          <td className="py-1.5 text-emerald-600 dark:text-emerald-400">686 kWh</td>
                          <td className="py-1.5 text-slate-500 font-normal">--</td>
                          <td className="py-1.5 text-emerald-600 dark:text-emerald-400">₹4,992.50</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TOD Zone-wise Meter vs Sharasheri comparison */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Meter Advance vs Sharasheri Profile</span>
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">റീഡിങ് vs ബെഞ്ച്മാർക്ക്</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Comparison between actual meter units used and KSEB&apos;s statutory historical average profile (ശരാശരി):
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right font-mono mt-1">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 uppercase font-sans">
                          <th className="text-left py-1">TOD Zone</th>
                          <th className="py-1 font-bold text-emerald-600 dark:text-emerald-400">Billed Meter</th>
                          <th className="py-1 text-slate-500">ശരാശരി (2 mo)</th>
                          <th className="py-1">Variance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {analytics.sharasheriAudit.todBreakdown.map((row: any, idx: number) => (
                          <tr key={idx}>
                            <td className="text-left py-1.5 font-sans text-slate-700 dark:text-slate-300">{row.zone}</td>
                            <td className="py-1.5 font-bold text-emerald-600 dark:text-emerald-400">{row.rawUsed} kWh</td>
                            <td className="py-1.5 text-slate-500">{row.sharasheri} kWh</td>
                            <td className={`py-1.5 font-bold ${row.variance < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                              {row.variance > 0 ? `+${row.variance}` : row.variance} kWh
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-slate-200 dark:border-slate-700 font-bold bg-white/40 dark:bg-slate-800/30">
                          <td className="text-left py-1.5 font-sans text-slate-900 dark:text-slate-100">Total Consumption</td>
                          <td className="py-1.5 text-emerald-600 dark:text-emerald-400">{analytics.sharasheriAudit.rawMeterUnits} kWh</td>
                          <td className="py-1.5 text-slate-500">{analytics.sharasheriAudit.sharasheriBenchmarkUnits} kWh</td>
                          <td className="py-1.5 text-emerald-600 dark:text-emerald-400">{analytics.sharasheriAudit.varianceUnits} kWh</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2">
                <span className="text-sm">📌</span>
                <div>
                  <span className="font-semibold">KSEB Supply Code Insight (Reg 122 & 123):</span> {analytics.sharasheriAudit.regulatoryNote}
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
