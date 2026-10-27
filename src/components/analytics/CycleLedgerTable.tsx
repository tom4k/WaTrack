"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatINR, formatUnits, formatIndianNumber } from "@/lib/formatters";
import { Table, FileText, ArrowUpDown, CheckCircle, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CycleLedgerTableProps {
  cycleHistory: any[];
  yearlyComparison?: any[];
}

export function CycleLedgerTable({ cycleHistory, yearlyComparison }: CycleLedgerTableProps) {
  const [activeTab, setActiveTab] = useState<"cycles" | "yearly">("cycles");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date" | "units" | "amount">("date");

  if (!cycleHistory || cycleHistory.length === 0) return null;

  // Extract available years
  const years = Array.from(
    new Set(cycleHistory.map((c) => (c.billDate ? c.billDate.slice(0, 4) : "2026")))
  ).sort().reverse();

  // Filter
  const filtered = cycleHistory.filter((c) => {
    if (selectedYear === "ALL") return true;
    return c.billDate && c.billDate.startsWith(selectedYear);
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "units") return b.totalUnits - a.totalUnits;
    if (sortBy === "amount") return b.totalAmount - a.totalAmount;
    return b.billDate.localeCompare(a.billDate);
  });

  // Totals for filtered set
  const totalUnits = sorted.reduce((sum, c) => sum + c.totalUnits, 0);
  const totalAmount = sorted.reduce((sum, c) => sum + c.totalAmount, 0);
  const avgCostPerUnit = totalUnits > 0 ? (totalAmount / totalUnits).toFixed(2) : "0.00";

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Billing Cycle History & Detailed Ledger</CardTitle>
            <CardDescription>
              {activeTab === "cycles"
                ? "Complete cycle-by-cycle reconciliation of consumption units, daily burn, TOD zone split, and component charges"
                : "Annual electricity usage, bill counts, and total billing expenditure by calendar year"}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle: Cycles vs Yearly */}
            {yearlyComparison && yearlyComparison.length > 0 && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <Button
                  variant={activeTab === "cycles" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("cycles")}
                  className="h-7 text-xs px-2.5"
                >
                  Cycle Ledger ({cycleHistory.length})
                </Button>
                <Button
                  variant={activeTab === "yearly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("yearly")}
                  className="h-7 text-xs px-2.5"
                >
                  Annual Summary
                </Button>
              </div>
            )}

            {/* Cycle Filters: Only show when in Cycles view */}
            {activeTab === "cycles" && (
              <>
                {/* Year Filter Tabs */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setSelectedYear("ALL")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedYear === "ALL"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    All
                  </button>
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className={`px-2.5 py-1 rounded-lg transition-colors font-mono ${
                        selectedYear === y
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-sm"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                {/* Sort Toggle */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setSortBy(sortBy === "date" ? "units" : sortBy === "units" ? "amount" : "date")}
                    className="px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 flex items-center gap-1 transition-colors"
                    title="Toggle sort order"
                  >
                    <ArrowUpDown className="h-3 w-3" />
                    <span className="capitalize">{sortBy}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {activeTab === "cycles" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-3">Billing Cycle & Dates</th>
                  <th className="py-3 px-3 text-right">Units & Burn Rate</th>
                  <th className="py-3 px-3">TOD Split (NL / OP / PK)</th>
                  <th className="py-3 px-3 text-right">Energy Charge</th>
                  <th className="py-3 px-3 text-right">Fixed & Duty</th>
                  <th className="py-3 px-3 text-right">Effective Rate</th>
                  <th className="py-3 px-3 text-right">Total Bill</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {sorted.map((c) => {
                  const isPaid = c.status === "PAID";
                  return (
                    <tr key={c.id || c.billNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {c.cycleLabel}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Bill #{c.billNumber} • {c.billingCycleDays || 60} days
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatUnits(c.totalUnits)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {c.dailyBurnUnits ? `${c.dailyBurnUnits} u/day` : "—"}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-sans">
                        {c.tod ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono">
                              <span className="text-blue-600 dark:text-blue-400 font-bold">
                                {c.tod.normalUnits}u
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">/</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {c.tod.offPeakUnits}u
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">/</span>
                              <span className="text-amber-600 dark:text-amber-400 font-bold">
                                {c.tod.peakUnits}u
                              </span>
                            </div>
                            <div className="h-1.5 w-28 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                              <div className="bg-blue-500 h-full" style={{ width: `${c.tod.normalPercent}%` }} />
                              <div className="bg-emerald-500 h-full" style={{ width: `${c.tod.offPeakPercent}%` }} />
                              <div className="bg-amber-500 h-full" style={{ width: `${c.tod.peakPercent}%` }} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Flat Meter</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-800 dark:text-slate-200">
                        {formatINR(c.energyCharge)}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-500">
                        {formatINR(c.otherCharges || c.duty + c.fixedCharge + c.fuelSurcharge + c.meterRent)}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300 font-semibold">
                        ₹{c.costPerUnit ? c.costPerUnit.toFixed(2) : "—"}
                      </td>

                      <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-slate-100 text-sm">
                        {formatINR(c.totalAmount)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full font-sans ${
                            isPaid
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                              : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          {isPaid ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-700 font-mono font-bold bg-slate-50/60 dark:bg-slate-900/40">
                  <td className="py-3 px-3 font-sans text-slate-900 dark:text-slate-100">
                    Total ({sorted.length} cycles)
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatUnits(totalUnits)}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-500 font-sans font-normal">
                    Weighted rate: ₹{avgCostPerUnit}/kWh
                  </td>
                  <td colSpan={3} className="py-3 px-3 text-right text-xs text-slate-500 font-sans font-normal">
                    Cumulative Expenditure:
                  </td>
                  <td className="py-3 px-3 text-right text-base text-slate-900 dark:text-slate-100 font-black">
                    {formatINR(totalAmount)}
                  </td>
                  <td className="py-3 px-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          /* Annual Summary View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Calendar Year</th>
                  <th className="py-3 px-3 text-right">Bills Count</th>
                  <th className="py-3 px-3 text-right">Total Units Consumed</th>
                  <th className="py-3 px-3 text-right">Total Expenditure</th>
                  <th className="py-3 px-3 text-right">Average Effective Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {yearlyComparison?.map((y: any) => {
                  const avgRate = y.units > 0 ? (y.expenditure / y.units).toFixed(2) : "0.00";
                  return (
                    <tr key={y.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-3 font-bold text-sm text-slate-900 dark:text-slate-100 font-sans">
                        {y.year}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-500 font-sans">
                        {y.billsCount} {y.billsCount === 1 ? "bill" : "bills"}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatUnits(y.units)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatINR(y.expenditure)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-600 dark:text-slate-300">
                        ₹{avgRate} / kWh
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
