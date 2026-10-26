"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/formatters";
import { CostComponentBreakdown } from "@/lib/analytics";
import { Zap, Landmark, ShieldCheck, Flame, Gauge } from "lucide-react";

interface CostAnatomyCardProps {
  costBreakdown: CostComponentBreakdown;
  totalSpent: number;
}

export function CostAnatomyCard({ costBreakdown, totalSpent }: CostAnatomyCardProps) {
  if (!costBreakdown) return null;

  const components = [
    {
      name: "Energy Charges",
      malayalam: "വൈദ്യുതി നിരക്ക്",
      amount: costBreakdown.energyCharges,
      percent: costBreakdown.energyPercent,
      color: "#10b981", // emerald
      bgClass: "bg-emerald-500",
      lightBg: "bg-emerald-50/70 dark:bg-emerald-950/30",
      borderClass: "border-emerald-200/80 dark:border-emerald-900/50",
      textClass: "text-emerald-700 dark:text-emerald-300",
      icon: Zap,
      description: "Actual power consumed across TOD zones at KSERC tariff rates",
    },
    {
      name: "Fixed Charges",
      malayalam: "സ്ഥിര നിരക്ക്",
      amount: costBreakdown.fixedCharges,
      percent: costBreakdown.fixedPercent,
      color: "#f59e0b", // amber
      bgClass: "bg-amber-500",
      lightBg: "bg-amber-50/70 dark:bg-amber-950/30",
      borderClass: "border-amber-200/80 dark:border-amber-900/50",
      textClass: "text-amber-700 dark:text-amber-300",
      icon: ShieldCheck,
      description: "Contracted connected load capacity fee (10 kW 3-phase)",
    },
    {
      name: "Electricity Duty (10%)",
      malayalam: "വൈദ്യുതി ഡ്യൂട്ടി",
      amount: costBreakdown.dutyCharges,
      percent: costBreakdown.dutyPercent,
      color: "#3b82f6", // blue
      bgClass: "bg-blue-500",
      lightBg: "bg-blue-50/70 dark:bg-blue-950/30",
      borderClass: "border-blue-200/80 dark:border-blue-900/50",
      textClass: "text-blue-700 dark:text-blue-300",
      icon: Landmark,
      description: "Statutory 10% Kerala State tax levied on energy + fixed charge",
    },
    {
      name: "Fuel Surcharge (FSM)",
      malayalam: "ഇന്ധന സർചാർജ്",
      amount: costBreakdown.fuelSurcharge,
      percent: costBreakdown.fuelSurchargePercent,
      color: "#8b5cf6", // purple
      bgClass: "bg-purple-500",
      lightBg: "bg-purple-50/70 dark:bg-purple-950/30",
      borderClass: "border-purple-200/80 dark:border-purple-900/50",
      textClass: "text-purple-700 dark:text-purple-300",
      icon: Flame,
      description: "Fuel adjustment factor (e.g. ₹0.03/kWh) approved by KSERC",
    },
    {
      name: "Meter Rent & Others",
      malayalam: "മീറ്റർ വാടക",
      amount: costBreakdown.meterRent,
      percent: costBreakdown.meterRentPercent,
      color: "#64748b", // slate
      bgClass: "bg-slate-500",
      lightBg: "bg-slate-50/70 dark:bg-slate-800/40",
      borderClass: "border-slate-200/80 dark:border-slate-700/50",
      textClass: "text-slate-700 dark:text-slate-300",
      icon: Gauge,
      description: "Bi-monthly tri-vector electronic TOD meter maintenance fee",
    },
  ];

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Bill Cost Anatomy & Component Breakdown</CardTitle>
            <CardDescription>
              Cumulative distribution of your electricity bill expenditure across core power costs, statutory taxes, and capacity charges
            </CardDescription>
          </div>
          <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 self-start sm:self-auto">
            Total Tracked: <span className="font-bold text-slate-900 dark:text-slate-100">{formatINR(totalSpent)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Visual Multi-Segmented Percentage Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 p-0.5 gap-0.5">
            {components.map((c) => {
              if (c.percent <= 0) return null;
              return (
                <div
                  key={c.name}
                  className={`${c.bgClass} h-full transition-all duration-500 rounded-sm hover:opacity-90 cursor-pointer`}
                  style={{ width: `${Math.max(1.5, c.percent)}%` }}
                  title={`${c.name}: ${formatINR(c.amount)} (${c.percent}%)`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
            {components.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{c.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Component Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {components.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.name}
                className={`p-3.5 rounded-2xl border ${c.lightBg} ${c.borderClass} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {c.name.split(" ")[0]}
                    </span>
                    <div
                      className="h-6 w-6 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: c.color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-black font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-2">
                    {formatINR(c.amount)}
                  </div>
                  <div className="text-[11px] font-mono font-semibold mt-0.5" style={{ color: c.color }}>
                    {c.percent}% of total
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/60 text-[10px] text-slate-500 leading-snug">
                  <span className="font-medium text-slate-700 dark:text-slate-300 block">{c.malayalam}</span>
                  {c.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Regulatory Note */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
          <span className="text-base select-none">📌</span>
          <div className="leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">Statutory Tax & Surcharge Insight:</strong> Electricity Duty (10%) is established by the Kerala Electricity Duty Act 1963 as a mandatory state levy. Fuel Surcharge (FSM) is determined quarterly by the Kerala State Electricity Regulatory Commission (KSERC) to account for external fuel supply price shifts.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
