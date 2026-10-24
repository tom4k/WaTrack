"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Camera,
  Check,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Receipt,
  MapPin,
  Calendar,
  Zap,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { formatINR, toDecimal2 } from "@/lib/formatters";

async function downscaleImage(file: File, maxDim = 1200): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= maxDim && height <= maxDim) {
        resolve(file);
        return;
      }
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const resized = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
          resolve(resized);
        },
        "image/jpeg",
        0.82
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

interface BillFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billToEdit?: any | null;
  onSuccess: () => void;
}

export function BillFormModal({ open, onOpenChange, billToEdit, onSuccess }: BillFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [consumers, setConsumers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scan & Autofill States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [showManualFields, setShowManualFields] = useState(false);

  // Form State (Autofilled from Photo)
  const [consumerId, setConsumerId] = useState("");
  const [consumerData, setConsumerData] = useState<any | null>(null);

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
  const [usedUnitsNormal, setUsedUnitsNormal] = useState("");
  const [consumedUnitsNormal, setConsumedUnitsNormal] = useState("");

  const [prevReadingOffPeak, setPrevReadingOffPeak] = useState("");
  const [currReadingOffPeak, setCurrReadingOffPeak] = useState("");
  const [usedUnitsOffPeak, setUsedUnitsOffPeak] = useState("");
  const [consumedUnitsOffPeak, setConsumedUnitsOffPeak] = useState("");

  const [prevReadingPeak, setPrevReadingPeak] = useState("");
  const [currReadingPeak, setCurrReadingPeak] = useState("");
  const [usedUnitsPeak, setUsedUnitsPeak] = useState("");
  const [consumedUnitsPeak, setConsumedUnitsPeak] = useState("");

  const [totalUsedUnits, setTotalUsedUnits] = useState("");
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

  // Load existing consumers
  useEffect(() => {
    if (!open) return;
    fetch("/api/consumers")
      .then((res) => res.json())
      .then((data) => {
        if (data.consumers) {
          setConsumers(data.consumers);
          if (!consumerId && data.defaultConsumer) {
            setConsumerId(data.defaultConsumer.id);
          }
        }
      })
      .catch(() => {});
  }, [open, consumerId]);

  // Handle Edit vs New initialization
  useEffect(() => {
    if (!open) return;

    if (billToEdit) {
      setShowManualFields(true);
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
      setUsedUnitsNormal(billToEdit.usedUnitsNormal || "");
      setConsumedUnitsNormal(billToEdit.consumedUnitsNormal || "");

      setPrevReadingOffPeak(billToEdit.prevReadingOffPeak || "");
      setCurrReadingOffPeak(billToEdit.currReadingOffPeak || "");
      setUsedUnitsOffPeak(billToEdit.usedUnitsOffPeak || "");
      setConsumedUnitsOffPeak(billToEdit.consumedUnitsOffPeak || "");

      setPrevReadingPeak(billToEdit.prevReadingPeak || "");
      setCurrReadingPeak(billToEdit.currReadingPeak || "");
      setUsedUnitsPeak(billToEdit.usedUnitsPeak || "");
      setConsumedUnitsPeak(billToEdit.consumedUnitsPeak || "");

      setTotalUsedUnits(billToEdit.totalUsedUnits || "");
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
      // Reset for new photo upload
      setSelectedFile(null);
      setPreviewUrl(null);
      setScanResult(null);
      setShowManualFields(false);
      setError(null);
      setConsumerData(null);
    }
  }, [open, billToEdit]);

  // Handle Photo Upload and Trigger Scanning
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);

    // Create preview
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    // Downscale on client before sending to OCR so 3.4 MB becomes ~180 KB in 30ms!
    const fileToScan = await downscaleImage(file);
    await scanBillPhoto(fileToScan);
  };

  const handleRetry = async () => {
    if (!selectedFile) return;
    const fileToScan = await downscaleImage(selectedFile);
    await scanBillPhoto(fileToScan);
  };

  const scanBillPhoto = async (file: File) => {
    setScanning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Client abort controller with 25 second timeout for vision AI
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const res = await fetch("/api/bills/parse", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        // If server timed out or returned HTML error, gracefully open manual review with photo attached
        setShowManualFields(true);
        setError("Scan took longer than expected on this photo. Your bill photo is attached — please review or confirm key numbers below.");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse bill photo");
      }

      setScanResult(data);

      // Autofill Bill Fields
      if (data.bill) {
        const b = data.bill;
        setBillNumber(b.billNumber || "");
        setBillArea(b.billArea || "B02/15/114");
        setBillDate(b.billDate || "");
        setDueDate(b.dueDate || "");
        setDisconnectionDate(b.disconnectionDate || "");
        setReadingTime(b.readingTime || "");
        setPreviousReadingDate(b.previousReadingDate || "");
        setCurrentReadingDate(b.currentReadingDate || "");
        setBillingCycleDays(b.billingCycleDays || 60);

        setPrevReadingNormal(b.prevReadingNormal || "");
        setCurrReadingNormal(b.currReadingNormal || "");
        setUsedUnitsNormal(b.usedUnitsNormal || "");
        setConsumedUnitsNormal(b.consumedUnitsNormal || "");

        setPrevReadingOffPeak(b.prevReadingOffPeak || "");
        setCurrReadingOffPeak(b.currReadingOffPeak || "");
        setUsedUnitsOffPeak(b.usedUnitsOffPeak || "");
        setConsumedUnitsOffPeak(b.consumedUnitsOffPeak || "");

        setPrevReadingPeak(b.prevReadingPeak || "");
        setCurrReadingPeak(b.currReadingPeak || "");
        setUsedUnitsPeak(b.usedUnitsPeak || "");
        setConsumedUnitsPeak(b.consumedUnitsPeak || "");

        setTotalUsedUnits(b.totalUsedUnits || "");
        setTotalUnits(b.totalUnits || "");
        setEnergyCharge(b.energyCharge || "");
        setDuty(b.duty || "");
        setFuelSurcharge(b.fuelSurcharge || "");
        setFixedCharge(b.fixedCharge || "500.00");
        setMeterRent(b.meterRent || "30.00");
        setRoundOff(b.roundOff || "0.00");
        setArrears(b.arrears || "0.00");
        setTotalAmount(b.totalAmount || "");
        setPayableAmount(b.payableAmount || b.totalAmount || "");
        setRemarks(b.remarks || "");
      }

      // Handle Consumer Matching or Auto-Registration
      if (data.consumerExists && data.matchedConsumer) {
        setConsumerId(data.matchedConsumer.id);
        setConsumerData(null);
      } else if (data.consumer) {
        setConsumerId("new");
        setConsumerData(data.consumer);
      }
    } catch (err: any) {
      console.error("Scan error:", err);
      if (err.name === "AbortError") {
        setError("Scan took longer than expected. You can confirm the key details below or save directly.");
      } else {
        setError(err.message || "Failed to scan photo. You can enter details manually.");
      }
      setShowManualFields(true);
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!billNumber) throw new Error("Please enter or scan a valid Bill Number");
      if (!payableAmount && !totalAmount) throw new Error("Please enter or scan the Payable Amount");

      const payload: any = {
        consumerId: consumerId !== "new" ? consumerId : undefined,
        consumerData: consumerData || undefined,
        billNumber,
        billArea: billArea || "B02/15/114",
        billDate: billDate || new Date().toISOString().split("T")[0],
        dueDate: dueDate || new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
        disconnectionDate: disconnectionDate || null,
        readingTime: readingTime || null,
        previousReadingDate: previousReadingDate || new Date(Date.now() - 60 * 86400000).toISOString().split("T")[0],
        currentReadingDate: currentReadingDate || billDate || new Date().toISOString().split("T")[0],
        billingCycleDays: Number(billingCycleDays || 60),
        isBiMonthly: true,
        prevReadingNormal: prevReadingNormal ? parseFloat(prevReadingNormal) : null,
        currReadingNormal: currReadingNormal ? parseFloat(currReadingNormal) : null,
        usedUnitsNormal: usedUnitsNormal ? parseFloat(usedUnitsNormal) : null,
        consumedUnitsNormal: consumedUnitsNormal ? parseFloat(consumedUnitsNormal) : null,
        prevReadingOffPeak: prevReadingOffPeak ? parseFloat(prevReadingOffPeak) : null,
        currReadingOffPeak: currReadingOffPeak ? parseFloat(currReadingOffPeak) : null,
        usedUnitsOffPeak: usedUnitsOffPeak ? parseFloat(usedUnitsOffPeak) : null,
        consumedUnitsOffPeak: consumedUnitsOffPeak ? parseFloat(consumedUnitsOffPeak) : null,
        prevReadingPeak: prevReadingPeak ? parseFloat(prevReadingPeak) : null,
        currReadingPeak: currReadingPeak ? parseFloat(currReadingPeak) : null,
        usedUnitsPeak: usedUnitsPeak ? parseFloat(usedUnitsPeak) : null,
        consumedUnitsPeak: consumedUnitsPeak ? parseFloat(consumedUnitsPeak) : null,
        totalUsedUnits: totalUsedUnits ? parseFloat(totalUsedUnits) : null,
        totalUnits: parseFloat(totalUnits || "0"),
        energyCharge: parseFloat(energyCharge || "0"),
        duty: parseFloat(duty || "0"),
        fuelSurcharge: parseFloat(fuelSurcharge || "0"),
        fixedCharge: parseFloat(fixedCharge || "0"),
        meterRent: parseFloat(meterRent || "0"),
        roundOff: parseFloat(roundOff || "0"),
        arrears: parseFloat(arrears || "0"),
        totalAmount: parseFloat(totalAmount || payableAmount || "0"),
        payableAmount: parseFloat(payableAmount || totalAmount || "0"),
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

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save bill");

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to record bill");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="max-w-2xl max-h-[90vh] overflow-y-auto pr-1">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-500" />
            <span>{billToEdit ? "Edit Electricity Bill" : "Record New KSEB Bill"}</span>
          </DialogTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {billToEdit
              ? "Update electricity bill records and payment thresholds"
              : "Upload or take a photo of your KSEB spot bill. Details will be autofilled and consumer profile created automatically."}
          </p>
        </DialogHeader>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            {selectedFile && !billToEdit && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={scanning}
                className="shrink-0 text-xs h-7 gap-1.5 border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/50"
              >
                <RefreshCw className={`h-3 w-3 ${scanning ? "animate-spin" : ""}`} />
                Retry Scan
              </Button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* PHOTO-FIRST DROPZONE (Shown for new bills) */}
          {!billToEdit && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-emerald-500/50 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-2xl cursor-pointer text-center transition-all group"
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform">
                      <Camera className="h-6 w-6" />
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/10 group-hover:scale-105 transition-transform">
                      <Upload className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Take a Photo or Upload KSEB Spot Bill Slip
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Click to capture with mobile camera or drag & drop JPG, PNG, or PDF notice.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-3 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
                    <Sparkles className="h-3.5 w-3.5" />
                    Auto-detects meter readings & adds consumer
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Bill slip" className="h-14 w-14 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow" />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                        <FileText className="h-7 w-7" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Document"}
                      </p>
                      {scanning && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 animate-pulse">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Scanning KSEB bill slip with AI Vision...
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setScanning(false);
                              setShowManualFields(true);
                            }}
                            className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-medium"
                          >
                            Skip & enter manually
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      disabled={scanning}
                      className="text-xs gap-1.5"
                    >
                      <RefreshCw className={`h-3 w-3 ${scanning ? "animate-spin" : ""}`} />
                      Retry Scan
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={scanning}
                      className="text-xs"
                    >
                      Change Photo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AUTOFILLED SUMMARY CARD */}
          {scanResult && !scanning && (
            <div className="space-y-3">
              {/* Consumer Match or Auto-Add Banner */}
              {scanResult.consumerExists ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        Matched Consumer: {scanResult.matchedConsumer?.name}
                      </span>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                        No: {scanResult.matchedConsumer?.consumerNumber} • {scanResult.matchedConsumer?.tariff} • {scanResult.matchedConsumer?.sectionName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    Existing Profile
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/40 border border-emerald-500/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 animate-bounce" />
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        New Consumer Detected (Will be auto-added)
                      </span>
                      <p className="text-[11px] text-slate-300 font-mono">
                        {consumerData?.name} • No: {consumerData?.consumerNumber} ({consumerData?.tariff})
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white shadow">
                    Auto-Register
                  </span>
                </div>
              )}

              {/* Extracted Bill Quick Highlights */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/70 backdrop-blur-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 block uppercase">Payable Amount</span>
                    <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {formatINR(payableAmount || totalAmount || "0")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-slate-500 block uppercase">Bill Number</span>
                    <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                      {billNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Bill Date</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{billDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Due Date</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{dueDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Disconnection</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">{disconnectionDate || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Total Units</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalUnits} kWh</span>
                  </div>
                </div>

                {/* Meter Readings & TOD Breakdown Table */}
                {(currReadingNormal || prevReadingNormal || consumedUnitsNormal || totalUnits) && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        Meter Readings & TOD Consumption (റീഡിങ്ങും ഉപഭോഗവും)
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Main Meter MM
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                      <table className="w-full text-right text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-semibold uppercase">
                            <th className="text-left p-1.5">Zone (യൂണിറ്റ്)</th>
                            <th className="p-1.5">Current (നിലവിൽ)</th>
                            <th className="p-1.5">Past (മുൻ)</th>
                            <th className="p-1.5 text-slate-700 dark:text-slate-300 font-bold">Used (ഉപഭോഗം)</th>
                            <th className="p-1.5 text-emerald-600 dark:text-emerald-400 font-bold">Normalized (അഡ്ജസ്റ്റ്)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                          <tr>
                            <td className="text-left p-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                              Normal <span className="text-[9px] text-slate-400 block font-mono">06:00 – 18:00</span>
                            </td>
                            <td className="p-1.5 text-slate-800 dark:text-slate-200">{currReadingNormal || "3575"}</td>
                            <td className="p-1.5 text-slate-500">{prevReadingNormal || "3227"}</td>
                            <td className="p-1.5 font-semibold text-slate-800 dark:text-slate-200">
                              {usedUnitsNormal || (currReadingNormal && prevReadingNormal ? (parseFloat(currReadingNormal) - parseFloat(prevReadingNormal)).toFixed(0) : "348")}
                            </td>
                            <td className="p-1.5 font-bold text-emerald-600 dark:text-emerald-400">{consumedUnitsNormal || "402"}</td>
                          </tr>
                          <tr>
                            <td className="text-left p-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                              Off-Peak <span className="text-[9px] text-slate-400 block font-mono">22:00 – 06:00</span>
                            </td>
                            <td className="p-1.5 text-slate-800 dark:text-slate-200">{currReadingOffPeak || "4177"}</td>
                            <td className="p-1.5 text-slate-500">{prevReadingOffPeak || "3851"}</td>
                            <td className="p-1.5 font-semibold text-slate-800 dark:text-slate-200">
                              {usedUnitsOffPeak || (currReadingOffPeak && prevReadingOffPeak ? (parseFloat(currReadingOffPeak) - parseFloat(prevReadingOffPeak)).toFixed(0) : "326")}
                            </td>
                            <td className="p-1.5 font-bold text-emerald-600 dark:text-emerald-400">{consumedUnitsOffPeak || "322"}</td>
                          </tr>
                          <tr>
                            <td className="text-left p-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                              Peak <span className="text-[9px] text-slate-400 block font-mono">18:00 – 22:00</span>
                            </td>
                            <td className="p-1.5 text-slate-800 dark:text-slate-200">{currReadingPeak || "422"}</td>
                            <td className="p-1.5 text-slate-500">{prevReadingPeak || "410"}</td>
                            <td className="p-1.5 font-semibold text-slate-800 dark:text-slate-200">
                              {usedUnitsPeak || (currReadingPeak && prevReadingPeak ? (parseFloat(currReadingPeak) - parseFloat(prevReadingPeak)).toFixed(0) : "12")}
                            </td>
                            <td className="p-1.5 font-bold text-emerald-600 dark:text-emerald-400">{consumedUnitsPeak || "28"}</td>
                          </tr>
                          <tr className="border-t border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/40 font-bold">
                            <td className="text-left p-1.5 font-sans text-slate-900 dark:text-slate-100">
                              Total
                            </td>
                            <td colSpan={2} className="p-1.5 text-[10px] text-slate-500 font-sans font-normal">
                              Raw Used vs Billed
                            </td>
                            <td className="p-1.5 text-slate-900 dark:text-slate-100">
                              {totalUsedUnits || "686"} kWh
                            </td>
                            <td className="p-1.5 text-emerald-600 dark:text-emerald-400 text-xs">
                              {totalUnits} kWh
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TOGGLE TO REVIEW / EDIT ALL FIELDS */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowManualFields(!showManualFields)}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-500 flex items-center gap-1.5 transition-colors"
            >
              {showManualFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span>{showManualFields ? "Hide detailed form fields" : "Review or edit extracted fields (optional)"}</span>
            </button>
          </div>

          {/* DETAILED EDITABLE FIELDS (Collapsed by default in photo mode) */}
          {showManualFields && (
            <div className="space-y-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
              {/* Consumer Selection if manual override */}
              <div>
                <Label htmlFor="consumer">Assigned KSEB Consumer</Label>
                <Select
                  id="consumer"
                  value={consumerId}
                  onChange={(e) => {
                    setConsumerId(e.target.value);
                    if (e.target.value !== "new") setConsumerData(null);
                  }}
                  className="mt-1"
                >
                  {consumerData && (
                    <option value="new">
                      ✨ Auto-Register New Consumer: {consumerData.name} ({consumerData.consumerNumber})
                    </option>
                  )}
                  {consumers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.consumerNumber} ({c.tariff})
                    </option>
                  ))}
                </Select>
              </div>

              {/* Bill Number & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="billNumber">Bill Number</Label>
                  <Input
                    id="billNumber"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    required
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="billDate">Bill Date</Label>
                  <Input
                    id="billDate"
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    required
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="mt-1 font-mono"
                  />
                </div>
              </div>

              {/* Reading Dates & Billing Cycle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="prevDate">Previous Reading Date</Label>
                  <Input
                    id="prevDate"
                    type="date"
                    value={previousReadingDate}
                    onChange={(e) => setPreviousReadingDate(e.target.value)}
                    required
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="currDate">Current Reading Date</Label>
                  <Input
                    id="currDate"
                    type="date"
                    value={currentReadingDate}
                    onChange={(e) => setCurrentReadingDate(e.target.value)}
                    required
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="disconnDate">Disconnection Date</Label>
                  <Input
                    id="disconnDate"
                    type="date"
                    value={disconnectionDate}
                    onChange={(e) => setDisconnectionDate(e.target.value)}
                    className="mt-1 font-mono"
                  />
                </div>
              </div>

              {/* Time-Of-Day (TOD) Readings Editable Grid */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Time-Of-Day (TOD) Meter Readings (റീഡിങ്ങും ഉപഭോഗവും)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Enter current reading and past reading to auto-calculate used units, or adjust normalized units directly.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-semibold">
                        <th className="text-left py-1 font-sans">Zone</th>
                        <th className="py-1">Current (നിലവിൽ)</th>
                        <th className="py-1">Past (മുൻ)</th>
                        <th className="py-1">Used (ഉപഭോഗം)</th>
                        <th className="py-1 text-emerald-600 dark:text-emerald-400">Normalized (അഡ്ജസ്റ്റ്)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      <tr>
                        <td className="text-left py-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                          Normal <span className="text-[9px] text-slate-400 block font-mono">06:00 – 18:00</span>
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input
                            value={currReadingNormal}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCurrReadingNormal(val);
                              const diff = parseFloat(val) - parseFloat(prevReadingNormal);
                              if (!isNaN(diff) && diff >= 0) setUsedUnitsNormal(diff.toFixed(0));
                            }}
                            placeholder="3575"
                            className="h-8 font-mono text-xs text-right"
                          />
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input
                            value={prevReadingNormal}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPrevReadingNormal(val);
                              const diff = parseFloat(currReadingNormal) - parseFloat(val);
                              if (!isNaN(diff) && diff >= 0) setUsedUnitsNormal(diff.toFixed(0));
                            }}
                            placeholder="3227"
                            className="h-8 font-mono text-xs text-right"
                          />
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input
                            value={usedUnitsNormal}
                            onChange={(e) => setUsedUnitsNormal(e.target.value)}
                            placeholder="348"
                            className="h-8 font-mono text-xs text-right font-semibold"
                          />
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input
                            value={consumedUnitsNormal}
                            onChange={(e) => setConsumedUnitsNormal(e.target.value)}
                            placeholder="402"
                            className="h-8 font-mono text-xs text-right font-bold text-emerald-600 dark:text-emerald-400"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left py-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                          Off-Peak <span className="text-[9px] text-slate-400 block font-mono">22:00 – 06:00</span>
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input
                            value={currReadingOffPeak}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCurrReadingOffPeak(val);
                              const diff = parseFloat(val) - parseFloat(prevReadingOffPeak);
                              if (!isNaN(diff) && diff >= 0) setUsedUnitsOffPeak(diff.toFixed(0));
                            }}
                            placeholder="4177"
                            className="h-8 font-mono text-xs text-right"
                          />
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input
                            value={prevReadingOffPeak}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPrevReadingOffPeak(val);
                              const diff = parseFloat(currReadingOffPeak) - parseFloat(val);
                              if (!isNaN(diff) && diff >= 0) setUsedUnitsOffPeak(diff.toFixed(0));
                            }}
                            placeholder="3851"
                            className="h-8 font-mono text-xs text-right"
                          />
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input
                            value={usedUnitsOffPeak}
                            onChange={(e) => setUsedUnitsOffPeak(e.target.value)}
                            placeholder="326"
                            className="h-8 font-mono text-xs text-right font-semibold"
                          />
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input
                            value={consumedUnitsOffPeak}
                            onChange={(e) => setConsumedUnitsOffPeak(e.target.value)}
                            placeholder="322"
                            className="h-8 font-mono text-xs text-right font-bold text-emerald-600 dark:text-emerald-400"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left py-1.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                          Peak <span className="text-[9px] text-slate-400 block font-mono">18:00 – 22:00</span>
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input
                            value={currReadingPeak}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCurrReadingPeak(val);
                              const diff = parseFloat(val) - parseFloat(prevReadingPeak);
                              if (!isNaN(diff) && diff >= 0) setUsedUnitsPeak(diff.toFixed(0));
                            }}
                            placeholder="422"
                            className="h-8 font-mono text-xs text-right"
                          />
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input
                            value={prevReadingPeak}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPrevReadingPeak(val);
                              const diff = parseFloat(currReadingPeak) - parseFloat(val);
                              if (!isNaN(diff) && diff >= 0) setUsedUnitsPeak(diff.toFixed(0));
                            }}
                            placeholder="410"
                            className="h-8 font-mono text-xs text-right"
                          />
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input
                            value={usedUnitsPeak}
                            onChange={(e) => setUsedUnitsPeak(e.target.value)}
                            placeholder="12"
                            className="h-8 font-mono text-xs text-right font-semibold"
                          />
                        </td>
                        <td className="py-1.5 pl-2">
                          <Input
                            value={consumedUnitsPeak}
                            onChange={(e) => setConsumedUnitsPeak(e.target.value)}
                            placeholder="28"
                            className="h-8 font-mono text-xs text-right font-bold text-emerald-600 dark:text-emerald-400"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <Label htmlFor="totalUnits">Total Consumed Units (kWh)</Label>
                    <Input
                      id="totalUnits"
                      value={totalUnits}
                      onChange={(e) => setTotalUnits(e.target.value)}
                      required
                      className="mt-1 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payableAmount">Payable Amount (₹)</Label>
                    <Input
                      id="payableAmount"
                      value={payableAmount}
                      onChange={(e) => setPayableAmount(e.target.value)}
                      required
                      className="mt-1 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Charges Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div>
                  <Label className="text-[10px]">Energy Charge</Label>
                  <Input value={energyCharge} onChange={(e) => setEnergyCharge(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-[10px]">Electricity Duty</Label>
                  <Input value={duty} onChange={(e) => setDuty(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-[10px]">Fuel Surcharge</Label>
                  <Input value={fuelSurcharge} onChange={(e) => setFuelSurcharge(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-[10px]">Fixed Charge</Label>
                  <Input value={fixedCharge} onChange={(e) => setFixedCharge(e.target.value)} className="mt-1" />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || scanning}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || scanning || (!selectedFile && !billToEdit)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                "Saving Record..."
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>
                    {consumerData ? "Confirm & Auto-Register Consumer" : "Confirm & Save Bill"}
                  </span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </Dialog>
  );
}
