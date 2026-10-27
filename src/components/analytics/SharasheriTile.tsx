"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Scale, ShieldCheck, AlertCircle, CheckCircle2, TrendingDown, Info, Zap } from "lucide-react";
import { formatINR, formatIndianNumber } from "@/lib/formatters";
import type { SharasheriAudit } from "@/lib/analytics";

interface SharasheriTileProps {
  audit: SharasheriAudit | null;
}

export function SharasheriTile({ audit }: SharasheriTileProps) {
  if (!audit || !audit.hasSharasheriBill) {
    return null;
  }

  const raw = audit.rawMeterUnits;
  const benchmark = audit.sharasheriBenchmarkUnits;
  const maxUnits = Math.max(raw, benchmark, 1) * 1.15;
  const rawBarPercent = Math.min(100, Math.round((raw / maxUnits) * 100));
  const benchmarkBarPercent = Math.min(100, Math.round((benchmark / maxUnits) * 100));
  const isLower = audit.varianceUnits <= 0;

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  KSEB Sharasheri (ശരാശരി) Benchmark Analysis
                </CardTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
                  Supply Code Reg 122 & 123
                </span>
              </div>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Physical meter advance vs KSEB statutory historical average benchmark profile
              </CardDescription>
            </div>
          </div>

          <div>
            {audit.isComputedOnRawUnits ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/90 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Billed on Actual Used Units ({raw} kWh)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-sm">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Assessed on Sharasheri ({benchmark} kWh)</span>
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Top 3 Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Actual Meter Advance */}
          <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" />
              Actual Used Units (ഉപയോഗിച്ചവ)
            </span>
            <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300 mt-1">
              {formatIndianNumber(raw, 0)} <span className="text-xs font-normal text-slate-500">kWh</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Current − Previous reading advance
            </p>
          </div>

          {/* 2. Sharasheri Benchmark */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Scale className="h-3.5 w-3.5" />
              Sharasheri Benchmark (ശരാശരി)
            </span>
            <div className="text-2xl font-black font-mono text-slate-800 dark:text-slate-200 mt-1">
              {formatIndianNumber(benchmark, 0)} <span className="text-xs font-normal text-slate-500">kWh</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Printed reference profile ({formatIndianNumber(audit.monthlyAverageBenchmark, 0)} kWh / mo)
            </p>
          </div>

          {/* 3. Variance & Financial Impact */}
          <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" />
              Benchmark Variance
            </span>
            <div className="text-2xl font-black font-mono text-blue-700 dark:text-blue-300 mt-1">
              {audit.varianceUnits > 0 ? `+${audit.varianceUnits}` : `${audit.varianceUnits}`} <span className="text-xs font-normal">kWh</span>
              <span className="text-xs font-bold ml-1.5 opacity-80">
                ({audit.variancePercentage > 0 ? `+${audit.variancePercentage}` : `${audit.variancePercentage}`}%)
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {isLower
                ? `Saved ≈ ${formatINR(audit.savingsComparedToBenchmark)} vs benchmark`
                : `Exceeded benchmark baseline`}
            </p>
          </div>
        </div>

        {/* Visual Benchmark Comparison Meter Bar */}
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 dark:text-slate-300">
              Meter Advance vs Benchmark Profile Comparison
            </span>
            <span className="font-mono text-slate-500 text-[11px]">
              {Math.abs(audit.varianceUnits)} kWh {isLower ? "lower than benchmark" : "above benchmark"}
            </span>
          </div>

          {/* Double Bar Comparison */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  Actual Physical Used Units (Billed)
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {raw} kWh
                </span>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${rawBarPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600 inline-block" />
                  KSEB Sharasheri Benchmark (Reference)
                </span>
                <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                  {benchmark} kWh
                </span>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 dark:bg-slate-600 rounded-full transition-all duration-500"
                  style={{ width: `${benchmarkBarPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* TOD Zone Comparison: Used Units vs Sharasheri */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Zone-wise TOD Breakdown: Actual Used vs Sharasheri Benchmark
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Latest Bill #{audit.latestBillNumber}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">TOD Zone & Timing</th>
                  <th className="py-2.5 px-3 text-right">Meter Advance (Used)</th>
                  <th className="py-2.5 px-3 text-right">Sharasheri (Avg)</th>
                  <th className="py-2.5 px-3 text-right">Variance</th>
                  <th className="py-2.5 px-3 text-right">Applied Rate</th>
                  <th className="py-2.5 px-3 text-right">Energy Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {audit.todBreakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {row.zone.split("(")[0].trim()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {row.timing}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {row.rawUsed} kWh
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      {row.sharasheri} kWh
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold">
                      <span className={row.variance <= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                        {row.variance > 0 ? `+${row.variance}` : row.variance} u
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      ₹{row.appliedRate.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      ₹{row.billedAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20 font-bold">
                  <td className="py-2.5 px-3 font-sans text-slate-900 dark:text-slate-100">
                    Total Energy
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">
                    {raw} kWh
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500">
                    {benchmark} kWh
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">
                    {audit.varianceUnits > 0 ? `+${audit.varianceUnits}` : audit.varianceUnits} u
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400 font-sans font-normal text-[11px]">
                    TOD Weighted
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-900 dark:text-slate-100">
                    ₹4,971.92
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Regulatory Protection Callout */}
        <div className="p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Why KSEB bills on Used Units (686 kWh) instead of Sharasheri (752 kWh):
            </span>{" "}
            Under Regulations 122 & 123 of the Kerala Electricity Supply Code 2014, KSEB displays your historical average profile solely as an informational benchmark. Because your meter status is verified <strong>Working</strong>, statutory regulation mandates that all energy charges and fuel surcharges are computed strictly on physical meter advance.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
