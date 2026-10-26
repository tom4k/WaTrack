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
import { formatIndianNumber, formatINR } from "@/lib/formatters";

interface ConsumptionChartProps {
  cycleHistory: any[];
  monthlyNormalized: any[];
}

export function ConsumptionChart({ cycleHistory, monthlyNormalized }: ConsumptionChartProps) {
  const [viewMode, setViewMode] = useState<"cycles" | "monthly">("cycles");

  // Oldest to newest for charting left-to-right
  const cycleData = [...cycleHistory].reverse().map((c) => ({
    label: c.periodLabel,
    units: Math.round(c.totalUnits),
    amount: Math.round(c.totalAmount || c.payableAmount || 0),
    costPerUnit: c.costPerUnit || (c.totalUnits > 0 ? (c.totalAmount || c.payableAmount || 0) / c.totalUnits : 0),
    normal: c.tod?.normalUnits ?? 0,
    offPeak: c.tod?.offPeakUnits ?? 0,
    peak: c.tod?.peakUnits ?? 0,
  }));

  const monthlyData = monthlyNormalized.map((m) => ({
    label: m.monthName,
    units: Math.round(m.units),
    amount: Math.round(m.expenditure || 0),
    costPerUnit: m.units > 0 ? (m.expenditure || 0) / m.units : 0,
    normal: 0,
    offPeak: 0,
    peak: 0,
  }));

  const chartData = viewMode === "cycles" ? cycleData : monthlyData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2 min-w-[210px]">
          <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            {label}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Units Consumed:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                {formatIndianNumber(data.units, 0)} kWh
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                Bill Amount:
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">
                {formatINR(data.amount)}
              </span>
            </div>
            {data.costPerUnit > 0 && (
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <span>Effective Rate:</span>
                <span className="font-mono font-medium">₹{data.costPerUnit.toFixed(2)} / kWh</span>
              </div>
            )}
            {viewMode === "cycles" && data.normal > 0 && (
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5 font-mono">
                <div className="flex justify-between">
                  <span>Normal (6am-6pm):</span>
                  <span>{data.normal} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Off-Peak (10pm-6am):</span>
                  <span>{data.offPeak} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak (6pm-10pm):</span>
                  <span>{data.peak} kWh</span>
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
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-3">
        <div>
          <CardTitle>Electricity Consumption & Bill History</CardTitle>
          <CardDescription>
            {viewMode === "cycles"
              ? "Bi-monthly KSEB spot bill cycles (~60 days) comparing units consumed (kWh) and bill amount (₹)"
              : "Normalized calendar monthly consumption (kWh) vs monthly expenditure (₹)"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
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
        <div className="h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
              barGap={4}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              {/* Left Y-Axis for Units Consumed */}
              <YAxis
                yAxisId="units"
                orientation="left"
                stroke="#10b981"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} u`}
              />
              {/* Right Y-Axis for Bill Amount */}
              <YAxis
                yAxisId="amount"
                orientation="right"
                stroke="#3b82f6"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${formatIndianNumber(value, 0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: "12px", fontSize: "11px" }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mr-2">
                    {value}
                  </span>
                )}
              />
              <Bar
                yAxisId="units"
                dataKey="units"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Units Consumed (kWh)"
                maxBarSize={36}
              />
              <Bar
                yAxisId="amount"
                dataKey="amount"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="Bill Amount (₹)"
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

