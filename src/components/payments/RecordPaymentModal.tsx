"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Check, AlertCircle } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { formatINR } from "@/lib/formatters";

interface RecordPaymentModalProps {
  bill: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RecordPaymentModal({
  bill,
  open,
  onOpenChange,
  onSuccess,
}: RecordPaymentModalProps) {
  const payable = parseFloat(bill?.payableAmount || "0");
  const paid = parseFloat(bill?.paidAmount || "0");
  const remaining = Math.max(0, payable - paid);

  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState(String(remaining.toFixed(2)));
  const [paymentMethod, setPaymentMethod] = useState("KSEB Online Portal");
  const [transactionReference, setTransactionReference] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setAmount(String(remaining.toFixed(2)));
    }
  }, [open, remaining]);

  if (!open || !bill) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Please enter a valid positive payment amount");
      }

      const res = await fetch(`/api/bills/${bill.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId: bill.id,
          paymentDate,
          amount: amountNum,
          paymentMethod,
          transactionReference: transactionReference || null,
          receiptNumber: receiptNumber || null,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record payment");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="sm">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          Record Bill Payment
        </DialogTitle>
        <p className="text-xs text-slate-500">
          Bill #{bill.billNumber} • Balance:{" "}
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {formatINR(remaining)}
          </span>
        </p>
      </DialogHeader>

      {error && (
        <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="paymentDate">Payment Date *</Label>
          <Input
            id="paymentDate"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="amount">Amount Paid (₹) *</Label>
          <div className="relative mt-1">
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="font-mono font-bold text-base pr-16"
            />
            <button
              type="button"
              onClick={() => setAmount(String(remaining.toFixed(2)))}
              className="absolute right-2 top-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-1 py-0.5 rounded"
            >
              Full Dues
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="paymentMethod">Payment Method *</Label>
          <Select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
            className="mt-1"
          >
            <option value="KSEB Online Portal">KSEB Online Portal (wss.kseb.in)</option>
            <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Cash Counter">KSEB Section Cash Counter</option>
            <option value="Credit/Debit Card">Credit / Debit Card</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="transactionReference">Transaction ID / Reference</Label>
          <Input
            id="transactionReference"
            value={transactionReference}
            onChange={(e) => setTransactionReference(e.target.value)}
            placeholder="e.g. TXN-KSEB-984210"
            className="mt-1 font-mono"
          />
        </div>

        <div>
          <Label htmlFor="receiptNumber">Receipt Number</Label>
          <Input
            id="receiptNumber"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            placeholder="e.g. RCPT-2026-10-5624"
            className="mt-1 font-mono"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional payment notes..."
            rows={2}
            className="mt-1 text-xs"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Recording..." : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
