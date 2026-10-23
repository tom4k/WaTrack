import { formatKolkataDate, toDecimal2 } from "./formatters";

export interface CycleAnalytics {
  id: string;
  billNumber: string;
  billDate: string;
  cycleLabel: string;
  periodLabel: string;
  totalUnits: number;
  totalAmount: number;
  payableAmount: number;
  costPerUnit: number;
  energyCharge: number;
  duty: number;
  fuelSurcharge: number;
  fixedCharge: number;
  meterRent: number;
  status: string;
  tod?: {
    normalUnits: number;
    offPeakUnits: number;
    peakUnits: number;
    normalPercent: number;
    offPeakPercent: number;
    peakPercent: number;
  };
}

export interface MonthlyNormalizedPoint {
  monthKey: string; // YYYY-MM
  monthName: string; // "Oct 2026"
  year: number;
  units: number;
  expenditure: number;
}

export interface TODAggregate {
  name: string;
  units: number;
  percentage: number;
  color: string;
}

export interface AnalyticsSummary {
  totalSpentAllTime: number;
  totalSpentThisYear: number;
  totalSpentLastYear: number;
  yearOverYearPercentChange: number | null;
  totalPendingAmount: number;
  pendingBillsCount: number;
  totalUnitsThisYear: number;
  avgUnitsPerCycle: number;
  avgUnitsPerMonth: number;
  avgCostPerUnit: number;
  nextDueBill: {
    billNumber: string;
    dueDate: string;
    amount: number;
    daysRemaining: number;
    isOverdue: boolean;
  } | null;
  cycleHistory: CycleAnalytics[];
  monthlyNormalized: MonthlyNormalizedPoint[];
  todDistribution: TODAggregate[];
  yearlyComparison: {
    year: number;
    units: number;
    expenditure: number;
    billsCount: number;
  }[];
}

