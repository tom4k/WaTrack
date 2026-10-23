"use client";

import React, { useState, useEffect } from "react";
import { Plus, Receipt, FileDown, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BillList } from "@/components/bills/BillList";
import { BillFormModal } from "@/components/bills/BillFormModal";
import { Button } from "@/components/ui/button";

export default function BillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [consumers, setConsumers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [billsRes, consumersRes] = await Promise.all([
        fetch("/api/bills"),
        fetch("/api/consumers"),
      ]);

      if (billsRes.ok) {
        const data = await billsRes.json();
        setBills(data.bills || []);
      }

      if (consumersRes.ok) {
        const cData = await consumersRes.json();
        setConsumers(cData.consumers || []);
      }
    } catch (err) {
      console.error("Bills fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteBill = async (billId: string) => {
    if (!confirm("Are you sure you want to delete this bill? This action cannot be undone.")) {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Electricity Bills
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage KSEB spot demand notices, meter readings, payments, and private PDF receipts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddBillOpen(true)}
              className="gap-2 text-xs font-semibold shadow-md shadow-emerald-600/20"
            >
              <Plus className="h-4 w-4" />
              Add New Bill
            </Button>
            <a
              href="/api/export/bills"
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 transition-colors"
            >
              <FileDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </a>
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
      </div>
    </AppShell>
  );
}
