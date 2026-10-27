"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  Receipt,
  ExternalLink,
  Calendar,
  TrendingUp,
  MapPin,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCards } from "@/components/dashboard/StatCards";
import { DueAlertBanner } from "@/components/dashboard/DueAlertBanner";
import { ConsumptionChart } from "@/components/analytics/ConsumptionChart";
import { TODBreakdownChart } from "@/components/analytics/TODBreakdownChart";
import { BillList } from "@/components/bills/BillList";
import { BillFormModal } from "@/components/bills/BillFormModal";
import { RecordPaymentModal } from "@/components/payments/RecordPaymentModal";
import { ThermalReceiptModal } from "@/components/bills/ThermalReceiptModal";
import { Button } from "@/components/ui/button";
import { formatINR, formatKolkataDate } from "@/lib/formatters";

function DashboardContent() {
  const [bills, setBills] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [consumers, setConsumers] = useState<any[]>([]);
  const [defaultConsumer, setDefaultConsumer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState("");

  // Modals
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState<any | null>(null);
  const [billForPayment, setBillForPayment] = useState<any | null>(null);
  const [billForThermal, setBillForThermal] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [billsRes, consumersRes] = await Promise.all([
        fetch("/api/bills?analytics=true"),
        fetch("/api/consumers"),
      ]);

      if (billsRes.ok) {
        const data = await billsRes.json();
        setBills(data.bills || []);
        setAnalytics(data.analytics || null);
      }

      if (consumersRes.ok) {
        const cData = await consumersRes.json();
        setConsumers(cData.consumers || []);
        setDefaultConsumer(cData.defaultConsumer || null);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTodayStr(formatKolkataDate(new Date(), { showDayOfWeek: true, format: "full" }));
    fetchData();
  }, []);

  const handleDeleteBill = async (billId: string) => {
    if (!confirm("Are you sure you want to delete this bill? This will also remove associated payment records.")) {
      return;
    }
    try {
      const res = await fetch(`/api/bills/${billId}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Electricity Dashboard
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                KSEB Live
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              <span>{todayStr || "Asia/Kolkata"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setIsAddBillOpen(true)}
              className="gap-2 text-xs font-semibold shadow-md shadow-emerald-600/20"
            >
              <Plus className="h-4 w-4" />
              Record New Bill
            </Button>
            <a
              href="https://wss.kseb.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 transition-colors"
            >
              <span>KSEB Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && !analytics && (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
              ))}
            </div>
            <div className="h-40 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
          </div>
        )}

        {/* Urgent Due Date Alert Banner */}
        {analytics?.nextDueBill && (
          <DueAlertBanner
            nextDueBill={analytics.nextDueBill}
            onPayClick={(b) => {
              const fullBill = bills.find((item) => item.billNumber === b.billNumber);
              setBillForPayment(fullBill || b);
            }}
            onViewSlipClick={(b) => {
              const fullBill = bills.find((item) => item.billNumber === b.billNumber);
              setBillForThermal(fullBill || b);
            }}
          />
        )}

        {/* 4 Core KPI Stat Cards */}
        {analytics && <StatCards analytics={analytics} />}

        {/* Active Consumer Connection Profile Banner */}
        {defaultConsumer ? (
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {defaultConsumer.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {defaultConsumer.tariff}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Consumer Number: <span className="font-bold text-slate-700 dark:text-slate-300">{defaultConsumer.consumerNumber}</span> (ID: {defaultConsumer.consumerId || "—"})
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {defaultConsumer.sectionName} • Connected Load: {defaultConsumer.connectedLoad} ({defaultConsumer.phase})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono border-t md:border-t-0 md:border-l border-slate-200/70 dark:border-slate-800 pt-3 md:pt-0 md:pl-6">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Transformer</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{defaultConsumer.transformer || "POOTHAKUZHY"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Post No</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{defaultConsumer.postNumber || "PR-124/4/4"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Security Deposit</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatINR(defaultConsumer.securityDeposit)}</span>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="p-6 rounded-2xl border border-dashed border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-teal-950/20 text-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 ring-1 ring-emerald-500/30">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Welcome to your WaTrack Dashboard</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Start by setting up your 13-digit KSEB Consumer Number or record your first electricity bill.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  href="/consumers"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all gap-1.5 whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add KSEB Profile</span>
                </Link>
                <Button
                  onClick={() => setIsAddBillOpen(true)}
                  variant="outline"
                  className="text-xs font-semibold gap-1.5 whitespace-nowrap"
                >
                  <Receipt className="h-4 w-4" />
                  <span>Add Bill</span>
                </Button>
              </div>
            </div>
          )
        )}

        {/* Charts Section */}
        {analytics && analytics.cycleHistory && analytics.cycleHistory.length > 0 ? (
          <div className="space-y-6">
            <ConsumptionChart
              cycleHistory={analytics.cycleHistory}
              monthlyNormalized={analytics.monthlyNormalized}
            />
            <TODBreakdownChart todDistribution={analytics.todDistribution} />
          </div>
        ) : (
          !loading && (
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm text-center">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Consumption Data Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once you record your first KSEB spot bill, bi-monthly consumption trends and Time-Of-Day meter breakdowns will automatically appear here.
              </p>
            </div>
          )
        )}

        {/* Recent Bills Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Electricity Bill Records
              </h2>
              <p className="text-xs text-slate-500">
                Full history of KSEB spot demand notices, payments, and meter readings
              </p>
            </div>
          </div>

          <BillList
            bills={bills}
            consumers={consumers}
            onRefresh={fetchData}
            onAddNew={() => setIsAddBillOpen(true)}
            onEdit={(b) => setBillToEdit(b)}
            onDelete={handleDeleteBill}
          />
        </div>
      </div>

      {/* Bill Form Modal */}
      {(isAddBillOpen || billToEdit) && (
        <BillFormModal
          open={isAddBillOpen || Boolean(billToEdit)}
          billToEdit={billToEdit}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddBillOpen(false);
              setBillToEdit(null);
            }
          }}
          onSuccess={() => {
            setIsAddBillOpen(false);
            setBillToEdit(null);
            fetchData();
          }}
        />
      )}

      {/* Payment Modal */}
      {billForPayment && (
        <RecordPaymentModal
          bill={billForPayment}
          open={Boolean(billForPayment)}
          onOpenChange={(open) => !open && setBillForPayment(null)}
          onSuccess={() => {
            setBillForPayment(null);
            fetchData();
          }}
        />
      )}

      {/* Thermal Receipt Modal */}
      {billForThermal && (
        <ThermalReceiptModal
          bill={billForThermal}
          open={Boolean(billForThermal)}
          onOpenChange={(open) => !open && setBillForThermal(null)}
        />
      )}
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-400 animate-bounce" />
              <span className="text-xs font-semibold">Loading Dashboard...</span>
            </div>
          </div>
        </AppShell>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
