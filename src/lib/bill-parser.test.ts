import { describe, it, expect } from "vitest";
import { parseBillImage } from "./bill-parser";

describe("KSEB PDF Sharasheri Benchmark Parser", () => {
  it("multiplies Average consumption(Monthly) by 2 for bi-monthly PDF bills", async () => {
    // OCR text from the user's official KSEB OrumaNET A4 PDF
    const pdfOcrText = `
KERALA STATE ELECTRICITY BOARD LIMITED
DEMAND CUM DISCONNECTION NOTICE
(As per Regulation 122 & 123 of Kerala Electricity Supply Code 2014)
Section [5624]-Electrical Section Pala Phone# 0482-2212477 Customer Care 1912
Consumer# 1156241018150 Reg. Mob# 944xxxx108 Regular CC Bill(PostPaid)
Name & Mailing Address
KURIAKOSE ALEXANDER
KAYATHINKARA, KAROOR PO
Bill# 5624260412446 Bill Area B02/15 DTR POOTHAKUZHY
Billing Period 4/2026[Bi-Monthly] Tariff/Phase LT-1/Three Pole# PR-124/4/4 
Bill Date 17-04-2026 Due Date 26-04-2026 DC Date 11-05-2026 
Contract Demand (Nil) VA [75% : 0KV, 130% : 0KV] Connected Load 9212 Watts Security Deposit Rs.9849.00
Meter# HEP020210007198657 
Meter Digits 7.2 
Meter Type/ TOD 
Meter Owner KSEB 
Average consumption(Monthly)
Power Unit/Zone NORMAL OFF PEAK PEAK
KWH 160 175 20 
Last Billed Rdg. Date Prev. Rdg. Date Prev. Meter Rdg. Status Prst. Rdg. Date Prst. Meter Rdg. Status
16-02-2026 16-02-2026 Working 17-04-2026 Working 
Power Unit Zone Trading Initial Reading(IR) Final Reading(FR) OMF Units* 
KWH Normal Import 2022.00 2470.00 1 448 
KWH Off Peak Import 2883.00 3307.00 1 424 
KWH Peak Import 328.00 343.00 1 15 
Fixed Charges Fixed Charge[FC] 570.00
Energy Charges Energy Charge-Normal[ECN] 3326.40
Energy Charge-Peak[ECP] 154.69
Energy Charge-Offpeak[ECO] 3498.00
Electricity Duty[ED] 697.91
Meter Rent[MR] 30.00
Round Off -0.13
Total Amt.(Bill#5624260412446) 8268.00
Net Payable 0.00
    `;

    // parseBillImage will fallback to heuristic extractor when no API key is passed
    const parsed = await parseBillImage(Buffer.from(pdfOcrText), "text/plain");

    expect(parsed.success).toBe(true);
    // Raw meter advance units (Used Units)
    expect(parsed.bill.usedUnitsNormal).toBe("448.00");
    expect(parsed.bill.usedUnitsOffPeak).toBe("424.00");
    expect(parsed.bill.usedUnitsPeak).toBe("15.00");
    expect(parsed.bill.totalUsedUnits).toBe("887.00");

    // Sharasheri (ശരാശരി) benchmark = Monthly Average * 2
    expect(parsed.bill.consumedUnitsNormal).toBe("320.00"); // 160 * 2
    expect(parsed.bill.consumedUnitsOffPeak).toBe("350.00"); // 175 * 2
    expect(parsed.bill.consumedUnitsPeak).toBe("40.00"); // 20 * 2

    // Benchmark total
    const totalBenchmark =
      parseFloat(parsed.bill.consumedUnitsNormal) +
      parseFloat(parsed.bill.consumedUnitsOffPeak) +
      parseFloat(parsed.bill.consumedUnitsPeak);
    expect(totalBenchmark).toBe(710.00);

    // Bill Amount
    expect(parsed.bill.totalAmount).toBe("8268.00");
    expect(parsed.bill.payableAmount).toBe("8268.00");
  });
});
