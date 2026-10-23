/**
 * Indian Rupee (INR) and Asia/Kolkata formatting utilities
 */

export const TIMEZONE = "Asia/Kolkata";

/**
 * Format a number or string into Indian Rupee format: e.g. ₹6,020.00
 */
export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "₹0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format number into Indian numbering system without currency symbol: e.g. 1,23,456.78
 */
export function formatIndianNumber(
  num: number | string | null | undefined,
  decimals: number = 2
): string {
  if (num === null || num === undefined || num === "") return "0";
  const val = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(val)) return "0";

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

/**
 * Format units (kWh)
 */
export function formatUnits(units: number | string | null | undefined): string {
  if (units === null || units === undefined || units === "") return "0 kWh";
  const val = typeof units === "string" ? parseFloat(units) : units;
  if (isNaN(val)) return "0 kWh";
  return `${formatIndianNumber(val, 0)} kWh`;
}

/**
 * Format date string (YYYY-MM-DD) into Indian readable date in Asia/Kolkata: e.g. "17 Oct 2026"
 */
export function formatKolkataDate(
  dateInput: string | Date | null | undefined,
  options?: { showDayOfWeek?: boolean; format?: "short" | "medium" | "full" | "dd-mm-yyyy" }
): string {
  if (!dateInput) return "—";

  let date: Date;
  if (typeof dateInput === "string") {
    // If format is YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split("-").map(Number);
      date = new Date(Date.UTC(year, month - 1, day, 6, 0, 0)); // midpoint in UTC
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) return String(dateInput);

  if (options?.format === "dd-mm-yyyy") {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const intlOptions: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    day: "numeric",
    month: options?.format === "full" ? "long" : "short",
    year: "numeric",
  };

  if (options?.showDayOfWeek) {
    intlOptions.weekday = "short";
  }

  return new Intl.DateTimeFormat("en-IN", intlOptions).format(date);
}

/**
 * Calculate difference in days between two YYYY-MM-DD dates
 */
export function getDaysDiff(fromDate: string, toDate: string): number {
  try {
    const d1 = new Date(fromDate);
    const d2 = new Date(toDate);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Check if a due date is upcoming or overdue compared to current date in Asia/Kolkata
 */
export function getDueStatus(dueDateStr: string): {
  isOverdue: boolean;
  daysRemaining: number;
  label: string;
} {
  try {
    const now = new Date();
    // Get today's YYYY-MM-DD in Asia/Kolkata
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const todayStr = formatter.format(now); // produces YYYY-MM-DD
    const daysRemaining = getDaysDiff(todayStr, dueDateStr);

    if (daysRemaining < 0) {
      return {
        isOverdue: true,
        daysRemaining,
        label: `Overdue by ${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? "day" : "days"}`,
      };
    } else if (daysRemaining === 0) {
      return {
        isOverdue: false,
        daysRemaining: 0,
        label: "Due today",
      };
    } else {
      return {
        isOverdue: false,
        daysRemaining,
        label: `Due in ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"}`,
      };
    }
  } catch {
    return { isOverdue: false, daysRemaining: 0, label: "—" };
  }
}

/**
 * Safely parse numeric float with 2 decimal precision
 */
export function toDecimal2(val: number | string | null | undefined): number {
  if (val === null || val === undefined || val === "") return 0;
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return 0;
  return Math.round(n * 100) / 100;
}
