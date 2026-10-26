import { describe, it, expect } from "vitest";
import { computeAnalytics } from "./analytics";
import { SAMPLE_BILLS } from "@/db/seed-data";

describe("Analytics Engine", () => {
  it("computes analytics correctly for sample KSEB bills", () => {
    const analytics = computeAnalytics(SAMPLE_BILLS);

    expect(analytics.cycleHistory.length).toBe(SAMPLE_BILLS.length);
    expect(analytics.totalSpentAllTime).toBeGreaterThan(0);
    expect(analytics.avgUnitsPerCycle).toBeGreaterThan(0);
    expect(analytics.avgUnitsPerMonth).toBeCloseTo(analytics.avgUnitsPerCycle / 2, 1);

    // Latest bill in sample bills is unpaid (6020.00)
    expect(analytics.totalPendingAmount).toBe(6020);
    expect(analytics.pendingBillsCount).toBe(1);

    // TOD zones
    expect(analytics.todDistribution.length).toBe(3);
    const normalZone = analytics.todDistribution.find((z) => z.name.includes("Normal"));
    expect(normalZone).toBeDefined();
    expect(normalZone?.units).toBeGreaterThan(0);

    // Monthly normalized distribution
    expect(analytics.monthlyNormalized.length).toBeGreaterThan(0);

    // Cost Breakdown Anatomy
    expect(analytics.costBreakdown).toBeDefined();
    expect(analytics.costBreakdown.energyCharges).toBeGreaterThan(0);
    expect(analytics.costBreakdown.dutyCharges).toBeGreaterThan(0);
    expect(analytics.costBreakdown.energyPercent).toBeGreaterThan(50);

    // Daily Burn Metrics
    expect(analytics.avgDailyUnits).toBeGreaterThan(0);
    expect(analytics.avgDailyCost).toBeGreaterThan(0);
    expect(analytics.peakExposurePercent).toBeGreaterThanOrEqual(0);
    expect(analytics.cycleHistory[0].dailyBurnUnits).toBeGreaterThan(0);
  });
});
