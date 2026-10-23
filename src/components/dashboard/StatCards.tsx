"use client";

import React from "react";
import { IndianRupee, Zap, Clock, AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR, formatIndianNumber, formatUnits, formatKolkataDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface StatCardsProps {
  analytics: any;
}

export function StatCards({ analytics }: StatCardsProps) {
  if (!analytics) return null;

  const {
    totalSpentThisYear,
    totalSpentAllTime,
    yearOverYearPercentChange,
    totalPendingAmount,
    pendingBillsCount,
    avgUnitsPerCycle,
    avgUnitsPerMonth,
    avgCostPerUnit,
    nextDueBill,
  } = analytics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Spent This Year */}
      <Card className="relative overflow-hidden border-slate-200/80 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Spent (2026)
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {formatINR(totalSpentThisYear)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              {yearOverYearPercentChange !== null && (
                <span
                  className={cn(
                    "flex items-center font-semibold text-[11px] px-1.5 py-0.5 rounded",
                    yearOverYearPercentChange <= 0
                      ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                      : "text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
                  )}
                >
                  {yearOverYearPercentChange <= 0 ? (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(yearOverYearPercentChange)}% YoY
                </span>
              )}
              <span>All-time: {formatINR(totalSpentAllTime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Outstanding Dues */}
      <Card
        className={cn(
          "relative overflow-hidden border-slate-200/80 dark:border-slate-800",
          totalPendingAmount > 0
            ? "border-amber-300/80 dark:border-amber-900/60"
            : ""
        )}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Outstanding Dues
            </span>
            <div
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center",
                totalPendingAmount > 0
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3">
            <div
              className={cn(
                "text-2xl font-black tracking-tight font-mono",
                totalPendingAmount > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-900 dark:text-slate-100"
              )}
            >
              {formatINR(totalPendingAmount)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{pendingBillsCount} pending {pendingBillsCount === 1 ? "bill" : "bills"}</span>
              {totalPendingAmount > 0 && (
                <a
                  href="https://wss.kseb.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Pay online <ArrowUpRight className="h-3 w-3 ml-0.5" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Average Consumption */}
      <Card className="relative overflow-hidden border-slate-200/80 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg. Consumption
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {formatIndianNumber(avgUnitsPerCycle, 0)}{" "}
              <span className="text-sm font-normal text-slate-500">kWh/cycle</span>
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              ≈ <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{formatIndianNumber(avgUnitsPerMonth, 0)} kWh/month</span> • Avg: ₹{avgCostPerUnit}/kWh
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Next Payment Due Alert */}
      <Card className="relative overflow-hidden border-slate-200/80 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Next Due Date
            </span>
            <div
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center",
                nextDueBill?.isOverdue
                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 animate-pulse"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}
            >
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3">
            <div
              className={cn(
                "text-2xl font-black tracking-tight font-mono",
                nextDueBill?.isOverdue
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-900 dark:text-slate-100"
              )}
            >
              {nextDueBill ? formatKolkataDate(nextDueBill.dueDate) : "All Clear"}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {nextDueBill ? (
                <span
                  className={cn(
                    "font-semibold",
                    nextDueBill.isOverdue
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {nextDueBill.isOverdue
                    ? `Overdue by ${Math.abs(nextDueBill.daysRemaining)} days`
                    : `Due in ${nextDueBill.daysRemaining} days`} ({formatINR(nextDueBill.amount)})
                </span>
              ) : (
                "No pending bills due"
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
