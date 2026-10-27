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
  ReferenceLine,
  Line,
  ComposedChart,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, TrendingDown, TrendingUp, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { formatIndianNumber } from "@/lib/formatters";

interface SharasheriBenchmarkChartProps {
  cycleHistory?: any[];
}

export function SharasheriBenchmarkChart({
  cycleHistory = [],
}: SharasheriBenchmarkChartProps) {
  const [viewMode, setViewMode] = useState<"comparison" | "trend" | "variance">("comparison");

  if (!cycleHistory || cycleHistory.length === 0) {
    return (
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader>
          <CardTitle>KSEB Sharasheri (ശരാശരി) Benchmark History</CardTitle>
          <CardDescription>
            Historical comparison of actual meter consumption vs KSEB statutory average benchmark profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 py-10 text-center">
            No billing history logged yet. Log your KSEB bills to view benchmark trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Reverse so oldest is on the left, newest on the right
  const chartData = [...cycleHistory].reverse().map((c) => {
    const used = Math.round(c.totalUnits || 0);
    const benchmark = Math.round(c.sharasheriUnits || used);
    const variance = used - benchmark;
    const variancePct = benchmark > 0 ? Math.round((variance / benchmark) * 1000) / 10 : 0;

    return {
      id: c.id,
      billNumber: c.billNumber,
      label: c.periodLabel,
      cycleLabel: c.cycleLabel,
      usedUnits: used,
      sharasheriUnits: benchmark,
      varianceUnits: variance,
      variancePct: variancePct,
      isUnder: variance <= 0,
      usedNormal: c.tod?.normalUnits ?? 0,
      usedOffPeak: c.tod?.offPeakUnits ?? 0,
      usedPeak: c.tod?.peakUnits ?? 0,
      sharasheriNormal: c.sharasheriTod?.normalUnits ?? 0,
      sharasheriOffPeak: c.sharasheriTod?.offPeakUnits ?? 0,
      sharasheriPeak: c.sharasheriTod?.peakUnits ?? 0,
    };
  });

  // Calculate summary metrics across all cycles
  const totalCycles = chartData.length;
  const avgUsed = Math.round(
    chartData.reduce((acc, d) => acc + d.usedUnits, 0) / (totalCycles || 1)
  );
  const avgBenchmark = Math.round(
    chartData.reduce((acc, d) => acc + d.sharasheriUnits, 0) / (totalCycles || 1)
  );
  const netVariance = avgUsed - avgBenchmark;
  const isNetEfficient = netVariance <= 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2.5 min-w-[240px]">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {data.label}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              #{data.billNumber}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                Actual Used (Billed):
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                {formatIndianNumber(data.usedUnits, 0)} kWh
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shrink-0" />
                Sharasheri Benchmark:
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">
                {formatIndianNumber(data.sharasheriUnits, 0)} kWh
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="text-slate-500">Benchmark Variance:</span>
              <span
                className={`font-mono font-bold ${
                  data.isUnder
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {data.varianceUnits > 0 ? `+${data.varianceUnits}` : data.varianceUnits} kWh (
                {data.variancePct > 0 ? `+${data.variancePct}` : data.variancePct}%)
              </span>
            </div>

            {/* Zone Comparison if available */}
            {data.sharasheriNormal > 0 && (
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5 font-mono">
                <div className="flex justify-between">
                  <span>Normal (Used vs Avg):</span>
                  <span>{data.usedNormal}u vs {data.sharasheriNormal}u</span>
                </div>
                <div className="flex justify-between">
                  <span>Off-Peak (Used vs Avg):</span>
                  <span>{data.usedOffPeak}u vs {data.sharasheriOffPeak}u</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak (Used vs Avg):</span>
                  <span>{data.usedPeak}u vs {data.sharasheriPeak}u</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Scale className="h-4 w-4" />
            </div>
            <CardTitle className="text-base sm:text-lg font-bold">
              KSEB Sharasheri (ശരാശരി) Benchmark History
            </CardTitle>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hidden sm:inline-block">
              Reg 122/123
            </span>
          </div>
          <CardDescription className="text-xs">
            Historical cycle-by-cycle comparison of actual physical meter usage vs KSEB assessed average benchmark
          </CardDescription>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs">
          <Button
            variant={viewMode === "comparison" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("comparison")}
            className="h-7 text-xs px-2.5 rounded-lg"
          >
            Dual Bar
          </Button>
          <Button
            variant={viewMode === "trend" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("trend")}
            className="h-7 text-xs px-2.5 rounded-lg"
          >
            Trendline
          </Button>
          <Button
            variant={viewMode === "variance" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("variance")}
            className="h-7 text-xs px-2.5 rounded-lg"
          >
            Variance
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Top KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
              Avg. Actual Used
            </span>
            <span className="text-base font-black font-mono text-emerald-700 dark:text-emerald-300">
              {formatIndianNumber(avgUsed, 0)} <span className="text-[10px] font-normal text-slate-500">kWh</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">
              Avg. Sharasheri Benchmark
            </span>
            <span className="text-base font-black font-mono text-indigo-700 dark:text-indigo-300">
              {formatIndianNumber(avgBenchmark, 0)} <span className="text-[10px] font-normal text-slate-500">kWh</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Net Cycle Variance
            </span>
            <span
              className={`text-base font-black font-mono ${
                isNetEfficient ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {netVariance > 0 ? `+${netVariance}` : netVariance}{" "}
              <span className="text-[10px] font-normal text-slate-500">kWh</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Billing Basis
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              100% Actual Meter Advance
            </span>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-[280px] sm:h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === "variance" ? (
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
                  tickFormatter={(val) => `${val}u`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <Bar dataKey="varianceUnits" radius={[4, 4, 0, 0]} maxBarSize={40} name="Variance (kWh)">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.varianceUnits <= 0 ? "#10b981" : "#f59e0b"}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : viewMode === "trend" ? (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                  tickFormatter={(val) => `${val}u`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={28}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mr-2">
                      {value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="usedUnits"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Actual Used Units (kWh)"
                  maxBarSize={36}
                />
                <Line
                  type="monotone"
                  dataKey="sharasheriUnits"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366f1" }}
                  name="Sharasheri Benchmark (kWh)"
                />
              </ComposedChart>
            ) : (
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
                  tickFormatter={(val) => `${val}u`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={28}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mr-2">
                      {value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="usedUnits"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Actual Used Units (kWh)"
                  maxBarSize={32}
                />
                <Bar
                  dataKey="sharasheriUnits"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  name="Sharasheri Benchmark (kWh)"
                  maxBarSize={32}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Footnote on Kerala Supply Code */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Kerala Electricity Supply Code 2014 (Reg 122 & 123): Sharasheri is the statutory historical baseline.
          </span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            Billed on Actual Advance
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
