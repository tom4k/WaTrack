"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Layers, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";
import { formatIndianNumber } from "@/lib/formatters";

interface TariffTierCardProps {
  avgUnitsPerCycle: number;
  avgUnitsPerMonth: number;
  avgCostPerUnit: number;
}

export function TariffTierCard({
  avgUnitsPerCycle,
  avgUnitsPerMonth,
  avgCostPerUnit,
}: TariffTierCardProps) {
  const isNonTelescopic = avgUnitsPerMonth > 250;
  const unitsAboveThreshold = isNonTelescopic ? Math.round(avgUnitsPerMonth - 250) : 0;
  const cycleUnitsAboveThreshold = isNonTelescopic ? Math.round(avgUnitsPerCycle - 500) : 0;

  const tiers = [
    {
      range: "0 – 40 units/mo",
      cycleRange: "0 – 80 u/cycle",
      category: "BPL / Life Line",
      rate: "₹1.50 / u",
      telescopic: true,
      current: false,
    },
    {
      range: "41 – 100 units/mo",
      cycleRange: "81 – 200 u/cycle",
      category: "Tier 1 Telescopic",
      rate: "₹3.40 – ₹4.05 / u",
      telescopic: true,
      current: false,
    },
    {
      range: "101 – 150 units/mo",
      cycleRange: "201 – 300 u/cycle",
      category: "Tier 2 Telescopic",
      rate: "₹5.25 / u",
      telescopic: true,
      current: false,
    },
    {
      range: "151 – 200 units/mo",
      cycleRange: "301 – 400 u/cycle",
      category: "Tier 3 Telescopic",
      rate: "₹6.80 / u",
      telescopic: true,
      current: false,
    },
    {
      range: "201 – 250 units/mo",
      cycleRange: "401 – 500 u/cycle",
      category: "Tier 4 Telescopic",
      rate: "₹8.00 / u",
      telescopic: true,
      current: false,
    },
    {
      range: "> 250 units/mo",
      cycleRange: "> 500 u/cycle",
      category: "Non-Telescopic TOD",
      rate: "₹6.84 – ₹9.50 / u",
      telescopic: false,
      current: isNonTelescopic,
    },
  ];

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">KSEB LT-1 Domestic Tariff Ladder & Slab Position</CardTitle>
              <CardDescription>
                Statutory slab classification and threshold proximity under Kerala State Electricity Regulatory Commission (KSERC)
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                isNonTelescopic
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
              }`}
            >
              {isNonTelescopic ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {isNonTelescopic ? "Non-Telescopic TOD Active" : "Telescopic Slab Active"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Active Status Callout */}
        <div
          className={`p-4 rounded-2xl border ${
            isNonTelescopic
              ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/60"
              : "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Current Position:
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {formatIndianNumber(avgUnitsPerMonth, 0)} kWh / month{" "}
                <span className="text-xs font-normal text-slate-500 font-mono">
                  ({formatIndianNumber(avgUnitsPerCycle, 0)} kWh bi-monthly)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Under KSEB tariff rules, consumers who exceed <strong>250 units/month (500 units bi-monthly)</strong> forfeit telescopic benefit. All units are billed flat under the Time-of-Day (TOD) framework with peak/off-peak surcharges and rebates.
              </p>
            </div>

            {isNonTelescopic && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-amber-300/80 dark:border-amber-700/60 shrink-0 text-center sm:text-right">
                <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                  Threshold Gap
                </div>
                <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                  +{cycleUnitsAboveThreshold} <span className="text-xs font-normal">u/cycle</span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  ≈ {unitsAboveThreshold} units/month above 250u
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visual Ladder Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>KSEB LT-1 Domestic Tariff Slabs</span>
            <span className="text-[11px] text-slate-500 font-normal">Kerala State Electricity Supply Schedule</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {tiers.map((t, idx) => (
              <div
                key={t.range}
                className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between relative ${
                  t.current
                    ? "bg-indigo-500/10 border-indigo-500/50 dark:bg-indigo-950/40 dark:border-indigo-600/60 ring-2 ring-indigo-500/20"
                    : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800"
                }`}
              >
                {t.current && (
                  <span className="absolute -top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-mono shadow-sm">
                    YOU ARE HERE
                  </span>
                )}
                <div>
                  <div className="text-[10px] font-mono text-slate-400 font-semibold">Tier {idx + 1}</div>
                  <div className="font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {t.range}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{t.cycleRange}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{t.rate}</div>
                  <span className="text-[9px] text-slate-400 block font-medium mt-0.5">{t.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunity Card */}
        {isNonTelescopic && (
          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shrink-0">
              <TrendingDown className="h-4 w-4" />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="text-emerald-800 dark:text-emerald-300">Tariff Optimization Insight:</strong> Reducing consumption by ~{unitsAboveThreshold} kWh/month brings you within the Telescopic slab limit (&le;250 kWh/mo), allowing you to benefit from the lower introductory rates for the first 200 units.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
