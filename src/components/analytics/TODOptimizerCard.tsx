"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatINR, formatIndianNumber } from "@/lib/formatters";
import { Clock, Zap, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

interface TODOptimizerCardProps {
  todDistribution: any[];
  avgUnitsPerCycle: number;
}

export function TODOptimizerCard({ todDistribution, avgUnitsPerCycle }: TODOptimizerCardProps) {
  const [shiftPercentage, setShiftPercentage] = useState<number>(25);

  const normalZone = todDistribution.find((z) => z.name.toLowerCase().includes("normal"));
  const offPeakZone = todDistribution.find((z) => z.name.toLowerCase().includes("off-peak"));
  const peakZone = todDistribution.find((z) => z.name.toLowerCase().includes("peak"));

  const peakUnits = peakZone ? peakZone.units : Math.round(avgUnitsPerCycle * 0.05);

  // KSEB Tariff rates: Peak is ₹9.50, Off-Peak is ₹7.60, Normal is ₹6.84
  const PEAK_RATE = 9.50;
  const OFF_PEAK_RATE = 7.60;
  const RATE_DIFF = PEAK_RATE - OFF_PEAK_RATE; // ₹1.90 savings per unit shifted from Peak to Off-Peak

  const unitsShifted = Math.round((peakUnits * shiftPercentage) / 100);
  const cycleSavings = Math.round(unitsShifted * RATE_DIFF);
  const annualSavings = cycleSavings * 6; // 6 bi-monthly cycles in a year

  const tips = [
    {
      appliance: "Electric Water Heater / Geysers",
      timing: "Heat before 6:00 PM or after 10:00 PM",
      impact: "High Power (2–3 kW)",
    },
    {
      appliance: "Washing Machine & Dryers",
      timing: "Schedule wash cycle after 10:00 PM",
      impact: "Medium Power (1–2 kW)",
    },
    {
      appliance: "EV Scooter / Car Charging",
      timing: "Plug in during 10:00 PM – 06:00 AM off-peak window",
      impact: "High Energy (5–30 kWh)",
    },
    {
      appliance: "Water Pressure Pump / Well Motor",
      timing: "Fill overhead tanks between 08:00 AM – 04:00 PM",
      impact: "Medium Power (0.75–1.5 kW)",
    },
  ];

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Time-Of-Day (TOD) Optimization & Load Shifting</CardTitle>
              <CardDescription>
                Simulate potential electricity bill savings by moving high-consumption home loads from Peak (6 PM – 10 PM) to Off-Peak (10 PM – 6 AM)
              </CardDescription>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto border border-slate-200 dark:border-slate-700">
            KSEB TOD Rule: +20% Peak Surcharge
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Interactive Simulator Section */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white shadow-md border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <Sparkles className="h-4 w-4" />
                <span>Interactive Load Shifting Simulator</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span>Shift Peak Load to Off-Peak Hours (10 PM – 6 AM):</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">{shiftPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={shiftPercentage}
                  onChange={(e) => setShiftPercentage(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>Shifting:</span>
                <span className="font-bold text-white font-mono">{unitsShifted} kWh / cycle</span>
                <span className="text-slate-400">from Peak (₹9.50/u) to Off-Peak (₹7.60/u)</span>
              </div>
            </div>

            {/* Savings Output Tiles */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
                  Per Cycle Savings
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  {formatINR(cycleSavings)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Bi-monthly reduction</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
                  Annual Savings
                </div>
                <div className="text-2xl font-black font-mono text-amber-300 mt-1">
                  {formatINR(annualSavings)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">6 cycles per year</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Appliance Shifting Guide */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recommended Appliance Optimization Strategy
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tips.map((t) => (
              <div
                key={t.appliance}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{t.appliance}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {t.timing}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] font-mono text-slate-400">
                  {t.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
