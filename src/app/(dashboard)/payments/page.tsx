"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, FileDown, Trash2, CheckCircle2, ArrowUpRight, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR, formatKolkataDate } from "@/lib/formatters";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments");
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Fetch payments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment record? The bill balance and status will be updated accordingly.")) {
      return;
    }
    try {
      const res = await fetch(`/api/payments/${paymentId}`, { method: "DELETE" });
      if (res.ok) {
        fetchPayments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPaid = payments.reduce((acc, p) => acc + parseFloat(p.amount || "0"), 0);

  const filtered = payments.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchBill = (p.billNumber || "").toLowerCase().includes(term);
    const matchRef = (p.transactionReference || "").toLowerCase().includes(term);
    const matchMethod = (p.paymentMethod || "").toLowerCase().includes(term);
    const matchNotes = (p.notes || "").toLowerCase().includes(term);
    return matchBill || matchRef || matchMethod || matchNotes;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Payment Records
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Historical ledger of electricity bill settlements, partial payments, and transaction IDs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/payments"
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 transition-colors"
            >
              <FileDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Export Payments CSV</span>
            </a>
            <a
              href="https://wss.kseb.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
            >
              <span>KSEB Quick Pay</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Amount Paid
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                {formatINR(totalPaid)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Across all logged payment transactions</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Payment Transactions
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 mt-2">
                {payments.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Settled payments on record</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Primary Payment Channel
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                KSEB Online Portal & UPI
              </div>
              <p className="text-xs text-slate-500 mt-1">wss.kseb.in / Google Pay</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search payments by bill number, method, reference ID, notes..."
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 overflow-hidden shadow-sm backdrop-blur-sm">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No payment transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Bill Reference</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Transaction / Receipt ID</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                        {formatKolkataDate(p.paymentDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          #{p.billNumber}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {p.consumerName} (C#: {p.consumerNumber})
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {p.transactionReference || p.receiptNumber || "—"}
                        {p.notes && <div className="text-[10px] text-slate-400 italic">{p.notes}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatINR(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-rose-600"
                          onClick={() => handleDeletePayment(p.id)}
                          title="Delete Payment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
