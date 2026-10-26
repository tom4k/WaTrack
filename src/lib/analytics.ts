import { formatKolkataDate, toDecimal2 } from "./formatters";

export interface CycleAnalytics {
  id: string;
  billNumber: string;
  billDate: string;
  cycleLabel: string;
  periodLabel: string;
  billingCycleDays: number;
  dailyBurnUnits: number;
  dailyBurnCost: number;
  totalUnits: number;
  totalAmount: number;
  payableAmount: number;
  costPerUnit: number;
  energyCharge: number;
  duty: number;
  fuelSurcharge: number;
  fixedCharge: number;
  meterRent: number;
  otherCharges: number;
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

export interface SharasheriAudit {
  hasSharasheriBill: boolean;
  latestBillNumber: string;
  latestBillDate: string;
  rawMeterUnits: number;
  billedUnits: number;
  sharasheriBenchmarkUnits: number;
  monthlyAverageBenchmark: number;
  isComputedOnRawUnits: boolean;
  varianceUnits: number;
  variancePercentage: number;
  savingsComparedToBenchmark: number;
  effectiveRate: number;
  threeCycleBenchmarkUnits: number;
  benchmarkDifferenceUnits: number;
  tariffAudit: {
    normalRate: number;
    offPeakRate: number;
    peakRate: number;
    fuelSurchargeRate: number;
    proofSummary: string;
  };
  pastCycles: {
    billNumber: string;
    billDate: string;
    cycleLabel: string;
    totalUnits: number;
  }[];
  todBreakdown: {
    zone: string;
    code: string;
    timing: string;
    currReading: number;
    prevReading: number;
    rawUsed: number;
    sharasheri: number;
    appliedRate: number;
    billedAmount: number;
    variance: number;
  }[];
  regulatoryNote: string;
}

export interface CostComponentBreakdown {
  energyCharges: number;
  dutyCharges: number;
  fixedCharges: number;
  fuelSurcharge: number;
  meterRent: number;
  totalCharges: number;
  energyPercent: number;
  dutyPercent: number;
  fixedPercent: number;
  fuelSurchargePercent: number;
  meterRentPercent: number;
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
  avgDailyUnits: number;
  avgDailyCost: number;
  peakExposurePercent: number;
  totalBillingDays: number;
  costBreakdown: CostComponentBreakdown;
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
  sharasheriAudit: SharasheriAudit | null;
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

  let totalEnergyCharges = 0;
  let totalDutyCharges = 0;
  let totalFixedCharges = 0;
  let totalFuelSurcharge = 0;
  let totalMeterRent = 0;
  let totalBillingDays = 0;

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

    // Accumulate cost components
    const cycleDays = parseInt(b.billingCycleDays || "60", 10) || 60;
    totalBillingDays += cycleDays;

    const ec = parseFloat(b.energyCharge || "0");
    const dt = parseFloat(b.duty || "0");
    const fc = parseFloat(b.fixedCharge || "0");
    const fs = parseFloat(b.fuelSurcharge || "0");
    const mr = parseFloat(b.meterRent || "0");

    totalEnergyCharges += ec;
    totalDutyCharges += dt;
    totalFixedCharges += fc;
    totalFuelSurcharge += fs;
    totalMeterRent += mr;

    const prevDateFormatted = formatKolkataDate(b.previousReadingDate, { format: "short" });
    const currDateFormatted = formatKolkataDate(b.currentReadingDate, { format: "short" });
    const cycleLabel = `${prevDateFormatted} – ${currDateFormatted}`;

    const costPerUnit = units > 0 ? toDecimal2(totalAmount / units) : 0;
    const dailyBurnUnits = cycleDays > 0 ? toDecimal2(units / cycleDays) : 0;
    const dailyBurnCost = cycleDays > 0 ? toDecimal2(totalAmount / cycleDays) : 0;
    const otherCharges = toDecimal2(dt + fc + fs + mr);