export function computeAnalytics(bills: any[]): AnalyticsSummary {
  // Sort bills oldest to newest for chronological tracking
  const sortedBills = [...bills].sort((a, b) => a.billDate.localeCompare(b.billDate));

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  let totalSpentAllTime = 0;
  let totalSpentThisYear = 0;
  let totalSpentLastYear = 0;
  let totalUnitsThisYear = 0;
  let totalUnitsAll = 0;
  let totalPendingAmount = 0;
  let pendingBillsCount = 0;

  const cycleHistory: CycleAnalytics[] = [];
  const monthlyBuckets: Record<string, { units: number; expenditure: number }> = {};
  const yearlyBuckets: Record<number, { units: number; expenditure: number; count: number }> = {};

  let totalNormalUnits = 0;
  let totalOffPeakUnits = 0;
  let totalPeakUnits = 0;

  const todayStr = new Date().toISOString().split("T")[0];
  let nextDueBill: AnalyticsSummary["nextDueBill"] = null;

  for (const b of sortedBills) {
    const billYear = parseInt(b.billDate.slice(0, 4), 10);
    const totalAmount = parseFloat(b.totalAmount || "0");
    const payableAmount = parseFloat(b.payableAmount || "0");
    const paidAmount = parseFloat(b.paidAmount || "0");
    const units = parseFloat(b.totalUnits || "0");
    const balance = Math.max(0, payableAmount - paidAmount);

    totalSpentAllTime += totalAmount;
    totalUnitsAll += units;

    if (billYear === currentYear) {
      totalSpentThisYear += totalAmount;
      totalUnitsThisYear += units;
    } else if (billYear === lastYear) {
      totalSpentLastYear += totalAmount;
    }

    if (balance > 0) {
      totalPendingAmount += balance;
      pendingBillsCount += 1;

      // Track closest due bill
      const daysRemaining = Math.round(
        (new Date(b.dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (!nextDueBill || (daysRemaining >= 0 && daysRemaining < nextDueBill.daysRemaining) || (nextDueBill.daysRemaining < 0 && daysRemaining > nextDueBill.daysRemaining)) {
        nextDueBill = {
          billNumber: b.billNumber,
          dueDate: b.dueDate,
          amount: balance,
          daysRemaining,
          isOverdue: daysRemaining < 0,
        };
      }
    }

    // Yearly tracking
    if (!yearlyBuckets[billYear]) {
      yearlyBuckets[billYear] = { units: 0, expenditure: 0, count: 0 };
    }
    yearlyBuckets[billYear].units += units;
    yearlyBuckets[billYear].expenditure += totalAmount;
    yearlyBuckets[billYear].count += 1;

    // TOD breakdown
    const norm = parseFloat(b.consumedUnitsNormal || "0");
    const offp = parseFloat(b.consumedUnitsOffPeak || "0");
    const peak = parseFloat(b.consumedUnitsPeak || "0");
    const todSum = norm + offp + peak;

    if (todSum > 0) {
      totalNormalUnits += norm;
      totalOffPeakUnits += offp;
      totalPeakUnits += peak;
    }

    const prevDateFormatted = formatKolkataDate(b.previousReadingDate, { format: "short" });
    const currDateFormatted = formatKolkataDate(b.currentReadingDate, { format: "short" });
    const cycleLabel = `${prevDateFormatted} – ${currDateFormatted}`;

    const costPerUnit = units > 0 ? toDecimal2(totalAmount / units) : 0;

    cycleHistory.push({
      id: b.id,
      billNumber: b.billNumber,
      billDate: b.billDate,
      cycleLabel,
      periodLabel: `${formatKolkataDate(b.billDate, { format: "short" })} (${b.billingCycleDays || 60}d)`,
      totalUnits: units,
      totalAmount,
      payableAmount,
      costPerUnit,
      energyCharge: parseFloat(b.energyCharge || "0"),
      duty: parseFloat(b.duty || "0"),
      fuelSurcharge: parseFloat(b.fuelSurcharge || "0"),
      fixedCharge: parseFloat(b.fixedCharge || "0"),
      meterRent: parseFloat(b.meterRent || "0"),
      status: b.status,
      tod: todSum > 0 ? {
        normalUnits: norm,
        offPeakUnits: offp,
        peakUnits: peak,
        normalPercent: toDecimal2((norm / todSum) * 100),
        offPeakPercent: toDecimal2((offp / todSum) * 100),
        peakPercent: toDecimal2((peak / todSum) * 100),
      } : undefined,
    });

    // Normalized monthly distribution
    // KSEB bi-monthly bills span two months: split units and amount across the period
    distributeToMonths(b.previousReadingDate, b.currentReadingDate, units, totalAmount, monthlyBuckets);
  }

  // Calculate Year-over-Year change
  let yearOverYearPercentChange: number | null = null;
  if (totalSpentLastYear > 0) {
    yearOverYearPercentChange = toDecimal2(
      ((totalSpentThisYear - totalSpentLastYear) / totalSpentLastYear) * 100
    );
  }

  const avgUnitsPerCycle = sortedBills.length > 0 ? toDecimal2(totalUnitsAll / sortedBills.length) : 0;
  const avgUnitsPerMonth = toDecimal2(avgUnitsPerCycle / 2); // In Kerala bi-monthly domestic, monthly equivalent is half
  const avgCostPerUnit = totalUnitsAll > 0 ? toDecimal2(totalSpentAllTime / totalUnitsAll) : 0;

  // Monthly normalized points array sorted chronologically
  const monthlyKeys = Object.keys(monthlyBuckets).sort();
  const monthlyNormalized: MonthlyNormalizedPoint[] = monthlyKeys.map((key) => {
    const [y, m] = key.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, 15));
    const monthName = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
    return {
      monthKey: key,
      monthName,
      year: y,
      units: toDecimal2(monthlyBuckets[key].units),
      expenditure: toDecimal2(monthlyBuckets[key].expenditure),
    };
  });

  // TOD Aggregate
  const totalTod = totalNormalUnits + totalOffPeakUnits + totalPeakUnits;
  const todDistribution: TODAggregate[] = totalTod > 0
    ? [
        {
          name: "Normal (6 AM – 6 PM)",
          units: totalNormalUnits,
          percentage: toDecimal2((totalNormalUnits / totalTod) * 100),
          color: "#3b82f6", // Blue
        },
        {
          name: "Off-Peak (10 PM – 6 AM)",
          units: totalOffPeakUnits,
          percentage: toDecimal2((totalOffPeakUnits / totalTod) * 100),
          color: "#10b981", // Emerald
        },
        {
          name: "Peak (6 PM – 10 PM)",
          units: totalPeakUnits,
          percentage: toDecimal2((totalPeakUnits / totalTod) * 100),
          color: "#f59e0b", // Amber
        },
      ]
    : [];

  // Yearly Comparison
  const yearlyComparison = Object.keys(yearlyBuckets)
    .sort()
    .map((yStr) => {
      const y = parseInt(yStr, 10);
      const data = yearlyBuckets[y];
      return {
        year: y,
        units: toDecimal2(data.units),
        expenditure: toDecimal2(data.expenditure),
        billsCount: data.count,
      };
    });

  return {
    totalSpentAllTime: toDecimal2(totalSpentAllTime),
    totalSpentThisYear: toDecimal2(totalSpentThisYear),
    totalSpentLastYear: toDecimal2(totalSpentLastYear),
    yearOverYearPercentChange,
    totalPendingAmount: toDecimal2(totalPendingAmount),
    pendingBillsCount,
    totalUnitsThisYear: toDecimal2(totalUnitsThisYear),
    avgUnitsPerCycle,
    avgUnitsPerMonth,
    avgCostPerUnit,
    nextDueBill,
    cycleHistory: cycleHistory.reverse(), // latest first for display
    monthlyNormalized,
    todDistribution,
    yearlyComparison,
  };
}

/**
 * Distribute bi-monthly bill values evenly across the months covered
 */
function distributeToMonths(
  startDateStr: string,
  endDateStr: string,
  units: number,
  amount: number,
  buckets: Record<string, { units: number; expenditure: number }>
) {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Iterate through months from start to end
    const curr = new Date(start);
    while (curr <= end) {
      const year = curr.getUTCFullYear();
      const month = String(curr.getUTCMonth() + 1).padStart(2, "0");
      const key = `${year}-${month}`;

      // Calculate days in this month
      const startOfNextMonth = new Date(Date.UTC(year, curr.getUTCMonth() + 1, 1));
      const endOfMonthOrCycle = end < startOfNextMonth ? end : new Date(Date.UTC(year, curr.getUTCMonth() + 1, 0));
      const startOfMonthOrCycle = curr;

      const daysInMonth = Math.max(
        1,
        Math.round((endOfMonthOrCycle.getTime() - startOfMonthOrCycle.getTime()) / (1000 * 60 * 60 * 24))
      );

      const ratio = Math.min(1, daysInMonth / totalDays);

      if (!buckets[key]) {
        buckets[key] = { units: 0, expenditure: 0 };
      }
      buckets[key].units += units * ratio;
      buckets[key].expenditure += amount * ratio;

      // Advance to next month
      curr.setUTCMonth(curr.getUTCMonth() + 1);
      curr.setUTCDate(1);
    }
  } catch {
    // Fallback: put in end date month
    const key = endDateStr.slice(0, 7);
    if (!buckets[key]) buckets[key] = { units: 0, expenditure: 0 };
    buckets[key].units += units;
    buckets[key].expenditure += amount;
  }
}
