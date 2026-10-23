import { describe, it, expect } from "vitest";
import {
  formatINR,
  formatIndianNumber,
  formatUnits,
  formatKolkataDate,
  getDaysDiff,
  toDecimal2,
} from "./formatters";

describe("Formatters Utility", () => {
  it("formats Indian Rupee correctly", () => {
    expect(formatINR(6020)).toContain("6,020.00");
    expect(formatINR("4971.92")).toContain("4,971.92");
    expect(formatINR(0)).toContain("0.00");
    expect(formatINR(null)).toContain("0.00");
  });

  it("formats Indian number system with commas correctly", () => {
    expect(formatIndianNumber(1234567, 0)).toBe("12,34,567");
    expect(formatIndianNumber(752, 0)).toBe("752");
    expect(formatIndianNumber(4971.92, 2)).toBe("4,971.92");
  });

  it("formats units (kWh)", () => {
    expect(formatUnits(752)).toBe("752 kWh");
    expect(formatUnits(0)).toBe("0 kWh");
  });

  it("formats dates in Asia/Kolkata", () => {
    const formatted = formatKolkataDate("2026-10-17");
    expect(formatted).toContain("17");
    expect(formatted).toContain("Oct");
    expect(formatted).toContain("2026");

    const ddMmYyyy = formatKolkataDate("2026-10-17", { format: "dd-mm-yyyy" });
    expect(ddMmYyyy).toBe("17-10-2026");
  });

  it("calculates difference in days between dates", () => {
    expect(getDaysDiff("2026-08-17", "2026-10-17")).toBe(61);
  });

  it("safely rounds decimals to 2 places", () => {
    expect(toDecimal2(4971.918)).toBe(4971.92);
    expect(toDecimal2("20.58")).toBe(20.58);
  });
});
