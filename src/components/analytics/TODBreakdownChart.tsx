"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatUnits, formatIndianNumber } from "@/lib/formatters";

interface TODBreakdownChartProps {
  todDistribution: any[];
}

export function TODBreakdownChart({ todDistribution }: TODBreakdownChartProps) {
  if (!todDistribution || todDistribution.length === 0) {
    return (
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Time of Day (TOD) Consumption</CardTitle>
          <CardDescription>Normal vs Off-Peak vs Peak zone distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 py-10 text-center">
            No TOD readings logged yet. Add meter readings with Normal, Peak, and Off-Peak breakdown to view distribution.
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200">{data.name}</p>
          <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
            {formatIndianNumber(data.units, 0)} kWh ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader>
        <CardTitle>Time-Of-Day (TOD) Distribution</CardTitle>
        <CardDescription>
          Consumption split across KSEB Tariff Zones (Normal, Peak & Off-Peak)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={todDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="units"
                >
                  {todDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {todDistribution.map((zone) => (
              <div key={zone.name} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {zone.name}
                    </span>
                  </div>
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                    {zone.percentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{formatIndianNumber(zone.units, 0)} kWh</span>
                  <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${zone.percentage}%`, backgroundColor: zone.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
