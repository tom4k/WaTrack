"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatUnits, formatIndianNumber } from "@/lib/formatters";

interface ConsumptionChartProps {
  cycleHistory: any[];
  monthlyNormalized: any[];
}

export function ConsumptionChart({ cycleHistory, monthlyNormalized }: ConsumptionChartProps) {
  const [viewMode, setViewMode] = useState<"cycles" | "monthly">("cycles");

  // Oldest to newest for charting left-to-right
  const cycleData = [...cycleHistory].reverse().map((c) => ({
    label: c.periodLabel,
    units: c.totalUnits,
    normal: c.tod?.normalUnits ?? 0,
    offPeak: c.tod?.offPeakUnits ?? 0,
    peak: c.tod?.peakUnits ?? 0,
  }));

  const monthlyData = monthlyNormalized.map((m) => ({
    label: m.monthName,
    units: m.units,
  }));

  const chartData = viewMode === "cycles" ? cycleData : monthlyData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              Total: {formatIndianNumber(data.units, 0)} kWh
            </p>
            {viewMode === "cycles" && data.normal > 0 && (
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-0.5">
                <p>Normal (6am-6pm): <span className="font-mono">{data.normal} kWh</span></p>
                <p>Off-Peak (10pm-6am): <span className="font-mono">{data.offPeak} kWh</span></p>
                <p>Peak (6pm-10pm): <span className="font-mono">{data.peak} kWh</span></p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Electricity Consumption History</CardTitle>
          <CardDescription>
            {viewMode === "cycles"
              ? "Bi-monthly KSEB spot bill cycles (~60 days)"
              : "Normalized calendar monthly consumption (split evenly across billing days)"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <Button
            variant={viewMode === "cycles" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cycles")}
            className="h-7 text-xs px-2.5"
          >
            Bi-Monthly Cycles
          </Button>
          <Button
            variant={viewMode === "monthly" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("monthly")}
            className="h-7 text-xs px-2.5"
          >
            Monthly Normalized
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="label"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} u`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="units"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                name="Consumed Units (kWh)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
