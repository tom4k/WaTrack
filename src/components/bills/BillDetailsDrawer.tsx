"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  Download,
  CreditCard,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
  Zap,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatKolkataDate, formatUnits, formatIndianNumber, getDueStatus } from "@/lib/formatters";
import { ThermalReceiptModal } from "./ThermalReceiptModal";
import { RecordPaymentModal } from "@/components/payments/RecordPaymentModal";

interface BillDetailsDrawerProps {
  billId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (bill: any) => void;
  onDelete: (billId: string) => void;
  onRefresh: () => void;
}

export function BillDetailsDrawer({
  billId,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onRefresh,
}: BillDetailsDrawerProps) {
  const [bill, setBill] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isThermalOpen, setIsThermalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchBill = async () => {
    if (!billId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bills/${billId}`);
      if (res.ok) {
        const data = await res.json();
        setBill(data.bill);
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && billId) {
      fetchBill();
    }
  }, [open, billId]);

  if (!bill) return null;

  const payable = parseFloat(bill.payableAmount || "0");
  const paid = parseFloat(bill.paidAmount || "0");
  const balance = Math.max(0, payable - paid);
  const dueInfo = getDueStatus(bill.dueDate);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="default">Paid in Full</Badge>;
      case "PARTIALLY_PAID":
        return <Badge variant="warning">Partially Paid</Badge>;
      case "OVERDUE":
        return <Badge variant="destructive">Overdue ({dueInfo.label})</Badge>;
      default:
        return <Badge variant="outline">Unpaid ({dueInfo.label})</Badge>;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} size="lg">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-6">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle>KSEB Bill #{bill.billNumber}</DialogTitle>
                {getStatusBadge(bill.status)}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Consumer C#: {bill.consumerNumber || "1156241018150"} • {bill.consumerName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Quick Balance Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Outstanding Balance
              </span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {formatINR(balance)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Total Bill: <span className="text-white font-mono">{formatINR(payable)}</span> • Paid:{" "}
                <span className="text-emerald-300 font-mono">{formatINR(paid)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {balance > 0 && (
                <Button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-9 gap-1.5"
                >
                  <CreditCard className="h-4 w-4" />
                  Record Payment
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsThermalOpen(true)}
                className="text-xs h-9 gap-1.5 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              >
                <Receipt className="h-4 w-4" />
                KSEB Thermal Slip
              </Button>
            </div>
          </div>

          {/* Key Dates & Consumption Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Bill Date</span>
              <p className="text-sm font-semibold mt-0.5">{formatKolkataDate(bill.billDate)}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-rose-500">Due Date</span>
              <p className="text-sm font-semibold mt-0.5 text-rose-600 dark:text-rose-400">
                {formatKolkataDate(bill.dueDate)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Billing Cycle</span>
              <p className="text-sm font-semibold mt-0.5">{bill.billingCycleDays || 60} Days</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-emerald-500">Billed Units</span>
              <p className="text-sm font-black font-mono mt-0.5 text-emerald-600 dark:text-emerald-400">
                {formatUnits(bill.totalUnits)}
              </p>
            </div>
          </div>

          {/* Meter Readings & TOD Consumption Table */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3 bg-slate-50/40 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Meter Readings & Consumption (റീഡിങ്ങും ഉപഭോഗവും)
                </h4>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Meter No: {bill.meterSerialNumber || "HEP7198657"} • Status: Working • Mult. Factor: 1.00
                </p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Time-Of-Day (TOD)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-semibold">
                    <th className="text-left py-1.5">Zone (യൂണിറ്റ്)</th>
                    <th className="py-1.5">Current (നിലവിൽ)</th>
                    <th className="py-1.5">Past (മുൻ)</th>
                    <th className="py-1.5">Used Units (ഉപഭോഗം)</th>
                    <th className="py-1.5 text-emerald-600 dark:text-emerald-400 font-bold">ശരാശരി (Sharasheri)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  <tr>
                    <td className="text-left py-2 font-sans text-slate-700 dark:text-slate-300 font-medium">
                      Normal <span className="text-[10px] text-slate-400 block font-mono">06:00 AM – 06:00 PM</span>
                    </td>
                    <td className="py-2 text-slate-800 dark:text-slate-200">{bill.currReadingNormal || "3575"}</td>
                    <td className="py-2 text-slate-500">{bill.prevReadingNormal || "3227"}</td>
                    <td className="py-2 font-semibold text-slate-700 dark:text-slate-300">
                      {bill.usedUnitsNormal || (bill.currReadingNormal && bill.prevReadingNormal ? (parseFloat(bill.currReadingNormal) - parseFloat(bill.prevReadingNormal)).toFixed(0) : "348")}
                    </td>
                    <td className="py-2 font-bold text-emerald-600 dark:text-emerald-400">
                      {bill.consumedUnitsNormal || "402"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left py-2 font-sans text-slate-700 dark:text-slate-300 font-medium">
                      Off-Peak <span className="text-[10px] text-slate-400 block font-mono">10:00 PM – 06:00 AM</span>
                    </td>
                    <td className="py-2 text-slate-800 dark:text-slate-200">{bill.currReadingOffPeak || "4177"}</td>
                    <td className="py-2 text-slate-500">{bill.prevReadingOffPeak || "3851"}</td>
                    <td className="py-2 font-semibold text-slate-700 dark:text-slate-300">
                      {bill.usedUnitsOffPeak || (bill.currReadingOffPeak && bill.prevReadingOffPeak ? (parseFloat(bill.currReadingOffPeak) - parseFloat(bill.prevReadingOffPeak)).toFixed(0) : "326")}
                    </td>
                    <td className="py-2 font-bold text-emerald-600 dark:text-emerald-400">
                      {bill.consumedUnitsOffPeak || "322"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left py-2 font-sans text-slate-700 dark:text-slate-300 font-medium">
                      Peak <span className="text-[10px] text-slate-400 block font-mono">06:00 PM – 10:00 PM</span>
                    </td>
                    <td className="py-2 text-slate-800 dark:text-slate-200">{bill.currReadingPeak || "422"}</td>
                    <td className="py-2 text-slate-500">{bill.prevReadingPeak || "410"}</td>
                    <td className="py-2 font-semibold text-slate-700 dark:text-slate-300">
                      {bill.usedUnitsPeak || (bill.currReadingPeak && bill.prevReadingPeak ? (parseFloat(bill.currReadingPeak) - parseFloat(bill.prevReadingPeak)).toFixed(0) : "12")}
                    </td>
                    <td className="py-2 font-bold text-emerald-600 dark:text-emerald-400">
                      {bill.consumedUnitsPeak || "28"}
                    </td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-700 font-bold">
                    <td className="text-left py-2 text-slate-900 dark:text-slate-100">
                      Total Consumption
                    </td>
                    <td colSpan={2} className="py-2 text-xs text-slate-500 font-sans font-normal">
                      Raw Meter Usage vs Billed Sharasheri
                    </td>
                    <td className="py-2 text-slate-800 dark:text-slate-200">
                      {bill.totalUsedUnits || "686"} kWh
                    </td>
                    <td className="py-2 text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatUnits(bill.totalUnits)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* KSEB Sharasheri (ശരാശരി) Assessment Audit */}
            {(() => {
              const rawUsed = bill.totalUsedUnits ? parseFloat(bill.totalUsedUnits) : (bill.currReadingNormal && bill.prevReadingNormal ? 686 : null);
              const billedUnits = bill.totalUnits || 0;
              const isSharasheri = rawUsed !== null && Math.abs(billedUnits - rawUsed) > 0.01;
              const diff = rawUsed !== null ? billedUnits - rawUsed : 0;
              const pct = rawUsed && rawUsed > 0 ? ((diff / rawUsed) * 100) : 0;
              const estRate = bill.amount && billedUnits > 0 ? bill.amount / billedUnits : 8.01;
              const financialImpact = diff * estRate;

              return (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/20 dark:border-amber-700/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚖️</span>
                      <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                        KSEB Sharasheri (ശരാശരി) Billing Analysis
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300">
                      Kerala Supply Code Reg 125/126
                    </span>
                  </div>

                  <p className="text-xs text-amber-900/80 dark:text-amber-300/90 leading-relaxed">
                    The 5th column represents <strong>&ldquo;ശരാശരി&rdquo; (Assessed Average Consumption)</strong>.
                    {isSharasheri ? (
                      <> Billed consumption (<strong>{billedUnits} kWh</strong>) {diff > 0 ? "exceeds" : "is below"} actual meter usage (<strong>{rawUsed} kWh</strong>) by <strong className={diff > 0 ? "text-amber-700 dark:text-amber-400" : "text-emerald-600"}>{diff > 0 ? `+${diff.toFixed(0)}` : diff.toFixed(0)} kWh ({pct > 0 ? `+${pct.toFixed(1)}` : `${pct.toFixed(1)}`}%)</strong>. Estimated financial differential: <strong className="font-mono">₹{Math.abs(financialImpact).toFixed(2)}</strong>.</>
                    ) : (
                      <> Physical meter readings match the assessed billed units exactly.</>
                    )}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
                    <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-200/70 dark:border-amber-900/40 text-center">
                      <div className="text-[10px] text-slate-500 font-sans uppercase font-medium">Meter Used (ഉപഭോഗം)</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{rawUsed || "686"} kWh</div>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-200/70 dark:border-amber-900/40 text-center">
                      <div className="text-[10px] text-slate-500 font-sans uppercase font-medium">Billed (ശരാശരി)</div>
                      <div className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">{billedUnits} kWh</div>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-amber-200/70 dark:border-amber-900/40 text-center">
                      <div className="text-[10px] text-slate-500 font-sans uppercase font-medium">Variance (വ്യത്യാസം)</div>
                      <div className={`font-bold mt-0.5 ${diff > 0 ? "text-amber-700 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {diff > 0 ? `+${diff.toFixed(0)}` : diff.toFixed(0)} kWh
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Charges Breakdown */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Charges Breakdown (ബിൽ വിവരങ്ങൾ)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 text-xs">
              <div className="flex justify-between pr-4">
                <span className="text-slate-500">Energy Charge:</span>
                <span className="font-mono font-medium">{formatINR(bill.energyCharge)}</span>
              </div>
              <div className="flex justify-between pr-4">
                <span className="text-slate-500">Electricity Duty (10%):</span>
                <span className="font-mono font-medium">{formatINR(bill.duty)}</span>
              </div>
              <div className="flex justify-between pr-4">
                <span className="text-slate-500">Fuel Surcharge:</span>
                <span className="font-mono font-medium">{formatINR(bill.fuelSurcharge)}</span>
              </div>
              <div className="flex justify-between pr-4">
                <span className="text-slate-500">Fixed Charge:</span>
                <span className="font-mono font-medium">{formatINR(bill.fixedCharge)}</span>
              </div>
              <div className="flex justify-between pr-4">
                <span className="text-slate-500">Meter Rent:</span>
                <span className="font-mono font-medium">{formatINR(bill.meterRent)}</span>
              </div>
              <div className="flex justify-between pr-4">
                <span className="text-slate-500">Round Off:</span>
                <span className="font-mono font-medium">{bill.roundOff || "0.00"}</span>
              </div>
            </div>
          </div>

          {/* Document Attachment & Remarks */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attached Document
              </span>
              {bill.documentPath ? (
                <a
                  href={`/api/documents/${encodeURIComponent(bill.documentPath)}?name=${encodeURIComponent(
                    bill.documentOriginalName || "KSEB_Bill.pdf"
                  )}&download=true`}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download ({bill.documentOriginalName || "Attached PDF"})
                </a>
              ) : (
                <span className="text-xs text-slate-400">No document attached</span>
              )}
            </div>
            {bill.remarks && (
              <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                <span className="font-semibold">Remarks:</span> {bill.remarks}
              </p>
            )}
          </div>

          {/* Payment History for this Bill */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment History ({payments.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-xs h-7 gap-1"
              >
                <CreditCard className="h-3 w-3" />
                Add Payment
              </Button>
            </div>

            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">
                No payments logged yet for this bill.
              </p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{formatINR(p.amount)}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 dark:text-slate-400">{p.paymentMethod}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {formatKolkataDate(p.paymentDate)} • Ref: {p.transactionReference || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(bill.id)}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Bill
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(bill);
                }}
                className="gap-1.5 text-xs"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit Details
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Spot Bill Thermal Slip Modal */}
      {isThermalOpen && (
        <ThermalReceiptModal
          bill={bill}
          open={isThermalOpen}
          onOpenChange={setIsThermalOpen}
        />
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <RecordPaymentModal
          bill={bill}
          open={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            fetchBill();
            onRefresh();
          }}
        />
      )}
    </>
  );
}
