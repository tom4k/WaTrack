"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  FileDown,
  Plus,
  Receipt,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatKolkataDate, formatUnits, getDueStatus } from "@/lib/formatters";
import { BillDetailsDrawer } from "./BillDetailsDrawer";
import { ThermalReceiptModal } from "./ThermalReceiptModal";
import { RecordPaymentModal } from "@/components/payments/RecordPaymentModal";

interface BillListProps {
  bills: any[];
  consumers: any[];
  onRefresh: () => void;
  onAddNew: () => void;
  onEdit: (bill: any) => void;
  onDelete: (billId: string) => void;
}

export function BillList({
  bills,
  consumers,
  onRefresh,
  onAddNew,
  onEdit,
  onDelete,
}: BillListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedConsumer, setSelectedConsumer] = useState("ALL");

  const [activeBillForDetails, setActiveBillForDetails] = useState<any | null>(null);
  const [activeBillForThermal, setActiveBillForThermal] = useState<any | null>(null);
  const [activeBillForPayment, setActiveBillForPayment] = useState<any | null>(null);

  // Filter bills
  const filteredBills = bills.filter((b) => {
    if (selectedStatus !== "ALL" && b.status !== selectedStatus) return false;
    if (selectedYear !== "ALL" && !b.billDate.startsWith(selectedYear)) return false;
    if (selectedConsumer !== "ALL" && b.consumerId !== selectedConsumer) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchBillNo = b.billNumber.toLowerCase().includes(term);
      const matchConsumer = (b.consumerName || "").toLowerCase().includes(term);
      const matchRemarks = (b.remarks || "").toLowerCase().includes(term);
      const matchConsNo = (b.consumerNumber || "").toLowerCase().includes(term);
      return matchBillNo || matchConsumer || matchRemarks || matchConsNo;
    }
    return true;
  });

  const getStatusBadge = (bill: any) => {
    const dueInfo = getDueStatus(bill.dueDate);
    switch (bill.status) {
      case "PAID":
        return <Badge variant="default">Paid</Badge>;
      case "PARTIALLY_PAID":
        return <Badge variant="warning">Partially Paid</Badge>;
      case "OVERDUE":
        return <Badge variant="destructive">Overdue ({dueInfo.label})</Badge>;
      default:
        return <Badge variant="outline">Unpaid ({dueInfo.label})</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by bill number, consumer, notes..."
              className="pl-9 h-9"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 text-xs w-36"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid in Full</option>
            </Select>

            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-9 text-xs w-28"
            >
              <option value="ALL">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </Select>

            <a
              href="/api/export/bills"
              className="inline-flex items-center justify-center h-9 px-3 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 transition-colors"
              title="Download Bills as CSV"
            >
              <FileDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>

            <Button onClick={onAddNew} size="sm" className="h-9 gap-1.5 text-xs font-semibold">
              <Plus className="h-4 w-4" />
              Add Bill
            </Button>
          </div>
        </div>
      </div>

      {/* Bills Data Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 overflow-hidden shadow-sm backdrop-blur-sm">
        {filteredBills.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Receipt className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No bills found matching your filters
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search query, status filter, or add a new KSEB bill entry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Bill Particulars</th>
                  <th className="py-3 px-4">Bill Date / Due</th>
                  <th className="py-3 px-4 text-right">Consumed</th>
                  <th className="py-3 px-4 text-right">Bill Amount</th>
                  <th className="py-3 px-4 text-right">Remaining Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredBills.map((b) => {
                  const payable = parseFloat(b.payableAmount || "0");
                  const paid = parseFloat(b.paidAmount || "0");
                  const balance = Math.max(0, payable - paid);

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setActiveBillForDetails(b)}
                    >
                      {/* Bill & Consumer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                            #{b.billNumber}
                          </span>
                          {b.documentPath && (
                            <span title="Original Document Attached">
                              <Download className="h-3.5 w-3.5 text-emerald-500" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          C# {b.consumerNumber || "1156241018150"} • {b.consumerName}
                        </p>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {formatKolkataDate(b.billDate)}
                        </div>
                        <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                          Due: {formatKolkataDate(b.dueDate)}
                        </div>
                      </td>

                      {/* Units */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatUnits(b.totalUnits)}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {b.billingCycleDays || 60} days
                        </div>
                      </td>

                      {/* Bill Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-semibold">
                        {formatINR(b.payableAmount)}
                      </td>

                      {/* Remaining Due */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-black ${
                            balance > 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {formatINR(balance)}
                        </span>
                        {paid > 0 && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Paid: {formatINR(paid)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(b)}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-emerald-600"
                            onClick={() => setActiveBillForThermal(b)}
                            title="View KSEB Thermal Slip"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>

                          {balance > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                              onClick={() => setActiveBillForPayment(b)}
                              title="Record Payment"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-900"
                            onClick={() => onEdit(b)}
                            title="Edit Bill"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-rose-600"
                            onClick={() => onDelete(b.id)}
                            title="Delete Bill"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {activeBillForDetails && (
        <BillDetailsDrawer
          billId={activeBillForDetails.id}
          open={Boolean(activeBillForDetails)}
          onOpenChange={(open) => !open && setActiveBillForDetails(null)}
          onEdit={(b) => {
            setActiveBillForDetails(null);
            onEdit(b);
          }}
          onDelete={(id) => {
            setActiveBillForDetails(null);
            onDelete(id);
          }}
          onRefresh={onRefresh}
        />
      )}

      {/* Thermal Slip Modal */}
      {activeBillForThermal && (
        <ThermalReceiptModal
          bill={activeBillForThermal}
          open={Boolean(activeBillForThermal)}
          onOpenChange={(open) => !open && setActiveBillForThermal(null)}
        />
      )}

      {/* Record Payment Modal */}
      {activeBillForPayment && (
        <RecordPaymentModal
          bill={activeBillForPayment}
          open={Boolean(activeBillForPayment)}
          onOpenChange={(open) => !open && setActiveBillForPayment(null)}
          onSuccess={() => {
            setActiveBillForPayment(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
