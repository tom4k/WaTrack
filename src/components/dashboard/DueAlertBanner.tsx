"use client";

import React from "react";
import { AlertTriangle, Clock, ArrowRight, ExternalLink, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR, formatKolkataDate } from "@/lib/formatters";

interface DueAlertBannerProps {
  nextDueBill: any;
  onPayClick: (bill: any) => void;
  onViewSlipClick: (bill: any) => void;
}

export function DueAlertBanner({ nextDueBill, onPayClick, onViewSlipClick }: DueAlertBannerProps) {
  if (!nextDueBill) return null;

  const isOverdue = nextDueBill.isOverdue;
  const days = Math.abs(nextDueBill.daysRemaining);

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-sm ${
        isOverdue
          ? "bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-100"
          : "bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-100"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            isOverdue
              ? "bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300"
              : "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300"
          }`}
        >
          {isOverdue ? <AlertTriangle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isOverdue
                  ? "bg-rose-200 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200"
                  : "bg-amber-200 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200"
              }`}
            >
              {isOverdue ? `Overdue by ${days} days` : `Payment Due in ${days} days`}
            </span>
            <span className="text-xs font-mono text-slate-500">Bill #{nextDueBill.billNumber}</span>
          </div>

          <p className="font-semibold text-sm mt-1">
            Payable Amount:{" "}
            <span className="font-mono font-bold text-base">{formatINR(nextDueBill.amount)}</span>{" "}
            due by {formatKolkataDate(nextDueBill.dueDate)}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Disconnection notice active as per Reg-122 of Supply Code. Pay before fine date.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          size="sm"
          onClick={() => onPayClick(nextDueBill)}
          className={`w-full sm:w-auto text-xs gap-1.5 font-semibold ${
            isOverdue
              ? "bg-rose-600 hover:bg-rose-700 text-white"
              : "bg-amber-600 hover:bg-amber-700 text-white"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          Record Payment
        </Button>
        <a
          href="https://wss.kseb.in"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center h-8 px-3 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-white/50 dark:hover:bg-slate-800/50 gap-1"
        >
          <span>KSEB Quick Pay</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
