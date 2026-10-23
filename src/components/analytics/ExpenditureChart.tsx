"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatINR, formatIndianNumber } from "@/lib/formatters";

interface ExpenditureChartProps {
  cycleHistory: any[];
}

export function ExpenditureChart({ cycleHistory }: ExpenditureChartProps) {
  const chartData = [...cycleHistory].reverse().map((c) => ({
    label: c.periodLabel,
    amount: c.totalAmount,
    energyCharge: c.energyCharge,
    duty: c.duty,
    costPerUnit: c.costPerUnit,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              Total Bill: {formatINR(data.amount)}
            </p>
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-0.5">
              <p>Energy Charge: <span className="font-mono">{formatINR(data.energyCharge)}</span></p>
              <p>Electricity Duty: <span className="font-mono">{formatINR(data.duty)}</span></p>
              <p>Effective Rate: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">₹{data.costPerUnit}/kWh</span></p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader>
        <CardTitle>Expenditure & Cost Trends</CardTitle>
        <CardDescription>
          Bi-monthly electricity bill amounts (INR ₹) across consecutive KSEB billing cycles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
              <defs>
                <linearGradient id="colorExpenditure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorExpenditure)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
