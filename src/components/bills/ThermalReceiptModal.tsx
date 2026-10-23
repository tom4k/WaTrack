"use client";

import React, { useRef } from "react";
import { Printer, Download, X } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatINR, formatKolkataDate, formatIndianNumber } from "@/lib/formatters";

interface ThermalReceiptModalProps {
  bill: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThermalReceiptModal({ bill, open, onOpenChange }: ThermalReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="default" className="p-0 overflow-hidden bg-slate-900/90">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-emerald-400">KSEB Spot Bill Replica</span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            #{bill.billNumber}
          </span>
        </div>
        <div className="flex items-center gap-2 mr-8">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="h-8 gap-1.5 text-xs text-white border-slate-700 hover:bg-slate-800"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Receipt
          </Button>
        </div>
      </div>

      <div className="p-6 overflow-y-auto max-h-[80vh] flex justify-center bg-slate-950/80">
        {/* Thermal Slip Container */}
        <div
          ref={printRef}
          className="thermal-receipt printable-area w-full max-w-[380px] p-6 text-slate-900 text-xs rounded-sm shadow-2xl border border-amber-200/50"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
            <h1 className="text-2xl font-black tracking-widest leading-none mb-1">KSEB</h1>
            <p className="text-[10px] tracking-wider uppercase font-semibold">
              1912 CUSTOMER CARE 24X7
            </p>
            <p className="text-[10px] font-bold mt-1">Demand/Disconnection Notice</p>
            <p className="text-[9px] text-slate-600">(As per Reg-122 of Supply Code 2014)</p>
            <p className="text-[9px] text-slate-700 mt-1">KSEBL-GSTIN: 32AAECK2277NBZ1</p>
            <p className="text-[10px] font-bold mt-0.5">
              {bill.sectionName || "Pala Section-5624"}
            </p>
            <p className="text-[9px] text-slate-600">Ph: 0482-2212477</p>

            {/* Barcode Simulation */}
            <div className="my-2 flex flex-col items-center">
              <div className="flex items-center justify-center space-x-[2px] h-9 w-48 overflow-hidden bg-slate-900 p-1 rounded-xs">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={i}
                    className={`bg-white h-full ${
                      i % 3 === 0 ? "w-1" : i % 2 === 0 ? "w-[2px]" : "w-[0.5px]"
                    }`}
                  />
                ))}
              </div>
              <p className="font-mono text-xs font-bold tracking-widest mt-1">
                C#:{bill.consumerNumber || "1156241018150"}
              </p>
            </div>
          </div>

          {/* Consumer & Bill Particulars */}
          <div className="space-y-1 pb-3 border-b border-dashed border-slate-400 text-[11px] leading-tight">
            <div className="flex justify-between">
              <span>ബിൽ നം (Bill No):</span>
              <span className="font-bold">{bill.billNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>കൺസ്യൂമർ ഐഡി (ID):</span>
              <span className="font-mono font-bold">{bill.consumerId || "10975757"}</span>
            </div>
            <div className="flex justify-between">
              <span>പേര് (Name):</span>
              <span className="font-bold text-right truncate max-w-[200px]">
                {bill.consumerName || "KURIAKOSE ALEXANDER"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>വിലാസം (Address):</span>
              <span className="text-right text-[10px] truncate max-w-[200px]">
                KAYATHINKARA, KAROOR, KOTTAYAM
              </span>
            </div>
            <div className="flex justify-between">
              <span>സ്റ്റാറ്റസ് (Status):</span>
              <span>Connected</span>
            </div>
            <div className="flex justify-between">
              <span>പോസ്റ്റ് നം (Post No):</span>
              <span className="font-mono">{bill.postNumber || "PR-124/4/4"}</span>
            </div>
            <div className="flex justify-between">
              <span>ട്രാൻസ്ഫോർമർ:</span>
              <span>{bill.transformer || "POOTHAKUZHY"}</span>
            </div>
            <div className="flex justify-between">
              <span>ബിൽ ഏരിയ (Area):</span>
              <span>{bill.billArea || "B02/15/114"}</span>
            </div>
            <div className="flex justify-between">
              <span>ബിൽ തീയതി (Bill Date):</span>
              <span className="font-bold">
                {formatKolkataDate(bill.billDate, { format: "dd-mm-yyyy" })}
              </span>
            </div>
            <div className="flex justify-between text-rose-800 font-bold">
              <span>പിഴ തീയതി (Due Date):</span>
              <span>{formatKolkataDate(bill.dueDate, { format: "dd-mm-yyyy" })}</span>
            </div>
            {bill.disconnectionDate && (
              <div className="flex justify-between text-rose-900">
                <span>വിച്ഛേദന തീയതി (Disconn):</span>
                <span>
                  {formatKolkataDate(bill.disconnectionDate, { format: "dd-mm-yyyy" })}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>താരീഫ് (Tariff):</span>
              <span className="font-bold">{bill.tariff || "LT-1 Dom"}</span>
            </div>
            <div className="flex justify-between">
              <span>നിക്ഷേപത്തുക (Sec. Dep):</span>
              <span>Rs. 9849</span>
            </div>
            {bill.readingTime && (
              <div className="flex justify-between text-[10px] text-slate-700">
                <span>റീഡിങ് സമയം:</span>
                <span>{bill.readingTime}</span>
              </div>
            )}
          </div>

          {/* Meter Readings Table */}
          <div className="py-3 border-b border-dashed border-slate-400">
            <p className="font-bold text-center mb-1 text-[11px]">
              മെയിൻ മീറ്റർ (MM) - {bill.meterSerialNumber || "HEP7198657"}
            </p>
            <div className="flex justify-between text-[10px] text-slate-700 mb-2">
              <span>ലോഡ്: {bill.connectedLoad || "10 kW"}</span>
              <span>ഫേസ്: {bill.phase || "3"}</span>
              <span>ഒ.എം.എഫ്: 1</span>
            </div>
            <div className="flex justify-between text-[10px] mb-2">
              <span>മുൻ റീഡിങ്: {formatKolkataDate(bill.previousReadingDate, { format: "dd-mm-yyyy" })}</span>
              <span>നില റീഡിങ്: {formatKolkataDate(bill.currentReadingDate, { format: "dd-mm-yyyy" })}</span>
            </div>

            <p className="text-[10px] font-bold mb-1">റീഡിങ്ങും ഉപയോഗവും (TOD Reading):</p>
            <table className="w-full text-right text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-slate-400 font-bold">
                  <th className="text-left py-0.5">യൂണിറ്റ്</th>
                  <th className="py-0.5">നിലവിൽ</th>
                  <th className="py-0.5">മുമ്പ്</th>
                  <th className="py-0.5">ഉപയോഗം</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="text-left font-mono py-0.5">KWH(NL)</td>
                  <td className="font-mono">{formatIndianNumber(bill.currReadingNormal || 3575, 0)}</td>
                  <td className="font-mono">{formatIndianNumber(bill.prevReadingNormal || 3227, 0)}</td>
                  <td className="font-mono font-bold">
                    {formatIndianNumber(bill.consumedUnitsNormal || 402, 0)}
                  </td>
                </tr>
                <tr>
                  <td className="text-left font-mono py-0.5">KWH(OP)</td>
                  <td className="font-mono">{formatIndianNumber(bill.currReadingOffPeak || 4177, 0)}</td>
                  <td className="font-mono">{formatIndianNumber(bill.prevReadingOffPeak || 3851, 0)}</td>
                  <td className="font-mono font-bold">
                    {formatIndianNumber(bill.consumedUnitsOffPeak || 322, 0)}
                  </td>
                </tr>
                <tr>
                  <td className="text-left font-mono py-0.5">KWH(PK)</td>
                  <td className="font-mono">{formatIndianNumber(bill.currReadingPeak || 422, 0)}</td>
                  <td className="font-mono">{formatIndianNumber(bill.prevReadingPeak || 410, 0)}</td>
                  <td className="font-mono font-bold">
                    {formatIndianNumber(bill.consumedUnitsPeak || 28, 0)}
                  </td>
                </tr>
                <tr className="border-t-2 border-slate-600 font-bold">
                  <td colSpan={3} className="text-left py-1">
                    ആകെ ഉപയോഗിച്ച യൂണിറ്റ് (Total kWh):
                  </td>
                  <td className="font-mono text-xs py-1">
                    {formatIndianNumber(bill.totalUnits, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Charges Particulars */}
          <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
            <p className="font-bold text-center mb-1">ബിൽ വിവരങ്ങൾ (Bill Particulars)</p>
            <div className="flex justify-between">
              <span>എനർജി ചാർജ് (Energy Charge):</span>
              <span className="font-mono">{formatIndianNumber(bill.energyCharge, 2)}</span>
            </div>
            <div className="flex justify-between">
              <span>ഡ്യൂട്ടി (Duty 10%):</span>
              <span className="font-mono">{formatIndianNumber(bill.duty, 2)}</span>
            </div>
            <div className="flex justify-between">
              <span>ഫ്യുവൽ സർചാർജ് (Fuel Surcharge):</span>
              <span className="font-mono">{formatIndianNumber(bill.fuelSurcharge, 2)}</span>
            </div>
            <div className="flex justify-between">
              <span>ഫിക്സഡ് ചാർജ് (Fixed Charge):</span>
              <span className="font-mono">{formatIndianNumber(bill.fixedCharge, 2)}</span>
            </div>
            <div className="flex justify-between">
              <span>മീറ്റർ വാടക (Meter Rent):</span>
              <span className="font-mono">{formatIndianNumber(bill.meterRent, 2)}</span>
            </div>
            {parseFloat(bill.roundOff || "0") !== 0 && (
              <div className="flex justify-between">
                <span>റൗണ്ട് ഓഫ് (Round Off):</span>
                <span className="font-mono">{bill.roundOff}</span>
              </div>
            )}
            {parseFloat(bill.arrears || "0") > 0 && (
              <div className="flex justify-between text-rose-800 font-semibold">
                <span>കുടിശ്ശിക (Arrears):</span>
                <span className="font-mono">{formatIndianNumber(bill.arrears, 2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
              <span>ബിൽ തുക (Bill Amount):</span>
              <span className="font-mono">{formatINR(bill.totalAmount)}</span>
            </div>
            <div className="flex justify-between font-black text-base text-emerald-800 pt-1 border-t-2 border-slate-900">
              <span>അടയ്ക്കേണ്ട തുക (Payable):</span>
              <span className="font-mono">{formatINR(bill.payableAmount)}</span>
            </div>
          </div>

          {/* Remarks & Footer */}
          <div className="pt-3 text-center text-[10px] space-y-2">
            {bill.remarks && (
              <p className="italic text-slate-700 bg-amber-50 p-1.5 rounded border border-amber-200/50">
                {bill.remarks}
              </p>
            )}
            <p className="font-bold text-slate-800">
              Pay Online: <span className="underline font-mono">https://wss.kseb.in</span>
            </p>
            <p className="text-[9px] text-slate-500 font-mono">
              POS-MSwipe / KSEB SBM ver:2.5(18)/65
            </p>
            <div className="pt-2 border-t border-dotted border-slate-300 text-[9px] text-slate-500">
              *** Verified Authentic KSEB Spot Demand Notice ***
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
