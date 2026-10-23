import Papa from "papaparse";
import { formatKolkataDate } from "./formatters";

export function generateBillsCsv(bills: any[]): string {
  const data = bills.map((b) => ({
    "Bill Number": b.billNumber,
    "Consumer Number": b.consumerNumber || "",
    "Consumer Name": b.consumerName || "",
    "Bill Date": formatKolkataDate(b.billDate, { format: "dd-mm-yyyy" }),
    "Due Date": formatKolkataDate(b.dueDate, { format: "dd-mm-yyyy" }),
    "Disconnection Date": b.disconnectionDate ? formatKolkataDate(b.disconnectionDate, { format: "dd-mm-yyyy" }) : "",
    "Previous Reading Date": formatKolkataDate(b.previousReadingDate, { format: "dd-mm-yyyy" }),
    "Current Reading Date": formatKolkataDate(b.currentReadingDate, { format: "dd-mm-yyyy" }),
    "Billing Cycle Days": b.billingCycleDays || 60,
    "Total Consumed Units (kWh)": b.totalUnits,
    "Normal Units (kWh)": b.consumedUnitsNormal || "0.00",
    "Off-Peak Units (kWh)": b.consumedUnitsOffPeak || "0.00",
    "Peak Units (kWh)": b.consumedUnitsPeak || "0.00",
    "Energy Charge (INR)": b.energyCharge,
    "Electricity Duty (INR)": b.duty,
    "Fuel Surcharge (INR)": b.fuelSurcharge,
    "Fixed Charge (INR)": b.fixedCharge,
    "Meter Rent (INR)": b.meterRent,
    "Round Off (INR)": b.roundOff,
    "Arrears (INR)": b.arrears || "0.00",
    "Total Bill Amount (INR)": b.totalAmount,
    "Payable Amount (INR)": b.payableAmount,
    "Paid Amount (INR)": b.paidAmount,
    "Status": b.status,
    "Remarks": b.remarks || "",
  }));

  return Papa.unparse(data);
}

export function generatePaymentsCsv(payments: any[]): string {
  const data = payments.map((p) => ({
    "Payment ID": p.id,
    "Bill Number": p.billNumber || "",
    "Consumer Number": p.consumerNumber || "",
    "Consumer Name": p.consumerName || "",
    "Payment Date": formatKolkataDate(p.paymentDate, { format: "dd-mm-yyyy" }),
    "Amount Paid (INR)": p.amount,
    "Payment Method": p.paymentMethod,
    "Transaction Reference": p.transactionReference || "",
    "Receipt Number": p.receiptNumber || "",
    "Notes": p.notes || "",
  }));

  return Papa.unparse(data);
}
