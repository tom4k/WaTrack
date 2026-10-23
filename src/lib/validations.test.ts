import { describe, it, expect } from "vitest";
import { billSchema, paymentSchema, consumerSchema, loginSchema } from "./validations";

describe("Validation Schemas", () => {
  it("validates KSEB bill schema", () => {
    const validBill = {
      consumerId: "cons-123",
      billNumber: "5624261012132",
      billArea: "B02/15/114",
      billDate: "2026-10-17",
      dueDate: "2026-10-27",
      previousReadingDate: "2026-08-17",
      currentReadingDate: "2026-10-17",
      totalUnits: 752,
      energyCharge: "4971.92",
      duty: "497.19",
      fuelSurcharge: "20.58",
      fixedCharge: "500.00",
      meterRent: "30.00",
      roundOff: "0.31",
      totalAmount: "6020.00",
      payableAmount: "6020.00",
    };

    const res = billSchema.safeParse(validBill);
    expect(res.success).toBe(true);
  });

  it("fails bill validation on bad dates or missing fields", () => {
    const badBill = {
      consumerId: "",
      billNumber: "",
      billDate: "17-10-2026", // Wrong format: needs YYYY-MM-DD
    };

    const res = billSchema.safeParse(badBill);
    expect(res.success).toBe(false);
  });

  it("validates payment schema", () => {
    const validPayment = {
      billId: "bill-123",
      paymentDate: "2026-10-20",
      amount: 6020,
      paymentMethod: "KSEB Online Portal",
      transactionReference: "TXN-998811",
    };

    const res = paymentSchema.safeParse(validPayment);
    expect(res.success).toBe(true);
  });

  it("validates consumer schema", () => {
    const validConsumer = {
      consumerNumber: "1156241018150",
      name: "KURIAKOSE ALEXANDER",
      sectionName: "Pala Section-5624",
      connectedLoad: "10 kW",
      phase: "3 Phase",
    };

    const res = consumerSchema.safeParse(validConsumer);
    expect(res.success).toBe(true);
  });
});
