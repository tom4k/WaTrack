"use client";

import React, { useRef, useState } from "react";
import { Printer, ZoomIn, ZoomOut, Maximize2, ExternalLink } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatINR, formatKolkataDate, formatIndianNumber } from "@/lib/formatters";

interface ThermalReceiptModalProps {
  bill: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThermalReceiptModal({ bill, open, onOpenChange }: ThermalReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleOpenNewWindow = () => {
    const printContent = printRef.current?.outerHTML;
    if (!printContent) return;

    const win = window.open("", "_blank", "width=480,height=800,scrollbars=yes,resizable=yes");
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KSEB Spot Bill - #${bill.billNumber}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              background: #0f172a;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            }
            .thermal-receipt {
              background-color: #fffdf5 !important;
              color: #111827 !important;
              padding: 24px;
              width: 380px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.5);
              font-size: 11px;
              line-height: 1.35;
            }
            @media print {
              body { background: white; padding: 0; }
              .thermal-receipt { box-shadow: none; width: 100%; max-width: 380px; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" className="p-0 overflow-hidden bg-slate-900 border-slate-800">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/95 text-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-emerald-400">KSEB Spot Bill Replica</span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            #{bill.billNumber}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 mr-6">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setScale((prev) => (prev === 1 ? 0.85 : 1))}
            className="h-8 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 hidden sm:flex gap-1"
            title={scale === 1 ? "Fit to view" : "100% Zoom"}
          >
            {scale === 1 ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
            <span>{scale === 1 ? "Fit" : "100%"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenNewWindow}
            className="h-8 gap-1.5 text-xs text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
            title="Open in standalone window"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Tab</span>
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={handlePrint}
            className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Receipt</span>
          </Button>
        </div>
      </div>

      {/* Outer Scroll Container - Flex Col with Centering to Avoid Height Distortion */}
      <div className="flex-1 overflow-y-auto max-h-[82vh] p-4 sm:p-6 flex flex-col items-center bg-slate-950/90">
        {/* Thermal Paper Slip with Scalable Transform */}
        <div
          ref={printRef}
          style={{
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            transformOrigin: "top center",
          }}
          className="thermal-receipt printable-area w-full max-w-[390px] p-6 text-slate-900 text-xs rounded-sm shadow-2xl border border-amber-300/40 bg-[#fffdf5] shrink-0 h-auto mb-8 transition-transform duration-150"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
            <h1 className="text-2xl font-black tracking-widest leading-none mb-1 text-slate-950">
              KSEB
            </h1>
            <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-800">
              1912 CUSTOMER CARE 24X7
            </p>
            <p className="text-[11px] font-bold mt-1 text-slate-950">Demand/Disconnection Notice</p>
            <p className="text-[9px] text-slate-600">(As per Reg-122 of Supply Code 2014)</p>
            <p className="text-[9px] text-slate-700 mt-1 font-mono">KSEBL-GSTIN: 32AAECK2277NBZ1</p>
            <p className="text-[10px] font-bold mt-0.5 text-slate-900">
              {bill.sectionName || "Pala Section-5624"}
            </p>
            <p className="text-[9px] text-slate-600">Ph: 0482-2212477</p>

            {/* Simulated Barcode */}
            <div className="my-2.5 flex flex-col items-center">
              <div className="flex items-center justify-center space-x-[2px] h-9 w-52 overflow-hidden bg-slate-950 p-1 rounded-xs">
                {Array.from({ length: 44 }).map((_, i) => (
                  <div
                    key={i}
                    className={`bg-white h-full ${
                      i % 4 === 0 ? "w-1" : i % 2 === 0 ? "w-[2px]" : "w-[0.5px]"
                    }`}
                  />
                ))}
              </div>
              <p className="font-mono text-xs font-bold tracking-widest mt-1 text-slate-950">
                C#:{bill.consumerNumber || "1156241018150"}
              </p>
            </div>
          </div>

          {/* Consumer Particulars */}
          <div className="space-y-1 pb-3 border-b border-dashed border-slate-400 text-[11px] leading-tight text-slate-900">
            <div className="flex justify-between">
              <span>ബിൽ നം (Bill No):</span>
              <span className="font-bold font-mono">{bill.billNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>കൺസ്യൂമർ ഐഡി (ID):</span>
              <span className="font-mono font-bold">{bill.consumerId || "10975757"}</span>
            </div>
            <div className="flex justify-between">
              <span>പേര് (Name):</span>
              <span className="font-bold text-right truncate max-w-[210px]">
                {bill.consumerName || "KURIAKOSE ALEXANDER"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>വിലാസം (Address):</span>
              <span className="text-right text-[10px] truncate max-w-[210px] text-slate-800">
                KAYATHINKARA, KAROOR PO, KOTTAYAM
              </span>
            </div>
            <div className="flex justify-between">
              <span>ഫോൺ (Phone):</span>
              <span className="font-mono">9446xx3108</span>
            </div>
            <div className="flex justify-between">
              <span>സ്റ്റാറ്റസ് (Status):</span>
              <span className="font-medium text-emerald-800">Connected</span>
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
              <span className="font-mono">{bill.billArea || "B02/15/114"}</span>
            </div>
            <div className="flex justify-between">
              <span>ബിൽ തീയതി (Bill Date):</span>
              <span className="font-bold font-mono">
                {formatKolkataDate(bill.billDate, { format: "dd-mm-yyyy" })}
              </span>
            </div>
            <div className="flex justify-between text-rose-900 font-bold">
              <span>പിഴ തീയതി (Due Date):</span>
              <span className="font-mono">{formatKolkataDate(bill.dueDate, { format: "dd-mm-yyyy" })}</span>
            </div>
            {bill.disconnectionDate && (
              <div className="flex justify-between text-rose-950 font-semibold">
                <span>വിച്ഛേദന തീയതി (Disconn):</span>
                <span className="font-mono">
                  {formatKolkataDate(bill.disconnectionDate, { format: "dd-mm-yyyy" })}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>താരീഫ് (Tariff):</span>
              <span className="font-bold">{bill.tariff || "LT-1 Dom"}</span>
            </div>
            <div className="flex justify-between">
              <span>ഉപയോഗാവശ്യം:</span>
              <span>Domestic</span>
            </div>
            <div className="flex justify-between">
              <span>വിഭാഗം:</span>
              <span>DOMESTIC</span>
            </div>
            <div className="flex justify-between">
              <span>നിക്ഷേപത്തുക (Sec. Dep):</span>
              <span className="font-mono">Rs. 9849</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>അവസാനം അടച്ചത്:</span>
              <span className="font-mono">Rs. 5764.00 dt: 19-08-2026</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-700">
              <span>റീഡിങ് സമയം:</span>
              <span className="font-mono">{bill.readingTime || "18/10/2026 11:29:59 AM"}</span>
            </div>
          </div>

          {/* Meter Readings & TOD Table */}
          <div className="py-3 border-b border-dashed border-slate-400">
            <p className="font-bold text-center mb-1 text-[11px] text-slate-950">
              മെയിൻ മീറ്റർ (MM) - {bill.meterSerialNumber || "HEP7198657"}
            </p>
            <div className="flex justify-between text-[10px] text-slate-700 mb-1">
              <span>സ്റ്റാറ്റസ്: Working</span>
              <span>ലോഡ്: {bill.connectedLoad || "10 kW"}</span>
              <span>കോൺ. ഡിമാൻഡ്: -</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-700 mb-2">
              <span>ഫേസ്: {bill.phase || "3"}</span>
              <span>ഒ.എം.എഫ്: 1</span>
            </div>
            <div className="flex justify-between text-[10px] mb-2 font-mono">
              <span>മുൻ റീഡിങ്: {formatKolkataDate(bill.previousReadingDate, { format: "dd-mm-yyyy" })}</span>
              <span>നില റീഡിങ്: {formatKolkataDate(bill.currentReadingDate, { format: "dd-mm-yyyy" })}</span>
            </div>

            <p className="text-[10px] font-bold mb-1.5 text-slate-900">
              റീഡിങ്ങും ഉപഭോഗവും (MM):
            </p>
            <table className="w-full text-right text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-slate-400 font-bold text-slate-900">
                  <th className="text-left py-0.5">യൂണിറ്റ്</th>
                  <th className="py-0.5">നിലവിൽ</th>
                  <th className="py-0.5">മുൻ</th>
                  <th className="py-0.5 font-bold text-slate-950">ഉപഭോഗം</th>
                  <th className="py-0.5 font-normal text-slate-600">ശരാശരി</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="text-left font-mono py-0.5 font-bold">KWH(NL)</td>
                  <td className="font-mono">{formatIndianNumber(bill.currReadingNormal || 3575, 0)}</td>
                  <td className="font-mono">{formatIndianNumber(bill.prevReadingNormal || 3227, 0)}</td>
                  <td className="font-mono font-bold text-slate-950">
                    {formatIndianNumber(bill.usedUnitsNormal || (bill.currReadingNormal && bill.prevReadingNormal ? Math.max(0, parseFloat(bill.currReadingNormal) - parseFloat(bill.prevReadingNormal)) : 348), 0)}
                  </td>
                  <td className="font-mono text-slate-600">
                    {formatIndianNumber(bill.consumedUnitsNormal || 402, 0)}
                  </td>
                </tr>
                <tr>
                  <td className="text-left font-mono py-0.5 font-bold">KWH(OP)</td>
                  <td className="font-mono">{formatIndianNumber(bill.currReadingOffPeak || 4177, 0)}</td>
                  <td className="font-mono">{formatIndianNumber(bill.prevReadingOffPeak || 3851, 0)}</td>
                  <td className="font-mono font-bold text-slate-950">
                    {formatIndianNumber(bill.usedUnitsOffPeak || (bill.currReadingOffPeak && bill.prevReadingOffPeak ? Math.max(0, parseFloat(bill.currReadingOffPeak) - parseFloat(bill.prevReadingOffPeak)) : 326), 0)}
                  </td>
                  <td className="font-mono text-slate-600">
                    {formatIndianNumber(bill.consumedUnitsOffPeak || 322, 0)}
                  </td>
                </tr>
                <tr>
                  <td className="text-left font-mono py-0.5 font-bold">KWH(PK)</td>
                  <td className="font-mono">{formatIndianNumber(bill.currReadingPeak || 422, 0)}</td>
                  <td className="font-mono">{formatIndianNumber(bill.prevReadingPeak || 410, 0)}</td>
                  <td className="font-mono font-bold text-slate-950">
                    {formatIndianNumber(bill.usedUnitsPeak || (bill.currReadingPeak && bill.prevReadingPeak ? Math.max(0, parseFloat(bill.currReadingPeak) - parseFloat(bill.prevReadingPeak)) : 12), 0)}
                  </td>
                  <td className="font-mono text-slate-600">
                    {formatIndianNumber(bill.consumedUnitsPeak || 28, 0)}
                  </td>
                </tr>
                <tr className="border-t-2 border-slate-800 font-bold text-slate-950">
                  <td colSpan={3} className="text-left py-1 text-[11px]">
                    ഉപയോഗിച്ച യൂണിറ്റ് (Used Units):
                  </td>
                  <td colSpan={2} className="font-mono text-xs py-1">
                    {formatIndianNumber(bill.totalUsedUnits || bill.totalUnits || 686, 0)} kWh
                  </td>
                </tr>
                <tr className="border-t border-slate-300 text-slate-700">
                  <td colSpan={3} className="text-left py-0.5 text-[9px]">
                    ശരാശരി ബെഞ്ച്മാർക്ക് (Benchmark Profile):
                  </td>
                  <td colSpan={2} className="font-mono text-[10px] py-0.5">
                    {bill.consumedUnitsNormal ? (parseFloat(bill.consumedUnitsNormal) + parseFloat(bill.consumedUnitsOffPeak || "0") + parseFloat(bill.consumedUnitsPeak || "0")).toFixed(0) : "752"} kWh
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Charges Particulars */}
          <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px] text-slate-900">
            <p className="font-bold text-center mb-1 text-slate-950">
              ബിൽ വിവരങ്ങൾ (Bill Particulars)
            </p>
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

            <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-xs text-slate-950">
              <span>ബിൽ തുക (Rs):</span>
              <span className="font-mono">{formatIndianNumber(bill.totalAmount, 2)}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-slate-950 pt-1.5 border-t-2 border-slate-950">
              <span>അടയ്ക്കേണ്ട തുക:</span>
              <span className="font-mono text-base">{formatINR(bill.payableAmount)}</span>
            </div>
          </div>

          {/* Remarks & Footer Section */}
          <div className="pt-3 text-center text-[10px] space-y-2 text-slate-900">
            <div className="bg-amber-100/70 p-2 rounded border border-amber-300/50 text-[10px] text-slate-800 text-left">
              <p className="font-bold mb-0.5">Remarks</p>
              <p className="italic">
                {bill.remarks ||
                  "Auto Recovery FS Demand @0.03 Paise/unit (KSERC Tariff Amendment Regulation dtd 29-05-2023)"}
              </p>
            </div>

            <p className="italic text-slate-700 text-[10px] pt-1">
              സൂക്ഷ്മതയോടെയുള്ള ഉപയോഗം സുരക്ഷിതമായ നാളെക്കായി
            </p>

            <p className="font-bold text-slate-900 pt-0.5">
              Pay Online: <span className="underline font-mono">https://wss.kseb.in</span>
            </p>

            <div className="text-[9px] text-slate-600 font-mono space-y-0.5 pt-1 border-t border-dashed border-slate-300">
              <p>SHIJU N-9202717, Meter Reader (CON)</p>
              <p>POS-MSwipe-12000123242570</p>
              <p>KSEB SBM ver:2.5(18)/65</p>
              <p>18/10/2026 11:30:29 AM</p>
            </div>

            <div className="pt-2 text-[9px] text-slate-500 font-mono leading-tight">
              <p>Technology Partner</p>
              <p className="font-bold text-slate-700">Radiant acemoney</p>
              <p className="mt-1 text-[8px] text-slate-400">
                *** Verified Authentic KSEB Spot Notice Replica ***
              </p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
