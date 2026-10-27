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
import { formatIndianNumber } from "@/lib/formatters";

interface TODBreakdownChartProps {
  cycleHistory?: any[];
  todDistribution?: any[];
}

export function TODBreakdownChart({
  cycleHistory = [],
  todDistribution = [],
}: TODBreakdownChartProps) {
  const [viewMode, setViewMode] = useState<"grouped" | "stacked" | "share">("grouped");

  if (!cycleHistory || cycleHistory.length === 0) {
    return (
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Time of Day (TOD) Consumption Analysis</CardTitle>
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

  // Oldest to newest for chronological left-to-right charting
  const cycleData = [...cycleHistory].reverse().map((c) => {
    const norm = Math.round(c.tod?.normalUnits ?? 0);
    const offp = Math.round(c.tod?.offPeakUnits ?? 0);
    const peak = Math.round(c.tod?.peakUnits ?? 0);
    const total = norm + offp + peak || Math.round(c.totalUnits || 0);

    return {
      label: c.periodLabel,
      totalUnits: total,
      normal: norm,
      offPeak: offp,
      peak: peak,
      normalPercent: total > 0 ? Math.round((norm / total) * 1000) / 10 : 0,
      offPeakPercent: total > 0 ? Math.round((offp / total) * 1000) / 10 : 0,
      peakPercent: total > 0 ? Math.round((peak / total) * 1000) / 10 : 0,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2 min-w-[240px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200">{label}</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {formatIndianNumber(data.totalUnits, 0)} kWh
            </span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                Normal (6am–6pm):
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {formatIndianNumber(data.normal, 0)} kWh ({data.normalPercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Off-Peak (10pm–6am):
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {formatIndianNumber(data.offPeak, 0)} kWh ({data.offPeakPercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Peak (6pm–10pm):
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {formatIndianNumber(data.peak, 0)} kWh ({data.peakPercent}%)
              </span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Tariff Multipliers:</span>
            <span className="font-mono">Normal: 100% • Off: 90% • Peak: 120%</span>
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
          <CardTitle>Time-Of-Day (TOD) Consumption Analysis</CardTitle>
          <CardDescription>
            {viewMode === "grouped"
              ? "Bi-monthly KSEB spot bill cycles comparing Normal (6am–6pm), Off-Peak (10pm–6am), and Peak (6pm–10pm) zones"
              : viewMode === "stacked"
              ? "Stacked bi-monthly energy consumption (kWh) showing zone composition per cycle"
              : "Percentage load distribution (%) across tariff zones to monitor peak-hour exposure"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <Button
            variant={viewMode === "grouped" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grouped")}
            className="h-7 text-xs px-2.5"
          >
            Grouped (kWh)
          </Button>
          <Button
            variant={viewMode === "stacked" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("stacked")}
            className="h-7 text-xs px-2.5"
          >
            Stacked (kWh)
          </Button>
          <Button
            variant={viewMode === "share" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("share")}
            className="h-7 text-xs px-2.5"
          >
            Zone Share (%)
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Aggregate Zone Summary Chips */}
        {todDistribution && todDistribution.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {todDistribution.map((zone) => (
              <div
                key={zone.name}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: zone.color }}
                  />
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {zone.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {zone.name.includes("Peak (6")
                        ? "+20% Peak Surcharge"
                        : zone.name.includes("Off-Peak")
                        ? "-10% Night Concession"
                        : "Standard 100% Base Rate"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono text-slate-900 dark:text-slate-100">
                    {zone.percentage}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {formatIndianNumber(zone.units, 0)} kWh
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TOD Bar Chart */}
        <div className="h-[380px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cycleData}
              margin={{ top: 12, right: 12, left: -10, bottom: 6 }}
              barGap={viewMode === "grouped" ? 4 : 0}
              barCategoryGap={viewMode === "grouped" ? "20%" : "30%"}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={0}
                height={40}
                tick={({ x, y, payload }) => {
                  const text = String(payload.value || "");
                  const parts = text.split(" (");
                  const datePart = parts[0];
                  const daysPart = parts[1] ? `(${parts[1]}` : "";

                  let line1 = datePart;
                  let line2 = daysPart;
                  if (!daysPart && datePart.includes(" ")) {
                    const spaceIdx = datePart.lastIndexOf(" ");
                    line1 = datePart.substring(0, spaceIdx);
                    line2 = datePart.substring(spaceIdx + 1);
                  }

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={12}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize={10}
                        fontWeight={500}
                      >
                        {line1}
                      </text>
                      {line2 && (
                        <text
                          x={0}
                          y={0}
                          dy={25}
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize={9}
                          fontFamily="monospace"
                        >
                          {line2}
                        </text>
                      )}
                    </g>
                  );
                }}
              />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={viewMode === "share" ? [0, 100] : [0, "auto"]}
                tickFormatter={(value) => (viewMode === "share" ? `${value}%` : `${value} u`)}
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
                dataKey={viewMode === "share" ? "normalPercent" : "normal"}
                stackId={viewMode === "grouped" ? undefined : "tod"}
                fill="#3b82f6"
                radius={viewMode === "grouped" ? [4, 4, 0, 0] : undefined}
                name="Normal (6 AM – 6 PM)"
                maxBarSize={viewMode === "grouped" ? 28 : 44}
              />
              <Bar
                dataKey={viewMode === "share" ? "offPeakPercent" : "offPeak"}
                stackId={viewMode === "grouped" ? undefined : "tod"}
                fill="#10b981"
                radius={viewMode === "grouped" ? [4, 4, 0, 0] : undefined}
                name="Off-Peak (10 PM – 6 AM)"
                maxBarSize={viewMode === "grouped" ? 28 : 44}
              />
              <Bar
                dataKey={viewMode === "share" ? "peakPercent" : "peak"}
                stackId={viewMode === "grouped" ? undefined : "tod"}
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                name="Peak (6 PM – 10 PM)"
                maxBarSize={viewMode === "grouped" ? 28 : 44}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
