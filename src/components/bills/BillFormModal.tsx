"use client";

import React, { useState, useEffect } from "react";
import { Upload, FileText, Check, AlertCircle, RefreshCw, X } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { formatINR, toDecimal2 } from "@/lib/formatters";

interface BillFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billToEdit?: any | null;
  onSuccess: () => void;
}

export function BillFormModal({ open, onOpenChange, billToEdit, onSuccess }: BillFormModalProps) {
  const [consumers, setConsumers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [consumerId, setConsumerId] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billArea, setBillArea] = useState("B02/15/114");
  const [billDate, setBillDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [disconnectionDate, setDisconnectionDate] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [previousReadingDate, setPreviousReadingDate] = useState("");
  const [currentReadingDate, setCurrentReadingDate] = useState("");
  const [billingCycleDays, setBillingCycleDays] = useState(60);

  // TOD Readings
  const [prevReadingNormal, setPrevReadingNormal] = useState("");
  const [currReadingNormal, setCurrReadingNormal] = useState("");
  const [consumedUnitsNormal, setConsumedUnitsNormal] = useState("");

  const [prevReadingOffPeak, setPrevReadingOffPeak] = useState("");
  const [currReadingOffPeak, setCurrReadingOffPeak] = useState("");
  const [consumedUnitsOffPeak, setConsumedUnitsOffPeak] = useState("");

  const [prevReadingPeak, setPrevReadingPeak] = useState("");
  const [currReadingPeak, setCurrReadingPeak] = useState("");
  const [consumedUnitsPeak, setConsumedUnitsPeak] = useState("");

  const [totalUnits, setTotalUnits] = useState("");

  // Charges
  const [energyCharge, setEnergyCharge] = useState("");
  const [duty, setDuty] = useState("");
  const [fuelSurcharge, setFuelSurcharge] = useState("");
  const [fixedCharge, setFixedCharge] = useState("500.00");
  const [meterRent, setMeterRent] = useState("30.00");
  const [roundOff, setRoundOff] = useState("0.00");
  const [arrears, setArrears] = useState("0.00");
  const [totalAmount, setTotalAmount] = useState("");
  const [payableAmount, setPayableAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  // File Attachment
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load consumers and initialize fields
  useEffect(() => {
    fetch("/api/consumers")
      .then((res) => res.json())
      .then((data) => {
        if (data.consumers) {
          setConsumers(data.consumers);
          if (!consumerId && data.defaultConsumer) {
            setConsumerId(data.defaultConsumer.id);
          } else if (!consumerId && data.consumers.length > 0) {
            setConsumerId(data.consumers[0].id);
          }
        }
      })
      .catch(() => {});
  }, [consumerId]);

  useEffect(() => {
    if (billToEdit) {
      setConsumerId(billToEdit.consumerId || "");
      setBillNumber(billToEdit.billNumber || "");
      setBillArea(billToEdit.billArea || "B02/15/114");
      setBillDate(billToEdit.billDate || "");
      setDueDate(billToEdit.dueDate || "");
      setDisconnectionDate(billToEdit.disconnectionDate || "");
      setReadingTime(billToEdit.readingTime || "");
      setPreviousReadingDate(billToEdit.previousReadingDate || "");
      setCurrentReadingDate(billToEdit.currentReadingDate || "");
      setBillingCycleDays(billToEdit.billingCycleDays || 60);

      setPrevReadingNormal(billToEdit.prevReadingNormal || "");
      setCurrReadingNormal(billToEdit.currReadingNormal || "");
      setConsumedUnitsNormal(billToEdit.consumedUnitsNormal || "");

      setPrevReadingOffPeak(billToEdit.prevReadingOffPeak || "");
      setCurrReadingOffPeak(billToEdit.currReadingOffPeak || "");
      setConsumedUnitsOffPeak(billToEdit.consumedUnitsOffPeak || "");

      setPrevReadingPeak(billToEdit.prevReadingPeak || "");
      setCurrReadingPeak(billToEdit.currReadingPeak || "");
      setConsumedUnitsPeak(billToEdit.consumedUnitsPeak || "");

      setTotalUnits(billToEdit.totalUnits || "");
      setEnergyCharge(billToEdit.energyCharge || "");
      setDuty(billToEdit.duty || "");
      setFuelSurcharge(billToEdit.fuelSurcharge || "");
      setFixedCharge(billToEdit.fixedCharge || "500.00");
      setMeterRent(billToEdit.meterRent || "30.00");
      setRoundOff(billToEdit.roundOff || "0.00");
      setArrears(billToEdit.arrears || "0.00");
      setTotalAmount(billToEdit.totalAmount || "");
      setPayableAmount(billToEdit.payableAmount || "");
      setRemarks(billToEdit.remarks || "");
    } else {
      // Default dates for new bill entry
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      setBillDate(todayStr);

      // Due date +10 days
      const due = new Date(now);
      due.setDate(due.getDate() + 10);
      setDueDate(due.toISOString().split("T")[0]);

      // Disconnection date +26 days
      const disconn = new Date(now);
      disconn.setDate(disconn.getDate() + 26);
      setDisconnectionDate(disconn.toISOString().split("T")[0]);

      // Current reading date = today, previous = ~60 days ago
      setCurrentReadingDate(todayStr);
      const prev = new Date(now);
      prev.setDate(prev.getDate() - 61);
      setPreviousReadingDate(prev.toISOString().split("T")[0]);
    }
  }, [billToEdit]);

  // Auto-calculate consumed units for Normal, OffPeak, Peak
  const handleCalculateUnits = () => {
    const pNorm = parseFloat(prevReadingNormal);
    const cNorm = parseFloat(currReadingNormal);
    const uNorm = !isNaN(pNorm) && !isNaN(cNorm) ? Math.max(0, cNorm - pNorm) : parseFloat(consumedUnitsNormal) || 0;

    const pOff = parseFloat(prevReadingOffPeak);
    const cOff = parseFloat(currReadingOffPeak);
    const uOff = !isNaN(pOff) && !isNaN(cOff) ? Math.max(0, cOff - pOff) : parseFloat(consumedUnitsOffPeak) || 0;

    const pPeak = parseFloat(prevReadingPeak);
    const cPeak = parseFloat(currReadingPeak);
    const uPeak = !isNaN(pPeak) && !isNaN(cPeak) ? Math.max(0, cPeak - pPeak) : parseFloat(consumedUnitsPeak) || 0;

    setConsumedUnitsNormal(uNorm > 0 ? String(uNorm) : consumedUnitsNormal);
    setConsumedUnitsOffPeak(uOff > 0 ? String(uOff) : consumedUnitsOffPeak);
    setConsumedUnitsPeak(uPeak > 0 ? String(uPeak) : consumedUnitsPeak);

    const sum = uNorm + uOff + uPeak;
    if (sum > 0) {
      setTotalUnits(String(sum));
    }
  };

  // Auto calculate duty (10% of energy charge) and total charges
  const handleAutoSumCharges = () => {
    const ec = parseFloat(energyCharge) || 0;
    // Duty is typically 10%
    const computedDuty = toDecimal2(ec * 0.1);
    if (!duty || duty === "0" || duty === "0.00") {
      setDuty(computedDuty.toFixed(2));
    }

    const d = parseFloat(duty) || computedDuty;
    const fs = parseFloat(fuelSurcharge) || 0;
    const fc = parseFloat(fixedCharge) || 500;
    const mr = parseFloat(meterRent) || 30;
    const ro = parseFloat(roundOff) || 0;
    const ar = parseFloat(arrears) || 0;

    const sum = toDecimal2(ec + d + fs + fc + mr + ro + ar);
    setTotalAmount(sum.toFixed(2));
    setPayableAmount(sum.toFixed(2));
  };

  // Prefill with sample bill values button
  const handleLoadSampleFromBill = () => {
    setBillNumber("5624261012132");
    setBillArea("B02/15/114");
    setBillDate("2026-10-17");
    setDueDate("2026-10-27");
    setDisconnectionDate("2026-11-12");
    setReadingTime("18/10/2026 11:29:59 AM");
    setPreviousReadingDate("2026-08-17");
    setCurrentReadingDate("2026-10-17");
    setBillingCycleDays(61);

    setPrevReadingNormal("3227");
    setCurrReadingNormal("3575");
    setConsumedUnitsNormal("402");

    setPrevReadingOffPeak("3851");
    setCurrReadingOffPeak("4177");
    setConsumedUnitsOffPeak("322");

    setPrevReadingPeak("410");
    setCurrReadingPeak("422");
    setConsumedUnitsPeak("28");

    setTotalUnits("752");

    setEnergyCharge("4971.92");
    setDuty("497.19");
    setFuelSurcharge("20.58");
    setFixedCharge("500.00");
    setMeterRent("30.00");
    setRoundOff("0.31");
    setArrears("0.00");
    setTotalAmount("6020.00");
    setPayableAmount("6020.00");
    setRemarks("Auto Recovery FS Demand @0.03 Paise/unit (KSERC Tariff Amendment Regulation dtd 29-05-2023)");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!consumerId) throw new Error("Please select a consumer");
      if (!billNumber) throw new Error("Please enter bill number");
      if (!totalUnits) throw new Error("Please enter total units consumed");
      if (!payableAmount) throw new Error("Please enter payable amount");

      const payload = {
        consumerId,
        billNumber,
        billArea,
        billDate,
        dueDate,
        disconnectionDate: disconnectionDate || null,
        readingTime: readingTime || null,
        previousReadingDate,
        currentReadingDate,
        billingCycleDays: Number(billingCycleDays || 60),
        isBiMonthly: true,
        prevReadingNormal: prevReadingNormal ? parseFloat(prevReadingNormal) : null,
        currReadingNormal: currReadingNormal ? parseFloat(currReadingNormal) : null,
        consumedUnitsNormal: consumedUnitsNormal ? parseFloat(consumedUnitsNormal) : null,
        prevReadingOffPeak: prevReadingOffPeak ? parseFloat(prevReadingOffPeak) : null,
        currReadingOffPeak: currReadingOffPeak ? parseFloat(currReadingOffPeak) : null,
        consumedUnitsOffPeak: consumedUnitsOffPeak ? parseFloat(consumedUnitsOffPeak) : null,
        prevReadingPeak: prevReadingPeak ? parseFloat(prevReadingPeak) : null,
        currReadingPeak: currReadingPeak ? parseFloat(currReadingPeak) : null,
        consumedUnitsPeak: consumedUnitsPeak ? parseFloat(consumedUnitsPeak) : null,
        totalUnits: parseFloat(totalUnits),
        energyCharge: parseFloat(energyCharge || "0"),
        duty: parseFloat(duty || "0"),
        fuelSurcharge: parseFloat(fuelSurcharge || "0"),
        fixedCharge: parseFloat(fixedCharge || "0"),
        meterRent: parseFloat(meterRent || "0"),
        roundOff: parseFloat(roundOff || "0"),
        arrears: parseFloat(arrears || "0"),
        totalAmount: parseFloat(totalAmount || payableAmount),
        payableAmount: parseFloat(payableAmount),
        remarks: remarks || null,
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const url = billToEdit ? `/api/bills/${billToEdit.id}` : "/api/bills";
      const method = billToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save bill");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="xl">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle>{billToEdit ? "Edit KSEB Electricity Bill" : "Record New KSEB Electricity Bill"}</DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter bill particulars matching the spot demand/disconnection notice
            </p>
          </div>
          {!billToEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadSampleFromBill}
              className="mr-8 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            >
              Autofill Sample Bill
            </Button>
          )}
        </div>
      </DialogHeader>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-1">
        {/* Section 1: Consumer & Bill Identity */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            1. Consumer & Bill Identification
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="consumerId">KSEB Consumer *</Label>
              <Select
                id="consumerId"
                value={consumerId}
                onChange={(e) => setConsumerId(e.target.value)}
                required
                className="mt-1"
              >
                {consumers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.consumerNumber})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="billNumber">Bill Number (ബിൽ നം) *</Label>
              <Input
                id="billNumber"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="e.g. 5624261012132"
                required
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="billArea">Bill Area (ബിൽ ഏരിയ)</Label>
              <Input
                id="billArea"
                value={billArea}
                onChange={(e) => setBillArea(e.target.value)}
                placeholder="e.g. B02/15/114"
                className="mt-1 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Important Dates */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            2. Billing Period & Due Dates (Asia/Kolkata)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="billDate">Bill Date (ബിൽ തീയതി) *</Label>
              <Input
                id="billDate"
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dueDate" className="text-rose-600 dark:text-rose-400">
                Due Date Without Fine (പിഴ തീയതി) *
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="mt-1 border-rose-300 dark:border-rose-900/60"
              />
            </div>

            <div>
              <Label htmlFor="disconnectionDate">Disconnection Date (വിച്ഛേദന തീയതി)</Label>
              <Input
                id="disconnectionDate"
                type="date"
                value={disconnectionDate}
                onChange={(e) => setDisconnectionDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="previousReadingDate">Previous Reading Date *</Label>
              <Input
                id="previousReadingDate"
                type="date"
                value={previousReadingDate}
                onChange={(e) => setPreviousReadingDate(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="currentReadingDate">Current Reading Date *</Label>
              <Input
                id="currentReadingDate"
                type="date"
                value={currentReadingDate}
                onChange={(e) => setCurrentReadingDate(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="readingTime">Reading Time</Label>
              <Input
                id="readingTime"
                value={readingTime}
                onChange={(e) => setReadingTime(e.target.value)}
                placeholder="18/10/2026 11:29:59 AM"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Section 3: TOD Meter Readings & Units */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              3. Time-Of-Day (TOD) Readings & Consumption
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCalculateUnits}
              className="text-xs h-7 gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Compute Units
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                  <th className="pb-2">TOD Tariff Zone</th>
                  <th className="pb-2">Previous Reading</th>
                  <th className="pb-2">Current Reading</th>
                  <th className="pb-2">Consumed Units (kWh)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800">
                <tr>
                  <td className="py-2 font-medium">Normal - KWH(NL)</td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      step="any"
                      value={prevReadingNormal}
                      onChange={(e) => setPrevReadingNormal(e.target.value)}
                      placeholder="e.g. 3227"
                      className="h-8 font-mono"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      step="any"
                      value={currReadingNormal}
                      onChange={(e) => setCurrReadingNormal(e.target.value)}
                      placeholder="e.g. 3575"
                      className="h-8 font-mono"
                    />
                  </td>
                  <td className="py-2">
                    <Input
                      type="number"
                      step="any"
                      value={consumedUnitsNormal}
                      onChange={(e) => setConsumedUnitsNormal(e.target.value)}
                      placeholder="e.g. 402"
                      className="h-8 font-mono font-bold"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="py-2 font-medium">Off-Peak - KWH(OP)</td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      step="any"
                      value={prevReadingOffPeak}
                      onChange={(e) => setPrevReadingOffPeak(e.target.value)}
                      placeholder="e.g. 3851"
                      className="h-8 font-mono"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      step="any"
                      value={currReadingOffPeak}
                      onChange={(e) => setCurrReadingOffPeak(e.target.value)}
                      placeholder="e.g. 4177"
                      className="h-8 font-mono"
                    />
                  </td>
                  <td className="py-2">
                    <Input
                      type="number"
                      step="any"
                      value={consumedUnitsOffPeak}
                      onChange={(e) => setConsumedUnitsOffPeak(e.target.value)}
                      placeholder="e.g. 322"
                      className="h-8 font-mono font-bold"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="py-2 font-medium">Peak - KWH(PK)</td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      step="any"
                      value={prevReadingPeak}
                      onChange={(e) => setPrevReadingPeak(e.target.value)}
                      placeholder="e.g. 410"
                      className="h-8 font-mono"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      step="any"
                      value={currReadingPeak}
                      onChange={(e) => setCurrReadingPeak(e.target.value)}
                      placeholder="e.g. 422"
                      className="h-8 font-mono"
                    />
                  </td>
                  <td className="py-2">
                    <Input
                      type="number"
                      step="any"
                      value={consumedUnitsPeak}
                      onChange={(e) => setConsumedUnitsPeak(e.target.value)}
                      placeholder="e.g. 28"
                      className="h-8 font-mono font-bold"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold">Total Consumed Units (ആകെ ഉപയോഗിച്ച യൂണിറ്റ്) *</span>
            <div className="w-48">
              <Input
                type="number"
                step="any"
                value={totalUnits}
                onChange={(e) => setTotalUnits(e.target.value)}
                placeholder="752"
                required
                className="font-mono font-black text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Charges Breakdown */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              4. Charges Breakdown (ബിൽ വിവരങ്ങൾ - INR ₹)
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoSumCharges}
              className="text-xs h-7 gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Sum Charges
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="energyCharge">Energy Charge (₹)</Label>
              <Input
                id="energyCharge"
                type="number"
                step="0.01"
                value={energyCharge}
                onChange={(e) => setEnergyCharge(e.target.value)}
                placeholder="4971.92"
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="duty">Electricity Duty (₹)</Label>
              <Input
                id="duty"
                type="number"
                step="0.01"
                value={duty}
                onChange={(e) => setDuty(e.target.value)}
                placeholder="497.19"
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="fuelSurcharge">Fuel Surcharge (₹)</Label>
              <Input
                id="fuelSurcharge"
                type="number"
                step="0.01"
                value={fuelSurcharge}
                onChange={(e) => setFuelSurcharge(e.target.value)}
                placeholder="20.58"
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="fixedCharge">Fixed Charge (₹)</Label>
              <Input
                id="fixedCharge"
                type="number"
                step="0.01"
                value={fixedCharge}
                onChange={(e) => setFixedCharge(e.target.value)}
                placeholder="500.00"
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="meterRent">Meter Rent (₹)</Label>
              <Input
                id="meterRent"
                type="number"
                step="0.01"
                value={meterRent}
                onChange={(e) => setMeterRent(e.target.value)}
                placeholder="30.00"
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="roundOff">Round Off (₹)</Label>
              <Input
                id="roundOff"
                type="number"
                step="0.01"
                value={roundOff}
                onChange={(e) => setRoundOff(e.target.value)}
                placeholder="0.31"
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="arrears">Arrears / Dues (₹)</Label>
              <Input
                id="arrears"
                type="number"
                step="0.01"
                value={arrears}
                onChange={(e) => setArrears(e.target.value)}
                placeholder="0.00"
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="payableAmount" className="font-bold text-emerald-600 dark:text-emerald-400">
                Payable Amount (₹) *
              </Label>
              <Input
                id="payableAmount"
                type="number"
                step="0.01"
                value={payableAmount}
                onChange={(e) => {
                  setPayableAmount(e.target.value);
                  setTotalAmount(e.target.value);
                }}
                placeholder="6020.00"
                required
                className="mt-1 font-mono font-bold text-base border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Document Attachment & Remarks */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            5. PDF Attachment & Remarks
          </h4>

          <div>
            <Label htmlFor="file">Upload Original Bill (PDF / Scan / Photo)</Label>
            <div className="mt-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
              <input
                id="file"
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label htmlFor="file" className="cursor-pointer flex flex-col items-center gap-1.5">
                <Upload className="h-6 w-6 text-slate-400" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {selectedFile ? selectedFile.name : "Click to select PDF or image file"}
                </span>
                <span className="text-[10px] text-slate-400">PDF, JPG, PNG or WEBP up to 10MB</span>
              </label>
              {selectedFile && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-rose-500 hover:text-rose-600 text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="remarks">Remarks / Demand Notes</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Auto Recovery FS Demand @0.03 Paise/unit..."
              rows={2}
              className="mt-1"
            />
          </div>
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
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? "Saving..." : billToEdit ? "Update Bill" : "Save Bill Entry"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
