import { describe, it, expect } from "vitest";
import { detectBillingComputation } from "./billing-audit";

describe("detectBillingComputation", () => {
  it("identifies raw meter units computation when billed units match raw delta and fuel surcharge", () => {
    const bill = {
      currReadingNormal: 3575,
      prevReadingNormal: 3227, // 348
      consumedUnitsNormal: 402,

      currReadingOffPeak: 4177,
      prevReadingOffPeak: 3851, // 326
      consumedUnitsOffPeak: 322,

      currReadingPeak: 422,
      prevReadingPeak: 410, // 12
      consumedUnitsPeak: 28,

      totalUsedUnits: 686,
      totalUnits: 686,
      fuelSurcharge: 20.58, // 20.58 / 686 = 0.03
      energyCharge: 4971.92,
      payableAmount: 5543.0,
    };

    const audit = detectBillingComputation(bill);
    expect(audit.isAverageUsed).toBe(false);
    expect(audit.method).toBe("RAW_METER_UNITS");
    expect(audit.rawMeterUnits).toBe(686);
    expect(audit.sharasheriUnits).toBe(752);
    expect(audit.billedUnits).toBe(686);
    expect(audit.badgeLabel).toBe("⚡ Billed on Physical Meter");
  });

  it("identifies average / ശരാശരി computation when billed units match Sharasheri and meter had door lock or average billed", () => {
    const bill = {
      currReadingNormal: 3575,
      prevReadingNormal: 3227, // raw delta 348
      consumedUnitsNormal: 402, // avg 402

      currReadingOffPeak: 4177,
      prevReadingOffPeak: 3851, // raw delta 326
      consumedUnitsOffPeak: 322, // avg 322

      currReadingPeak: 422,
      prevReadingPeak: 410, // raw delta 12
      consumedUnitsPeak: 28, // avg 28

      totalUsedUnits: 686,
      totalUnits: 752, // billed on 752
      fuelSurcharge: 22.56, // 22.56 / 752 = 0.03
      payableAmount: 6200.0,
      remarks: "Door locked, average billed as per Reg 125",
    };

    const audit = detectBillingComputation(bill);
    expect(audit.isAverageUsed).toBe(true);
    expect(audit.method).toBe("AVERAGE_SHARASHERI_UNITS");
    expect(audit.rawMeterUnits).toBe(686);
    expect(audit.sharasheriUnits).toBe(752);
    expect(audit.billedUnits).toBe(752);
    expect(audit.badgeLabel).toContain("Billed on Average (ശരാശരി)");
    expect(audit.costImpact).toBeGreaterThan(0);
  });

  it("handles identical raw and sharasheri units gracefully", () => {
    const bill = {
      currReadingNormal: 150,
      prevReadingNormal: 50,
      consumedUnitsNormal: 100,
      totalUnits: 100,
    };

    const audit = detectBillingComputation(bill);
    expect(audit.isAverageUsed).toBe(false);
    expect(audit.method).toBe("IDENTICAL");
    expect(audit.badgeLabel).toBe("⚡ Meter Reading Matched");
  });
});