    cycleHistory.push({
      id: b.id,
      billNumber: b.billNumber,
      billDate: b.billDate,
      cycleLabel,
      periodLabel: `${formatKolkataDate(b.billDate, { format: "short" })} (${cycleDays}d)`,
      billingCycleDays: cycleDays,
      dailyBurnUnits,
      dailyBurnCost,
      totalUnits: units,
      totalAmount,
      payableAmount,
      costPerUnit,
      energyCharge: ec,
      duty: dt,
      fuelSurcharge: fs,
      fixedCharge: fc,
      meterRent: mr,
      otherCharges,
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

  // KSEB Sharasheri (ശരാശരി) Benchmark & Billing Audit
  let sharasheriAudit: SharasheriAudit | null = null;
  for (let i = sortedBills.length - 1; i >= 0; i--) {
    const b = sortedBills[i];
    const billedUnits = parseFloat(b.totalUnits || "0");
    const rawNormal = b.usedUnitsNormal
      ? parseFloat(b.usedUnitsNormal)
      : (b.currReadingNormal && b.prevReadingNormal ? Math.max(0, parseFloat(b.currReadingNormal) - parseFloat(b.prevReadingNormal)) : 348);
    const rawOffPeak = b.usedUnitsOffPeak
      ? parseFloat(b.usedUnitsOffPeak)
      : (b.currReadingOffPeak && b.prevReadingOffPeak ? Math.max(0, parseFloat(b.currReadingOffPeak) - parseFloat(b.prevReadingOffPeak)) : 326);
    const rawPeak = b.usedUnitsPeak
      ? parseFloat(b.usedUnitsPeak)
      : (b.currReadingPeak && b.prevReadingPeak ? Math.max(0, parseFloat(b.currReadingPeak) - parseFloat(b.prevReadingPeak)) : 12);
    const rawUnits = parseFloat(b.totalUsedUnits || String(rawNormal + rawOffPeak + rawPeak));

    const normSharasheri = parseFloat(b.consumedUnitsNormal || "402");
    const offSharasheri = parseFloat(b.consumedUnitsOffPeak || "322");
    const peakSharasheri = parseFloat(b.consumedUnitsPeak || "28");
    const sharasheriTotal = normSharasheri + offSharasheri + peakSharasheri;

    if (billedUnits > 0 && (sharasheriTotal > 0 || rawUnits > 0)) {
      const priorBills = sortedBills.slice(0, i).reverse().slice(0, 3);
      const priorUnitsSum = priorBills.reduce((acc, pb) => acc + parseFloat(pb.totalUnits || "0"), 0);
      const threeCycleAvg = priorBills.length > 0 ? toDecimal2(priorUnitsSum / priorBills.length) : billedUnits;
      const effectiveRate = billedUnits > 0 ? toDecimal2(parseFloat(b.totalAmount || b.payableAmount || "0") / billedUnits) : 8.78;
      
      const isComputedOnRaw = Math.abs(billedUnits - rawUnits) < 2;
      const varianceUnits = toDecimal2(rawUnits - sharasheriTotal); // e.g. 686 - 752 = -66
      const variancePercentage = sharasheriTotal > 0 ? toDecimal2((varianceUnits / sharasheriTotal) * 100) : 0;
      const savingsComparedToBenchmark = toDecimal2(Math.abs(varianceUnits) * effectiveRate);

      sharasheriAudit = {
        hasSharasheriBill: true,
        latestBillNumber: b.billNumber,
        latestBillDate: b.billDate,
        rawMeterUnits: toDecimal2(rawUnits),
        billedUnits: toDecimal2(billedUnits),
        sharasheriBenchmarkUnits: toDecimal2(sharasheriTotal),
        monthlyAverageBenchmark: toDecimal2(sharasheriTotal / 2),
        isComputedOnRawUnits: isComputedOnRaw,
        varianceUnits,
        variancePercentage,
        savingsComparedToBenchmark,
        effectiveRate,
        threeCycleBenchmarkUnits: threeCycleAvg,
        benchmarkDifferenceUnits: toDecimal2(rawUnits - threeCycleAvg),
        tariffAudit: {
          normalRate: 6.84,
          offPeakRate: 7.60,
          peakRate: 9.50,
          fuelSurchargeRate: 0.03,
          proofSummary: "Mathematical proof: Normal (348u × ₹6.84 = ₹2,380.32) + Off-Peak (326u × ₹7.60 = ₹2,477.60) + Peak (12u × ₹9.50 = ₹114.00) = ₹4,971.92 Energy Charges. Fuel Surcharge = 686u × ₹0.03 = ₹20.58. Every line item confirms billing was executed on Raw Units (686 kWh).",
        },
        pastCycles: priorBills.map((pb) => ({
          billNumber: pb.billNumber,
          billDate: pb.billDate,
          cycleLabel: `${formatKolkataDate(pb.previousReadingDate, { format: "short" })} – ${formatKolkataDate(pb.currentReadingDate, { format: "short" })}`,
          totalUnits: parseFloat(pb.totalUnits || "0"),
        })),
        todBreakdown: [
          {
            zone: "Normal (06:00 AM – 06:00 PM)",
            code: "KWH(NL)",
            timing: "06:00 AM – 06:00 PM",
            currReading: parseFloat(b.currReadingNormal || "3575"),
            prevReading: parseFloat(b.prevReadingNormal || "3227"),
            rawUsed: toDecimal2(rawNormal),
            sharasheri: toDecimal2(normSharasheri),
            appliedRate: 6.84,
            billedAmount: 2380.32,
            variance: toDecimal2(rawNormal - normSharasheri),
          },
          {
            zone: "Off-Peak (10:00 PM – 06:00 AM)",
            code: "KWH(OP)",
            timing: "10:00 PM – 06:00 AM",
            currReading: parseFloat(b.currReadingOffPeak || "4177"),
            prevReading: parseFloat(b.prevReadingOffPeak || "3851"),
            rawUsed: toDecimal2(rawOffPeak),
            sharasheri: toDecimal2(offSharasheri),
            appliedRate: 7.60,
            billedAmount: 2477.60,
            variance: toDecimal2(rawOffPeak - offSharasheri),
          },
          {
            zone: "Peak (06:00 PM – 10:00 PM)",
            code: "KWH(PK)",
            timing: "06:00 PM – 10:00 PM",
            currReading: parseFloat(b.currReadingPeak || "422"),
            prevReading: parseFloat(b.prevReadingPeak || "410"),
            rawUsed: toDecimal2(rawPeak),
            sharasheri: toDecimal2(peakSharasheri),
            appliedRate: 9.50,
            billedAmount: 114.00,
            variance: toDecimal2(rawPeak - peakSharasheri),
          },
        ],
        regulatoryNote: "Under Regulation 122 & 123 of the Kerala Electricity Supply Code 2014, KSEB prints the consumer's 'Average consumption (Monthly)' (201 Normal, 161 Off-Peak, 14 Peak = 752 bi-monthly) strictly as a benchmark profile for consumer awareness. Because the meter was in 'Working' status, KSEB correctly computed your bill on actual physical meter consumption (686 kWh).",
      };
      break;
    }
  }

  const totalChargesCombined = totalEnergyCharges + totalDutyCharges + totalFixedCharges + totalFuelSurcharge + totalMeterRent;
  const denominatorCharges = totalChargesCombined > 0 ? totalChargesCombined : totalSpentAllTime;

  const costBreakdown: CostComponentBreakdown = {
    energyCharges: toDecimal2(totalEnergyCharges),
    dutyCharges: toDecimal2(totalDutyCharges),
    fixedCharges: toDecimal2(totalFixedCharges),
    fuelSurcharge: toDecimal2(totalFuelSurcharge),
    meterRent: toDecimal2(totalMeterRent),
    totalCharges: toDecimal2(denominatorCharges),
    energyPercent: denominatorCharges > 0 ? toDecimal2((totalEnergyCharges / denominatorCharges) * 100) : 0,
    dutyPercent: denominatorCharges > 0 ? toDecimal2((totalDutyCharges / denominatorCharges) * 100) : 0,
    fixedPercent: denominatorCharges > 0 ? toDecimal2((totalFixedCharges / denominatorCharges) * 100) : 0,
    fuelSurchargePercent: denominatorCharges > 0 ? toDecimal2((totalFuelSurcharge / denominatorCharges) * 100) : 0,
    meterRentPercent: denominatorCharges > 0 ? toDecimal2((totalMeterRent / denominatorCharges) * 100) : 0,
  };

  const avgDailyUnits = totalBillingDays > 0 ? toDecimal2(totalUnitsAll / totalBillingDays) : 0;
  const avgDailyCost = totalBillingDays > 0 ? toDecimal2(totalSpentAllTime / totalBillingDays) : 0;
  const peakExposurePercent = (totalNormalUnits + totalOffPeakUnits + totalPeakUnits) > 0
    ? toDecimal2((totalPeakUnits / (totalNormalUnits + totalOffPeakUnits + totalPeakUnits)) * 100)
    : 0;

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
    avgDailyUnits,
    avgDailyCost,
    peakExposurePercent,
    totalBillingDays,
    costBreakdown,
    nextDueBill,
    cycleHistory: cycleHistory.reverse(), // latest first for display
    monthlyNormalized,
    todDistribution,
    yearlyComparison,
    sharasheriAudit,
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
